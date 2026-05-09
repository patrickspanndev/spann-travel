# Spann Travel — project progress ledger

**Canonical ordered steps:** **`docs/APP_BUILD_CHECKLIST.md`**. This file mirrors milestone status — try to keep `[x]` items aligned when you ship.

Boxes use GitHub-flavored Markdown `[ ] / [x]`.

Instructions:

1. Walk the build using **`docs/APP_BUILD_CHECKLIST.md`** first.
2. Optionally annotate completion dates (`[x] 2026-05-06`) beside heavy milestones.
3. Capture **Next micro-step** bullets when stopping mid-phase.

Stretch ideas stay unchecked until promoted.

--------------------------------------------------------------------------------

### Phase 0 · Repo + platform scaffolding

- [x] Scaffold Next.js + Tailwind workspace under `web/`
- [x] Compose Supabase client helpers + middleware auth gate
- [ ] Publish GitHub remote + optional CI (lint/typecheck/build)
- [ ] Wire Vercel project (`Root Directory = web`)

---

### Phase 1 · Postgres schema + governance

- [ ] Work through **`docs/SUPABASE_SETUP_CHECKLIST.md`** (primary checklist for hosted Supabase)
- [ ] Execute `supabase/migrations/20260506230000_initial_schema.sql` in hosted Supabase
- [ ] Validate `handle_new_user` trigger fires on email signup (+ seeded rows exist)
- [ ] Spot-check Row Level Security (throwaway tenant cannot read other household)

---

### Phase 2 · Shell + UX polish

- [x] Global chrome with navigation + stubs for Loyalty/Trips/Ideas/Strategy
- [x] Settings profile card documenting interim invite workaround
- [ ] Mobile QA (<390px) for nav wraps + checklist hit targets

---

### Phase 3 · Checklists + metrics (product MVP nucleus)

- [x] Household checklist ingestion seeded from playbook
- [x] Toggle persistence + dashboard aggregates + anchored jump navigation
- [x] Optional authoring UI for ad-hoc checklist rows

---

### Phase 4 · Loyalty + trips modules

- [x] Loyalty program catalog + traveler CRUD surfaced in `/loyalty-programs`
- [x] Trips funnel + budgeting fields surfaced in `/trips`

---

### Phase 5 · Strategy + Ops hardening

- [x] Rich `/strategy` content blocks + evergreen warnings pane
- [ ] Optional CSV/JSON export utilities

---

### Phase 6 · Launch readiness

- [ ] Rotate + document prod secrets playbook (borrow Spann Memories runbook pattern)
- [ ] Light threat model skim (credential stuffing/abuse tooling available on Supabase plan)
- [ ] README/doc drift audit quarterly

--------------------------------------------------------------------------------

### Quarterly housekeeping (repeat calendar reminder)

- [ ] Review lingering unchecked entries >45 days — complete or downgrade
- [ ] Sync playbook text deltas between `app_prompt.txt` ↔ SQL seed + UX copy
- [ ] Evaluate Supabase plan headroom vs usage (sessions, MAU limits)

---

**Next micro-step (fill below when pausing)**

- _Apply hosted migration + smoke sign-up._
