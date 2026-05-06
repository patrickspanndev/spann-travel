# Supabase setup checklist (Spann Travel)

Part of the full path in **[`APP_BUILD_CHECKLIST.md`](./APP_BUILD_CHECKLIST.md)**. Complete **A → F** here when you reach Phase 2 of that doc.

Work top to bottom and tick boxes (`[ ]` → `[x]`) as you finish each item in Git.

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

## C · API keys → local env (+ later Vercel)

- [ ] **Project Settings → API** — copy **Project URL**
- [ ] Same page — copy **anon public** key (not `service_role`)
- [ ] In repo: `cd web/` → copy `.env.example` → `.env.local`
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- [ ] **Do not** commit `.env.local` (already ignored)
- [ ] **Do not** put `service_role` in Next.js client env unless you intentionally add guarded server-only usage later

---

## D · Schema, RLS, signup trigger & seeds (run once)

- [ ] **SQL Editor** → new query
- [ ] Paste full file: `supabase/migrations/20260506230000_initial_schema.sql`
- [ ] **Run**
- [ ] No errors (if trigger syntax fails on your Postgres build, adjust `EXECUTE FUNCTION` / `EXECUTE PROCEDURE` per SQL Editor message and re-run only the failing statements—or ask in-repo)
- [ ] **Table Editor** — confirm tables exist: `households`, `profiles`, `checklist_lists`, `checklist_items`

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
