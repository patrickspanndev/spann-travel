import type { Metadata } from "next";
import Link from "next/link";
import { ChecklistBoard, type BoardList } from "@/components/checklist-board";
import { ChecklistQuickAdd } from "@/components/checklist-quick-add";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Checklists · Spann Travel",
  description: "Immediate, 30-day, and monthly travel rewards checklists.",
};

export default async function ChecklistsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };

  const canEdit = profile?.role !== "viewer";

  const { data: listsRaw, error } = await supabase
    .from("checklist_lists")
    .select("id,slug,title,sort_order,checklist_items(id,title,description,sort_order,week_number,is_completed)")
    .order("sort_order");

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-200">
        Could not load checklists ({error.message}). Confirm the migration applied and Row Level Security allows your
        user.
      </div>
    );
  }

  const lists: BoardList[] = (listsRaw ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    sort_order: row.sort_order,
    checklist_items:
      row.checklist_items?.map((i) => ({
        id: i.id,
        title: i.title,
        description: i.description,
        sort_order: i.sort_order,
        week_number: i.week_number,
        is_completed: i.is_completed,
      })) ?? [],
  }));

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Household checklists</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Three tracks mirror the playbook: immediate setup, rolling 30-day execution, and a monthly rhythm. Progress
            aggregates on the{" "}
            <Link className="font-medium text-teal-400 hover:text-teal-300" href="/dashboard">
              dashboard
            </Link>
            . See repo <code className="rounded bg-white/10 px-1 text-xs text-teal-200">docs/CHECKLISTS.md</code>{" "}
            for resets and seeds.
          </p>
          {!canEdit ? (
            <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
              View-only mode (<strong>viewer</strong> role) — checklist boxes are disabled.
            </p>
          ) : null}
        </div>
        <QuickJump ids={lists.map((l) => ({ slug: l.slug, title: l.title }))} />
      </div>

      <ChecklistQuickAdd canEdit={canEdit} />

      {lists.length === 0 ? (
        <div className="mt-12 rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-slate-400">
          No checklist lists found. Run{" "}
          <code className="text-teal-200">supabase/migrations/20260506230000_initial_schema.sql</code> once, then create
          a household user (signup) so seeded rows attach to your tenant.
        </div>
      ) : (
        <div className="mt-10">
          <ChecklistBoard lists={lists} canEdit={canEdit} />
        </div>
      )}
    </>
  );
}

function QuickJump({ ids }: { ids: { slug: string; title: string }[] }) {
  if (ids.length === 0) return null;

  return (
    <nav className="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
      Jump:
      {ids.map((list) => (
        <a
          key={list.slug}
          href={`#${list.slug}`}
          className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-teal-200 hover:border-teal-500/50"
        >
          {list.title}
        </a>
      ))}
    </nav>
  );
}
