# Supabase setup checklist (Spann Travel)

Part of the full path in **[`APP_BUILD_CHECKLIST.md`](./APP_BUILD_CHECKLIST.md)**. Complete **A → F** here when you reach Phase 2 of that doc.

Work top to bottom and tick boxes (`[ ]` → `[x]`) as you finish each item in Git.

UI labels shift over time — if wording differs slightly, match the intent (same sidebar areas).

---

## A · Create the project

- [ ] Log in at [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] **New project** — pick org, region, database password (store securely)
- [ ] Wait until project status is healthy (database + API ready)

---

## B · Email auth (matches current app login)

- [ ] **Authentication → Providers → Email** — enabled
- [ ] Optional (faster MVP): turn **off** “Confirm email” / use instant sign-up (you can tighten later)
- [ ] Confirm you are **not** relying on OAuth for first login (optional providers can stay off)

---

## C · Project URL + API keys → `web/.env.local`

Supabase separates **Project URL** and **keys** onto different screens. This app expects two vars (see `web/.env.example`):

| Env var | What it is |
|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your project API host: `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The **legacy anon (JWT)** public key — see step C2 below |

### C1 · Project URL (if you don’t see “Project URL” by name)

Try in order — one of these always exposes the same host:

- [ ] **Project Settings** (gear) → **General** — look for **Reference ID** / **Project URL** / **Configuration** text that includes `https://….supabase.co`
- [ ] Project **home / Overview** — often a **Connect** or **Connect to your project** control; the dialog lists the API URL
- [ ] **Project Settings → Data API** (or **API** in older layouts) — connection info may show the base URL
- [ ] **SQL Editor** — small project menu or header sometimes links to project ref; URL format is always:  
  `https://<project-ref>.supabase.co`  
  (`project-ref` is the short id in your dashboard URL: `supabase.com/dashboard/project/<project-ref>`)

Set in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
```

### C2 · Public key this repo uses (**legacy anon**, not publishable branding yet)

Supabase moved to **Publishable** / **Secret** keys (`sb_publishable_…`, `sb_secret_…`). The Spann Travel app is wired like standard Supabase + Next tutorials: **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** = the **JWT-style anon key**.

- [ ] Open **Project Settings → API Keys**
- [ ] Switch the tab to **`Legacy anon, service_role API keys`** (or similarly named “Legacy” tab)
- [ ] Copy the **`anon` `public`** key (starts with **`eyJ`**) → that value is **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
- [ ] **Do not** put the **`service_role`** secret in any `NEXT_PUBLIC_*` var or in client code
- [ ] On the same page, the new **Secret** key (`sb_secret_…`) is also **not** for this Next.js client env — ignore for MVP

If you only use the new **Publishable** key: stay on **legacy anon** for this project until the app/SDK migration is documented otherwise.

### C3 · Local env file

- [ ] In repo: `cd web/` → copy `.env.example` → `.env.local`
- [ ] Paste **`NEXT_PUBLIC_SUPABASE_URL`** and **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** (steps C1 + C2)
- [ ] **Do not** commit `.env.local` (gitignored)
- [ ] **Vercel later:** same two variable **names** and values in Project → Environment Variables

---

## D · Schema, RLS, signup trigger & seeds (run once)

- [ ] **SQL Editor** → new query
- [ ] Paste full file: `supabase/migrations/20260506230000_initial_schema.sql`
- [ ] **Run**
- [ ] If you **already** applied an **older** copy of that file and **Checklists** shows `infinite recursion detected in policy for relation "profiles"`, run **`supabase/migrations/20260507090000_fix_profiles_rls_recursion.sql`** once in SQL Editor (safe to re-run policies + function)
- [ ] **Phase 8 (MVP modules):** run **`supabase/migrations/20260509100000_phase8_loyalty_trips_ideas.sql`** once — adds `loyalty_programs`, `loyalty_accounts`, `trips`, `travel_ideas` + RLS
- [ ] **Loyalty website passwords (optional column):** run **`supabase/migrations/20260509120000_loyalty_login_password.sql`** once — adds `loyalty_accounts.login_password`
- [ ] **Loyalty login link (optional column):** run **`supabase/migrations/20260509130000_loyalty_login_url.sql`** once — adds `loyalty_accounts.login_url`
- [ ] No other errors (if trigger syntax fails on your Postgres build, adjust `EXECUTE FUNCTION` / `EXECUTE PROCEDURE` per SQL Editor message and re-run only the failing statements—or ask in-repo)
- [ ] **Table Editor** — confirm tables exist: `households`, `profiles`, `checklist_lists`, `checklist_items`, plus after Phase 8 migration: `loyalty_programs`, `loyalty_accounts`, `trips`, `travel_ideas`

---

## E · Verify behavior after first user

Do **either** sign up from the app (`/login`) **or** create a user in **Authentication → Users**, then confirm data:

- [ ] Row in `profiles` for that user (`role` should become `admin` for first signup via trigger flow)
- [ ] Row in `households` linked from `profiles.household_id`
- [ ] Three rows in `checklist_lists` (slugs `immediate`, `plan_30d`, `monthly`)
- [ ] Multiple rows in `checklist_items` (playbook seed)
- [ ] Quick SQL sanity check OK, e.g. `SELECT COUNT(*) FROM checklist_items;` → **> 0**

---

## F · Tie the running app to this project

- [ ] From `web/`: `npm install` then `npm run dev`
- [ ] Open http://localhost:3000 → **Sign in** (or **Create household** → then sign in)
- [ ] **Dashboard** shows progress; **Checklists** loads and toggles persist

---

## After Supabase · Common follow-ups

- [ ] Duplicate the two `NEXT_PUBLIC_*` vars into **Vercel → Environment Variables** (deploy with **Root Directory** `web`)
- [ ] Second spouse sharing one household → see `docs/CHECKLISTS.md` (manual `profiles.household_id` until invite UI ships)
