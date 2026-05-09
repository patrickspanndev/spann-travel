-- Optional direct link to the program's member / sign-in page.

ALTER TABLE public.loyalty_accounts
  ADD COLUMN IF NOT EXISTS login_url text;

COMMENT ON COLUMN public.loyalty_accounts.login_url IS
  'HTTPS URL to program login or account home (validated in app as http(s) only).';
