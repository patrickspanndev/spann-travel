-- Optional website password per loyalty account (household trust + RLS).
-- Prefer a dedicated password manager for high-sensitivity credentials.

ALTER TABLE public.loyalty_accounts
  ADD COLUMN IF NOT EXISTS login_password text;

COMMENT ON COLUMN public.loyalty_accounts.login_password IS
  'Optional program website password; readable by household members via RLS — prefer external vault when possible.';
