# Spann Travel — full app build checklist

Single ordered path from **empty hands → working local app → production → MVP features**. Tick `[ ] → [x]` in Git as you go.

### Doc map

| Document | Role |
|----------|------|
| **This file** | Master sequence for build, deploy, and MVP rollout |
| [`SUPABASE_SETUP_CHECKLIST.md`](./SUPABASE_SETUP_CHECKLIST.md) | Deep checkbox list for hosted Supabase only |
| [`SPANN_TRAVEL_RUNBOOK.md`](./SPANN_TRAVEL_RUNBOOK.md) | Maintainer ops quick reference (URLs, routines, rotations) |
| [`PROJECT_PROGRESS.md`](./PROJECT_PROGRESS.md) | Maintainer milestone ledger (keep `[x]` in sync here when you ship) |
| [`CHECKLISTS.md`](./CHECKLISTS.md) | Household checklist data ops + spouse join workarounds |
| [`LOYALTY_BEST_PRACTICES.md`](./LOYALTY_BEST_PRACTICES.md) | Manual loyalty tracking rhythm, credentials, masking, roles |

---

### Phase 1 · Machine & repository

- [ ] **Node.js** current LTS (or team standard); `npm` works
- [ ] Repo cloned/synced — [github.com/patrickspanndev/spann-travel](https://github.com/patrickspanndev/spann-travel)
- [ ] **`origin`** SSH URL matches Archives pattern — `git@github.com:patrickspanndev/spann-travel.git`
- [ ] From `web/`: `npm install`

---

### Phase 2 · Supabase (backend)

Work through **`docs/SUPABASE_SETUP_CHECKLIST.md`** (sections **A → F**) in order — then skim **`docs/SPANN_TRAVEL_RUNBOOK.md`** for where secrets live (**Vercel** vs **`web/.env.local`**) before you onboard a second maintainer.

Then confirm:

- [ ] Email/password auth enabled for the app flows
- [ ] **`supabase/migrations/20260506230000_initial_schema.sql`** applied cleanly (tables, RLS, trigger, seeded checklists)
- [ ] **`web/.env.local`**: **`NEXT_PUBLIC_SUPABASE_URL`** (see checklist — often **General** / **Connect**, not API Keys page) plus **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** (**API Keys → Legacy anon** `eyJ…` key)
- [ ] Sign-up triggers `households` / `profiles` / checklist rows (see Supabase checklist)

---

### Phase 3 · Local application

- [ ] **`npm run dev`** from `web/` → http://localhost:3000
- [ ] Unauthenticated visits to `/dashboard` (etc.) redirect to `/login`
- [ ] **`/dashboard`** — progress aggregates move when checklist items toggle
- [ ] **`/checklists`** — three tracks render; persistence after refresh
- [ ] **`/settings`** profile + household id; spouse workaround text makes sense
- [ ] Stub routes load from nav: Loyalty, Trips, Ideas, Strategy
- [ ] **`npm run build`** passes

---

### Phase 4 · Git & optional CI

- [ ] **`main`** (or chosen default branch) pushed to GitHub
- [ ] **`web/.env.local`** absent from commits (verify `.gitignore`)
- [ ] Optional: GitHub Action running `npm ci` + `npm run lint` + `npm run build` with **`defaults.run.working-directory: web`**

---

### Phase 5 · Vercel (production)

Same **monorepo layout** as **Spann Memories** (`family-archive`) and **[Spann Music](https://github.com/patrickspanndev/spann-music)**: the Next.js app lives in **`web/`**, not the repo root — Vercel must build that folder.

#### Step-by-step (first deploy)

1. [ ] **[vercel.com](https://vercel.com)** → sign in → **Add New…** → **Project**
2. [ ] **Import Git Repository** — pick **`patrickspanndev/spann-travel`** (install the GitHub app / grant org access if prompted)
3. [ ] Configure project before **Deploy**:
   - [ ] **Framework Preset**: Next.js (auto-detected from `web/package.json` once root is set)
   - [ ] **Root Directory** → **Edit** → set **`web`** (critical — do **not** leave blank or builds read the repo root by mistake)
   - [ ] **Build Command** → default `npm run build` inside `web/` is fine
   - [ ] **Output Directory** → leave default unless you customized Next output
   - [ ] **Install Command** → default `npm install` is fine
4. [ ] **Environment Variables** (same tab or **Settings → Environment Variables**):
   - [ ] **`NEXT_PUBLIC_SUPABASE_URL`** — Production (and **Preview** if you want previews to hit Supabase)
   - [ ] **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** — same scopes as URL
   - [ ] Paste values from **`web/.env.local`** (never commit that file — copy manually or from Supabase Dashboard)
5. [ ] Click **Deploy** — wait until build **Ready**
6. [ ] Every time you change env vars: **Deployments** → latest deploy → ⋯ menu → **Redeploy**

#### After deploy checks

- [ ] Open the **Production URL** → sign in → **`/dashboard`**, **`/checklists`** work
- [ ] Supabase **Authentication → URL Configuration** — **Site URL** matches production origin; **Redirect URLs** include `http://localhost:3000` for local dev plus your `*.vercel.app` preview host if previews use Auth
- [ ] Optional **Preview** deployments: duplicate env vars under **Preview** or inherit from Production per your preference

Sibling repos using the **same Vercel pattern**: Spann Memories + Spann Travel + Spann Music each use **Root Directory = `web`**.

---

---

### Phase 6 · Post-deploy checks

- [ ] Mobile-ish viewport: nav + checklist taps acceptable
- [ ] Store prod URL privately (no secrets or keys in markdown you commit)

---

### Phase 7 · Household / second spouse

- [ ] **`docs/CHECKLISTS.md`** read; second user joined to same `household_id` (SQL) or postponed until invite UI
- [ ] Roles understood: **`viewer`** vs **`member`** / **`admin`** (RLS)

---

### Phase 8 · MVP product backlog (`app_prompt.txt`)

Ship in any order; unchecked until shipped.

#### Loyalty

- [x] Schema: catalog + **`loyalty_accounts`** (traveler, program, masked identifiers, balances, tiers) + household-scoped **RLS**
- [x] **`/loyalty-programs`**: filters + CRUD

#### Trips

- [x] Schema: **`trips`** (destination, dates, travelers, purpose, statuses, estimates, target programs)
- [x] **`/trips`**: CRUD + status pipeline UI

#### Travel ideas

- [x] Schema: **`travel_ideas`** (typed categories — dining, resorts, museums, anniversary, etc.)
- [x] **`/travel-ideas`**: CRUD + filters

#### Strategy

- [x] **`/strategy`**: playbook-style sections (alliances, when to use MR vs Chase vs partners, transfer warnings)

#### Quality-of-life

- [x] Optional: add/edit checklist rows in-app (beyond SQL seed)
- [ ] Invite flow replacing manual profile SQL (**`docs/CHECKLISTS.md`** stopgap documented until then)

---

### Phase 9 · Hardening & ops

- [ ] Rotate any leaked credentials used during onboarding
- [ ] Optional private runbook (URLs + rotation reminders) — modeled on Spann Memories runbook — **never** paste live secrets into Git
- [ ] **`docs/PROJECT_PROGRESS.md`** updated to mirror major `[x]` items from this checklist

---

### When you pause

_Next concrete step:_

- _________________________________________________
