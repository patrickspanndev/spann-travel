# Spann Travel — Admin Runbook

> Maintainer / admin reference modeled on **[`/Users/pspannla/ai_dev/spannArchives/RUNBOOK.md`](/Users/pspannla/ai_dev/spannArchives/RUNBOOK.md)** (“Spann Family Archive”). Household travel dashboards use **Supabase Auth + Postgres RLS**, not Turso/R2 — adjust mental model vs Archives.

**Do not** paste live secrets here or into Git commits.

---

## Quick reference

_Fill placeholders with your deployed URLs._

| What | URL / Command |
|------|----------------|
| **Prod site** (`[after deploy]`) | `https://________.vercel.app` |
| **GitHub repo** | [github.com/patrickspanndev/spann-travel](https://github.com/patrickspanndev/spann-travel) |
| **Vercel project** | [vercel.com](https://vercel.com) → linked repo (**Root Directory** = **`web`**) |
| **Supabase** | [Supabase Dashboard](https://supabase.com/dashboard) — Auth + Postgres + RLS |
| **Local app** | `/Users/pspannla/ai_dev/spannTravel/web/` |

---

## Passwords & configuration

Locals: **`web/.env.local`** (gitignored template from `.env.example` pattern). Prod: identical **names** inside Vercel.

| Variable | Purpose | Notes |
|---------|---------|-------|
| **`NEXT_PUBLIC_SUPABASE_URL`** | API host (`https://<ref>.supabase.co`) | Public |
| **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** | Legacy anon JWT (`eyJ…`) consumed by SSR/browser via `@supabase/ssr` | Public key — still misuse if scraped to hammer quotas |
| **User passwords** | Email/password households | Reset via Auth UI / Supabase **Authentication → Users** |
| ~~`DATABASE_URL`~~ | *Not exposed to Next by default* — Travel prefers Supabase client + SQL migrations | Prefer Supabase pooled SQL over hand-rolling Prisma unless you refactor |

Changing Supabase JWT secret / disabling provider flips logged-in cookies — coordinate communication with spouse users **before** rotations.

Every Vercel env edit → **Redeploy**.

---

## Routine tasks

### Local development

```bash
cd /Users/pspannla/ai_dev/spannTravel/web
npm install
npm run dev    # http://localhost:3000
```

Protected routes (**`/dashboard`, checklists**, etc.) require valid Supabase session cookies — **`middleware.ts`** redirects anonymous traffic to **`/login`**.

### Ship new SQL migrations (household schema / loyalty patches)

Sequential ritual per **[`docs/SUPABASE_SETUP_CHECKLIST.md`](./SUPABASE_SETUP_CHECKLIST.md)**:

```text
docs/supabase/migrations/*.sql → Supabase Dashboard → SQL → Run once
```

Maintain running order mirrored in **`APP_BUILD_CHECKLIST.md`** Phase 2.

### Deploy code

```bash
cd ~/ai_dev/spannTravel
git add .
git commit -m "feat: ..."
git push origin main
```

Ensure **two** **`NEXT_PUBLIC_*`** vars populated in matching Vercel env scope.

---

## App structure snapshot

Authenticated shell via Supabase middleware; major routes excerpted README:

| Route | Role |
|-------|------|
| `/login` | Email auth entry |
| `/dashboard` | Progress widgets |
| `/checklists` | Immediate / 30-day / Monthly tracks |
| `/loyalty-programs`, `/trips`, `/travel-ideas`, `/strategy`, `/settings` | MVP hubs described in **`app_prompt.txt`** |

Secondary household join / SQL merges → **`docs/CHECKLISTS.md`** until invite UX ships.

---

## Platform guides

### Vercel

| Scenario | Typical fix |
|----------|-------------|
| Blank white screen authenticated area | **`NEXT_PUBLIC_SUPABASE_*`** missing at build/runtime |
| Loops **`/login`→`/dashboard`→`/login`** | Verify Supabase cookie domain + **`Authentication → URL Configuration`** site URL whitelist includes prod hostname **and** `http://localhost:3000` for dev |

### Supabase

| Area | Reminder |
|------|----------|
| **Auth → Email** toggles confirm-mail speed vs security trade-off | Faster MVP ⇒ disable mandatory confirm temporarily |
| **RLS recursion** symptom `infinite recursion detected in policy for relation "profiles"` | Apply fix migration noted in **`SUPABASE_SETUP_CHECKLIST`** § D |
| **Table inventory** baseline | households, profiles, checklist\_*, MVP loyalty/trip modules per migration history |

Optional SQL probes (paste in Editor):

```sql
SELECT COUNT(*) FROM public.profiles;
SELECT COUNT(*) FROM public.checklist_items;
```

---

## Security checklist

- [ ] **`service_role`** key **never** lands in **`NEXT_PUBLIC_*`** or frontend bundles
- [ ] Screenshots omit `.env.local` overlays
- [ ] Invite / household join instructions without sharing raw JWT
- [ ] Rotate Supabase **database password** if leaked (update any rare direct JDBC scripts)

---

## Doc map

| Doc | Purpose |
|-----|---------|
| [`APP_BUILD_CHECKLIST.md`](./APP_BUILD_CHECKLIST.md) | Full cold-start sequencing |
| [`SUPABASE_SETUP_CHECKLIST.md`](./SUPABASE_SETUP_CHECKLIST.md) | Supabase granular steps |
| [`CHECKLISTS.md`](./CHECKLISTS.md) | Household playbook + spouse merges |
| [`LOYALTY_BEST_PRACTICES.md`](./LOYALTY_BEST_PRACTICES.md) | Program hygiene cadence |

---

_Last updated: 2026-05-09_
