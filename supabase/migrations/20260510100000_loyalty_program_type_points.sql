-- Program type for dashboard grouping + optional numeric points per account for sums.
-- Idempotent guards for loyalty columns added in earlier migrations (safe if already applied).
ALTER TABLE public.loyalty_accounts
  ADD COLUMN IF NOT EXISTS login_password text;

ALTER TABLE public.loyalty_accounts
  ADD COLUMN IF NOT EXISTS login_url text;

ALTER TABLE public.loyalty_programs
  ADD COLUMN IF NOT EXISTS program_type text NOT NULL DEFAULT 'Other'
    CHECK (program_type IN ('Airline', 'Hotel', 'Credit Card', 'Car Rental', 'Other'));

COMMENT ON COLUMN public.loyalty_programs.program_type IS
  'High-level bucket: Airline, Hotel, Credit Card, Car Rental; Other for portals/dining/legacy.';

UPDATE public.loyalty_programs SET program_type = CASE category
  WHEN 'airline' THEN 'Airline'
  WHEN 'hotel' THEN 'Hotel'
  WHEN 'credit_card' THEN 'Credit Card'
  ELSE 'Other'
END;

-- Car rentals when added: set program_type = 'Car Rental' in Table Editor or seed.

ALTER TABLE public.loyalty_accounts
  ADD COLUMN IF NOT EXISTS points_balance bigint
    CHECK (points_balance IS NULL OR points_balance >= 0);

COMMENT ON COLUMN public.loyalty_accounts.points_balance IS
  'Optional whole points/miles for household dashboard sums; balance_display remains the human-readable note.';
