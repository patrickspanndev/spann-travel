# spann-travel

## Spann Travel — Household travel operating system

Private Next.js dashboard for loyalty strategy, checklists (immediate / 30-day / monthly), trips, inspiration, and strategy views — **no photo archive** here (that remains `~/ai_dev/spannArchives`).

### Repo layout

| Path | Purpose |
|------|---------|
| `web/` | Next.js 16 · App Router · Tailwind v4 · Supabase Auth + Postgres RLS |
| `supabase/migrations/` | SQL you apply manually in Supabase (or sync via CLI) |
| `docs/PROJECT_PROGRESS.md` | Maintainer checklist tracking product build milestones |
| `docs/CHECKLISTS.md` | How household checklists behave + reset / join patterns |
| `app_prompt.txt` | Original UX + feature brief |

### One-time prerequisites

1. **Supabase** — create project, enable Email/password auth (`Authentication → Providers → Email`). Optionally disable mandatory email confirmations for MVP so sign-up is instant.
2. **SQL migration** — open `supabase/migrations/20260506230000_initial_schema.sql`, paste into Supabase **SQL Editor → Run**. This installs tables + RLS + signup trigger (`handle_new_user`) that seeds playbook checklists automatically for each new household.
3. **Environment** — inside `web/`, copy `.env.example` to `.env.local` and paste `NEXT_PUBLIC_SUPABASE_URL` plus `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `Project Settings → API`.

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

Keep `docs/PROJECT_PROGRESS.md` updated as milestones land (GitHub-flavored Markdown checkboxes). Operational checklist guidance lives in `docs/CHECKLISTS.md`.
