-- Phase 8 MVP: loyalty catalog + accounts, trips, travel ideas + household RLS

--------------------------------------------------------------------------------
CREATE TABLE public.loyalty_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL
    CHECK (category IN ('airline', 'hotel', 'credit_card', 'portal', 'dining', 'other')),
  alliance text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.loyalty_programs (slug, name, category, alliance, sort_order) VALUES
  ('amex-membership-rewards', 'American Express Membership Rewards', 'credit_card', NULL, 10),
  ('chase-ultimate-rewards', 'Chase Ultimate Rewards', 'credit_card', NULL, 11),
  ('united-mileageplus', 'United MileagePlus', 'airline', 'Star Alliance', 20),
  ('delta-skymiles', 'Delta SkyMiles', 'airline', 'SkyTeam', 21),
  ('flying-blue', 'Flying Blue (Air France-KLM)', 'airline', 'SkyTeam', 22),
  ('aeroplan', 'Air Canada Aeroplan', 'airline', 'Star Alliance', 23),
  ('alaska-mileage-plan', 'Alaska Mileage Plan', 'airline', 'Oneworld partner', 24),
  ('british-airways-avios', 'British Airways Avios', 'airline', 'Oneworld', 25),
  ('jal-mileage-bank', 'JAL Mileage Bank', 'airline', 'Oneworld', 26),
  ('marriott-bonvoy', 'Marriott Bonvoy', 'hotel', NULL, 30),
  ('world-of-hyatt', 'World of Hyatt', 'hotel', NULL, 31),
  ('hilton-honors', 'Hilton Honors', 'hotel', NULL, 32),
  ('ihg-one-rewards', 'IHG One Rewards', 'hotel', NULL, 33),
  ('rakuten', 'Rakuten', 'portal', NULL, 40),
  ('mileageplus-shopping', 'MileagePlus Shopping', 'portal', NULL, 41),
  ('skymiles-shopping', 'SkyMiles Shopping', 'portal', NULL, 42),
  ('mileageplus-dining', 'MileagePlus Dining', 'dining', NULL, 50),
  ('skymiles-dining', 'SkyMiles Dining', 'dining', NULL, 51),
  ('marriott-eat-around-town', 'Marriott Eat Around Town', 'dining', NULL, 52)
ON CONFLICT (slug) DO NOTHING;

--------------------------------------------------------------------------------
CREATE TABLE public.loyalty_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households (id) ON DELETE CASCADE,
  traveler_profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  loyalty_program_id uuid NOT NULL REFERENCES public.loyalty_programs (id) ON DELETE RESTRICT,
  member_id_hint text,
  login_email_hint text,
  balance_display text,
  tier text,
  notes text,
  last_reviewed_at date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (traveler_profile_id, loyalty_program_id)
);

CREATE INDEX loyalty_accounts_household_id_idx ON public.loyalty_accounts (household_id);

CREATE OR REPLACE FUNCTION public.enforce_loyalty_account_traveler_household()
RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = NEW.traveler_profile_id
      AND p.household_id = NEW.household_id
  ) THEN
    RAISE EXCEPTION 'traveler must belong to the same household';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS loyalty_accounts_traveler_household ON public.loyalty_accounts;
CREATE TRIGGER loyalty_accounts_traveler_household
  BEFORE INSERT OR UPDATE ON public.loyalty_accounts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_loyalty_account_traveler_household();

DROP TRIGGER IF EXISTS loyalty_accounts_updated_at ON public.loyalty_accounts;
CREATE TRIGGER loyalty_accounts_updated_at
  BEFORE UPDATE ON public.loyalty_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

--------------------------------------------------------------------------------
CREATE TABLE public.trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households (id) ON DELETE CASCADE,
  name text NOT NULL,
  destination text,
  start_date date,
  end_date date,
  travelers_note text,
  purpose text NOT NULL DEFAULT 'vacation'
    CHECK (purpose IN ('vacation', 'family', 'anniversary', 'international', 'luxury', 'getaway', 'other')),
  status text NOT NULL DEFAULT 'idea'
    CHECK (status IN ('idea', 'researching', 'ready_to_book', 'booked', 'completed')),
  target_airline_programs text,
  target_hotel_programs text,
  est_cash_usd numeric(12, 2),
  est_points_note text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX trips_household_id_idx ON public.trips (household_id);
