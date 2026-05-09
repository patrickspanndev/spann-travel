# spann-travel

## Spann Travel — Household travel operating system

Private Next.js dashboard for loyalty strategy, checklists (immediate / 30-day / monthly), trips, inspiration, and strategy views — **no photo archive** here (that remains `~/ai_dev/spannArchives`).

### Repo layout

| Path | Purpose |
|------|---------|
| `web/` | Next.js 16 · App Router · Tailwind v4 · Supabase Auth + Postgres RLS |
| `supabase/migrations/` | SQL you apply manually in Supabase (or sync via CLI) |
| `docs/APP_BUILD_CHECKLIST.md` | **Full build path:** repo → Supabase → local → Vercel → MVP backlog |
| `docs/SPANN_TRAVEL_RUNBOOK.md` | **Maintainer runbook:** quick ref, routines, platforms (Archives-style) |
| `docs/PROJECT_PROGRESS.md` | Maintainer milestone ledger (keep in sync with build checklist) |
| `docs/CHECKLISTS.md` | How household checklists behave + reset / join patterns |
| `docs/SUPABASE_SETUP_CHECKLIST.md` | Supabase-only deep checklist |
| `docs/LOYALTY_BEST_PRACTICES.md` | Manual loyalty tracking rhythm, credentials, masking, roles |
| `app_prompt.txt` | Original UX + feature brief |

### One-time prerequisites (full sequence)

Use **`docs/APP_BUILD_CHECKLIST.md`** — ordered checkboxes from clone through production and MVP modules. Supabase detail lives in **`docs/SUPABASE_SETUP_CHECKLIST.md`**. Ongoing ops quick reference: **`docs/SPANN_TRAVEL_RUNBOOK.md`**.

### Daily development

```bash
cd ~/ai_dev/spannTravel/web
npm install    # once
npm run dev    # http://localhost:3000
```

### Routing + auth gates

`/login`, `/dashboard`, `/checklists`, plus stub routes for Loyalty, Trips, Ideas, Strategy, Settings. Middleware (`web/middleware.ts`) blocks protected routes unless Supabase session cookies exist. When env vars are missing, `/` shows setup instructions rather than looping redirects.

### Deployment (Vercel)

1. Create GitHub repo (monorepo root is `~/ai_dev/spannTravel`).
2. New Vercel project → **Root directory** `web` (matches `spannArchives`).
3. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. `git push origin main`.

### Maintainer documentation

Primary: **`docs/APP_BUILD_CHECKLIST.md`**. Maintainer ops: **`docs/SPANN_TRAVEL_RUNBOOK.md`**. Track major milestones in **`docs/PROJECT_PROGRESS.md`**. Supabase drill-down: **`docs/SUPABASE_SETUP_CHECKLIST.md`**. Checklist ops: **`docs/CHECKLISTS.md`**. Loyalty hygiene: **`docs/LOYALTY_BEST_PRACTICES.md`**.
