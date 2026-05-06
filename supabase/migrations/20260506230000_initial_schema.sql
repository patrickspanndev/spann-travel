-- Spann Travel — households, profiles, checklists + RLS
-- Apply in Supabase: Dashboard → SQL → New query → paste → Run once per project.

--------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

--------------------------------------------------------------------------------
CREATE TABLE public.households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Household',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  household_id uuid NOT NULL REFERENCES public.households (id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'member'
    CHECK (role IN ('admin', 'member', 'viewer')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX profiles_household_id_idx ON public.profiles (household_id);

CREATE TABLE public.checklist_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households (id) ON DELETE CASCADE,
  slug text NOT NULL CHECK (slug IN ('immediate', 'plan_30d', 'monthly')),
  title text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, slug)
);

CREATE INDEX checklist_lists_household_id_idx ON public.checklist_lists (household_id);

CREATE TABLE public.checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_list_id uuid NOT NULL REFERENCES public.checklist_lists (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  week_number int CHECK (week_number IS NULL OR (week_number >= 1 AND week_number <= 4)),
  sort_order int NOT NULL DEFAULT 0,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX checklist_items_list_id_idx ON public.checklist_items (checklist_list_id);

--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS checklist_items_updated_at ON public.checklist_items;
CREATE TRIGGER checklist_items_updated_at
  BEFORE UPDATE ON public.checklist_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.seed_checklists_for_household(target uuid)
RETURNS void AS $$
DECLARE
  list_immediate uuid;
  list_30 uuid;
  list_month uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM public.checklist_lists WHERE household_id = target) THEN
    RETURN;
  END IF;

  INSERT INTO public.checklist_lists (household_id, slug, title, sort_order)
  VALUES
    (target, 'immediate', 'Immediate execution checklist', 0),
    (target, 'plan_30d', '30-day execution plan', 1),
    (target, 'monthly', 'Monthly rewards rhythm', 2);

  SELECT id INTO list_immediate FROM public.checklist_lists
    WHERE household_id = target AND slug = 'immediate';
  SELECT id INTO list_30 FROM public.checklist_lists
    WHERE household_id = target AND slug = 'plan_30d';
  SELECT id INTO list_month FROM public.checklist_lists
    WHERE household_id = target AND slug = 'monthly';

  INSERT INTO public.checklist_items (checklist_list_id, title, description, week_number, sort_order)
  VALUES
    (list_immediate, 'Create Flying Blue accounts for both spouses', NULL, NULL, 1),
    (list_immediate, 'Attach Flying Blue number to existing Air France reservation', NULL, NULL, 2),
    (list_immediate, 'Verify United and Delta accounts', NULL, NULL, 3),
    (list_immediate, 'Create Aeroplan accounts', NULL, NULL, 4),
    (list_immediate, 'Create Alaska, British Airways Avios, and JAL accounts', NULL, NULL, 5),
    (list_immediate, 'Create Hyatt and Hilton accounts', NULL, NULL, 6),
    (list_immediate, 'Verify Marriott accounts', NULL, NULL, 7),
    (list_immediate, 'Create IHG accounts', NULL, NULL, 8),
    (list_immediate, 'Configure Rakuten for AMEX Membership Rewards', NULL, NULL, 9),
    (list_immediate, 'Register for MileagePlus Dining, SkyMiles Dining, and Marriott Eat Around Town', NULL, NULL, 10),
    (list_immediate, 'Activate United MileagePlus Shopping and Delta SkyMiles Shopping', NULL, NULL, 11),
    (list_immediate, 'Evaluate Chase Sapphire Preferred', NULL, NULL, 12),
    (list_30, 'Week 1: account creation — finish core airline/hotel/portal registrations', NULL, 1, 1),
    (list_30, 'Week 2: rewards multiplier setup — dining/shopping portals and Rakuten', NULL, 2, 2),
    (list_30, 'Week 3: AMEX/Chase/category audit — map spend to multiplier strategy', NULL, 3, 3),
    (list_30, 'Week 4: card strategy and first redemption goal', NULL, 4, 4),
    (list_month, 'Review AMEX transfer bonuses', NULL, NULL, 1),
    (list_month, 'Review airline transfer bonuses', NULL, NULL, 2),
    (list_month, 'Review Marriott promotions', NULL, NULL, 3),
    (list_month, 'Review Hyatt promotions', NULL, NULL, 4),
    (list_month, 'Review Rakuten bonus periods', NULL, NULL, 5),
    (list_month, 'Activate Chase Freedom categories when announced', NULL, NULL, 6),
    (list_month, 'Review AMEX Offers', NULL, NULL, 7),
    (list_month, 'Track upcoming trips (dates + programs)', NULL, NULL, 8),
    (list_month, 'Confirm award availability before any point transfers', NULL, NULL, 9);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.seed_checklists_for_household IS
  'Idempotent playbook seed: immediate, 30-day (week numbers), monthly items.';

