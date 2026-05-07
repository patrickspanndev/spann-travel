# Daily summary — 2026-05-06 (Spann Travel)

Structured recap of workspace work toward the household travel dashboard (repo + Supabase + Vercel onboarding).

---

## 1. Architectural decisions made

- **Stack:** Next.js (App Router) + Tailwind + **Supabase** (Email/password Auth, Postgres, RLS); deploy target **Vercel** with **root directory `web`**, aligned with **`family-archive`** layout.
- **Not** reused for this product: Archives stack (Turso/R2/media). **No in-app photo archive** — memories stay **`spannArchives`**.
- **Tenancy:** `household_id` on relational data; **`profiles` = Auth identity** (one row per logged-in user). One shared household login is intentional; spouses differ in future **loyalty/account** rows, not as duplicate `profiles` without a second Auth user.

---

## 2. Implementation changes

- **Repo:** [`patrickspanndev/spann-travel`](https://github.com/patrickspanndev/spann-travel), clone path `~/ai_dev/spannTravel`, app in **`web/`**, **`git remote`** SSH `git@github.com:patrickspanndev/spann-travel.git`.
- **DB (Supabase migrations):**
  - `20260506230000_initial_schema.sql` — `households`, `profiles`, `checklist_lists`, `checklist_items`, triggers (`handle_new_user` + playbook seed `seed_checklists_for_household`), RLS; later amended to introduce **`requester_household_id()`** + non-recursive policies.
  - `20260507090000_fix_profiles_rls_recursion.sql` — **patch for existing databases** hitting infinite recursion on `profiles` SELECT policy.
- **App:** Middleware session refresh + auth gates; **`/dashboard`**, **`/checklists`**, **`/login`**, stubs (loyalty, trips, ideas, strategy, settings); server action **`toggleChecklistItem`**; Supabase helpers under `web/src/lib/supabase/`.
- **Docs:** `docs/APP_BUILD_CHECKLIST.md`, `docs/SUPABASE_SETUP_CHECKLIST.md` (URL vs **API Keys** page, **legacy anon `eyJ…`** tab), `docs/CHECKLISTS.md`, `docs/PROJECT_PROGRESS.md`; `README.md` cross-links; `web/.env.example` clarified.

---

## 3. Problems solved

| Issue | Resolution |
|------|-------------|
| `npm run dev` ENOENT | Run from **`~/ai_dev/spannTravel/web`** (no root `package.json`). |
| “Invalid credentials” using Supabase **account** email | App uses **project Auth users** → sign up via **`/login`**, not supabase.com password. |
| Checklists error: **`infinite recursion … relation "profiles"`** | **`profiles`** policy queried **`profiles`** in subquery → replaced with **`requester_household_id()`** (SECURITY DEFINER) + policy rewrites + checklist policies aligned. |
| **Project URL** not under API Keys | Documented:** General / Overview → Connect**, or `https://<project-ref>.supabase.co` from dashboard URL path. |
| **API Keys UI** (“Publishable”) vs tutorials | **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** = legacy **anon JWT** (**Legacy** tab); not `sb_secret_`. |
| `next build` /login prerender crashed without env | **`LoginForm`** no longer constructs browser Supabase client in `useMemo` on SSR; client created only inside submit handler. |
| HTTPS push from agent | Ran **`git push`** from user Mac with SSH. |

Production **“Failed to fetch”** on sign-in:** documented** as Vercel **env + redeploy** + Supabase **Site URL**/redirect hygiene (not verified closed in-chat).

---

## 4. Debug lessons learned

- **Postgres RLS:** A policy on table `T` that runs `SELECT` from `T` under the same role can recurse; use **`SECURITY DEFINER`** helper that reads **`profiles`** without RLS, or redesign policies without self-subqueries on guarded tables.
- **Supabase dashboard drift:** Labels move (**API Keys** vs **Project Settings → API**); legacy keys live on a dedicated tab.
- **Multi-secret confusion:** Dashboard login ≠ **Auth** users ≠ **`service_role`**.

---

## 5. Current system state

- **Local:** Steps 1–6 reported **good**: env in **`web/.env.local`**, migration + RLS fix applied, **Dashboard** / **Checklists** working post-fix.
- **GitHub `main`:** Includes RLS recursion fix (**`6156422`**) plus doc/env.example tweak (**`42ef8ef`**).
- **Vercel:** Project intended with **Root Directory `web`**; production sign-in showed **Failed to fetch** pending env/redeploy/supabase URL config verification.

---

## 6. Open technical threads

- Confirm **Production** **`NEXT_PUBLIC_SUPABASE_*`** on Vercel and **Redeploy** after changes.
- **Authentication → URL configuration** on Supabase: **Site URL** + redirect allowlist including prod (and localhost for dev).
- **Product MVP backlog** untouched in code:** loyalty**, **trips**, **travel ideas**, **strategy** (see `app_prompt.txt` / `APP_BUILD_CHECKLIST.md` Phase 8).
- **Second Auth user → same household:** still manual **`profiles.household_id`** per `docs/CHECKLISTS.md` until invite UX exists.

---

## 7. Risks or constraints identified

- Never commit **`web/.env.local`** or **`service_role`**; **`NEXT_PUBLIC_*`** exposes anon key only (RLS remains the barrier).
- **Legacy vs new Supabase keys:** app assumes **JWT anon**; migrating to **`sb_publishable_`**-only would need explicit SDK/App changes.
- **Single shared password** for household — acceptable for MVP; weakest link is credential hygiene, not Postgres.