CREATE INDEX trips_status_idx ON public.trips (household_id, status);

DROP TRIGGER IF EXISTS trips_updated_at ON public.trips;
CREATE TRIGGER trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

--------------------------------------------------------------------------------
CREATE TABLE public.travel_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households (id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'other'
    CHECK (category IN (
      'dining', 'resort', 'museum', 'anniversary', 'show', 'attraction',
      'family', 'tour', 'beach', 'japan', 'europe', 'luxury', 'other'
    )),
  url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX travel_ideas_household_id_idx ON public.travel_ideas (household_id);
CREATE INDEX travel_ideas_category_idx ON public.travel_ideas (household_id, category);

DROP TRIGGER IF EXISTS travel_ideas_updated_at ON public.travel_ideas;
CREATE TRIGGER travel_ideas_updated_at
  BEFORE UPDATE ON public.travel_ideas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

--------------------------------------------------------------------------------
-- RLS: global read for program catalog
ALTER TABLE public.loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY loyalty_programs_select ON public.loyalty_programs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY loyalty_accounts_select ON public.loyalty_accounts
  FOR SELECT TO authenticated
  USING (household_id IS NOT DISTINCT FROM public.requester_household_id());

CREATE POLICY loyalty_accounts_insert ON public.loyalty_accounts
  FOR INSERT TO authenticated
  WITH CHECK (
    household_id IS NOT DISTINCT FROM public.requester_household_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
        AND p.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  );

CREATE POLICY loyalty_accounts_update ON public.loyalty_accounts
  FOR UPDATE TO authenticated
  USING (
    household_id IS NOT DISTINCT FROM public.requester_household_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
        AND p.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  )
  WITH CHECK (
    household_id IS NOT DISTINCT FROM public.requester_household_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
        AND p.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  );

CREATE POLICY loyalty_accounts_delete ON public.loyalty_accounts
  FOR DELETE TO authenticated
  USING (
    household_id IS NOT DISTINCT FROM public.requester_household_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
        AND p.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  );

CREATE POLICY trips_select ON public.trips FOR SELECT TO authenticated
  USING (household_id IS NOT DISTINCT FROM public.requester_household_id());

CREATE POLICY trips_insert ON public.trips FOR INSERT TO authenticated
  WITH CHECK (
    household_id IS NOT DISTINCT FROM public.requester_household_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
        AND p.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  );

CREATE POLICY trips_update ON public.trips FOR UPDATE TO authenticated
  USING (
    household_id IS NOT DISTINCT FROM public.requester_household_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
        AND p.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  )
  WITH CHECK (
    household_id IS NOT DISTINCT FROM public.requester_household_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
        AND p.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  );

CREATE POLICY trips_delete ON public.trips FOR DELETE TO authenticated
  USING (
    household_id IS NOT DISTINCT FROM public.requester_household_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
        AND p.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  );

CREATE POLICY travel_ideas_select ON public.travel_ideas FOR SELECT TO authenticated
  USING (household_id IS NOT DISTINCT FROM public.requester_household_id());

CREATE POLICY travel_ideas_insert ON public.travel_ideas FOR INSERT TO authenticated
  WITH CHECK (
    household_id IS NOT DISTINCT FROM public.requester_household_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
        AND p.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  );

CREATE POLICY travel_ideas_update ON public.travel_ideas FOR UPDATE TO authenticated
  USING (
    household_id IS NOT DISTINCT FROM public.requester_household_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
        AND p.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  )
  WITH CHECK (
    household_id IS NOT DISTINCT FROM public.requester_household_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
        AND p.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  );

CREATE POLICY travel_ideas_delete ON public.travel_ideas FOR DELETE TO authenticated
  USING (
    household_id IS NOT DISTINCT FROM public.requester_household_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
        AND p.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  );