--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  hid uuid;
  display text;
BEGIN
  display := COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(COALESCE(NEW.email, ''), '@', 1));
  INSERT INTO public.households (name) VALUES ('Household')
    RETURNING id INTO hid;

  INSERT INTO public.profiles (id, household_id, display_name, role)
  VALUES (NEW.id, hid, COALESCE(NULLIF(trim(display), ''), 'Travel'), 'admin');

  PERFORM public.seed_checklists_for_household(hid);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

--------------------------------------------------------------------------------
-- RLS helper: read requester's household without recursive profiles policies
CREATE OR REPLACE FUNCTION public.requester_household_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.household_id
  FROM public.profiles p
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.requester_household_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.requester_household_id() TO authenticated;

--------------------------------------------------------------------------------
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY households_select_own ON public.households FOR SELECT TO authenticated
  USING (id IS NOT DISTINCT FROM public.requester_household_id());

CREATE POLICY households_update_own_admin ON public.households FOR UPDATE TO authenticated
  USING (
    id IS NOT DISTINCT FROM public.requester_household_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
        AND p.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  )
  WITH CHECK (
    id IS NOT DISTINCT FROM public.requester_household_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
        AND p.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  );

CREATE POLICY profiles_select_household ON public.profiles FOR SELECT TO authenticated
  USING (household_id IS NOT DISTINCT FROM public.requester_household_id());

CREATE POLICY profiles_insert_own_only ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY checklist_lists_select ON public.checklist_lists FOR SELECT TO authenticated
  USING (household_id IS NOT DISTINCT FROM public.requester_household_id());

CREATE POLICY checklist_lists_insert ON public.checklist_lists FOR INSERT TO authenticated
  WITH CHECK (
    household_id IS NOT DISTINCT FROM public.requester_household_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
        AND p.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  );

CREATE POLICY checklist_lists_update ON public.checklist_lists FOR UPDATE TO authenticated
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

CREATE POLICY checklist_lists_delete ON public.checklist_lists FOR DELETE TO authenticated
  USING (
    household_id IS NOT DISTINCT FROM public.requester_household_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
        AND p.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  );

CREATE POLICY checklist_items_select ON public.checklist_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.checklist_lists cl
      WHERE cl.id = checklist_items.checklist_list_id
        AND cl.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  );

CREATE POLICY checklist_items_insert ON public.checklist_items FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
    )
    AND EXISTS (
      SELECT 1 FROM public.checklist_lists cl
      WHERE cl.id = checklist_items.checklist_list_id
        AND cl.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  );

CREATE POLICY checklist_items_update ON public.checklist_items FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
    )
    AND EXISTS (
      SELECT 1 FROM public.checklist_lists cl
      WHERE cl.id = checklist_items.checklist_list_id
        AND cl.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
    )
    AND EXISTS (
      SELECT 1 FROM public.checklist_lists cl
      WHERE cl.id = checklist_items.checklist_list_id
        AND cl.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  );

CREATE POLICY checklist_items_delete ON public.checklist_items FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
    )
    AND EXISTS (
      SELECT 1 FROM public.checklist_lists cl
      WHERE cl.id = checklist_items.checklist_list_id
        AND cl.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  );
