### Checklists + seed operations

This document complements the root `README.md`: rules for playbook checklists stored in Postgres (`checklist_lists` + `checklist_items`).

#### Data model recap

| Object | Meaning |
|--------|---------|
| `households` | Tenant grouping shared by admins/members/viewers later. |
| `profiles` | Joins Supabase Auth users ↔ households (`role`: `admin` \| `member` \| `viewer`). |
| `checklist_lists.slug` | `immediate` · `plan_30d` · `monthly` — three playbook tracks. |
| `checklist_items.week_number` | Only used inside `plan_30d`; weeks roll 1–4. Immediate + monthly rows keep `week_number IS NULL`. |
| Completion fields | Toggle `is_completed` + timestamps `completed_at` (nullable). Viewer role cannot mutate rows (RLS). |

#### Lifecycle

1. **First signup** fires `handle_new_user` → inserts `households`, creates `profiles` row (`admin`), invokes `seed_checklists_for_household` exactly once while no lists exist.
2. Members tick boxes on `/checklists`; `/dashboard` aggregates completion percent plus next immediate backlog.
3. **Monthly rhythm resets** manually for now (`UPDATE checklist_items SET is_completed = false ...`) until automation arrives.

#### Multi-spouse onboarding (temporary procedure)

Invite UI ships later; until then:

1. Create the second spouse’s Supabase Auth user (`Authentication → Users` add user or invite email).
2. Copy the household UUID belonging to the primary admin from Supabase dashboard (`profiles` table).
3. Run SQL:

```sql
UPDATE profiles
SET household_id = '<PRIMARY_HOUSEHOLD_UUID>', role = 'member'
WHERE id = '<SECOND_AUTH_USER_UUID>';
```

Only one canonical household UUID per couple so RLS exposes shared checklist rows.

#### Re-seeding or rebuilding lists

`seed_checklists_for_household` is idempotent: if any checklist list exists for a household, rerunning exits early.

Destructive regeneration example:

```sql
DELETE FROM checklist_items;
DELETE FROM checklist_lists;
SELECT seed_checklists_for_household('<HOUSEHOLD_UUID>');
```

This removes custom supplemental rows unless you surgically delete.

#### Troubleshooting signup trigger

If Supabase Postgres rejects `EXECUTE FUNCTION` in trigger definitions for your hosted version, consult version-specific docs (`EXECUTE PROCEDURE …` synonyms). Fallback: temporarily disable triggers and call `seed_checklists_for_household` manually after profile creation during testing.

#### Where progress metrics originate

`/dashboard` reads nested `checklist_items`. `toggleChecklistItem` triggers `revalidatePath` plus client `router.refresh()` so gauges stay aligned after toggling.
