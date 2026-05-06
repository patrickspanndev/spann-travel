import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { sortChecklistItems } from "@/lib/checklists/sort";

type ItemRow = {
  id: string;
  title: string;
  is_completed: boolean;
  sort_order: number;
  week_number?: number | null;
};

type ListRow = {
  slug: string;
  title: string;
  checklist_items?: ItemRow[] | null;
};

function calcProgress(rows: ItemRow[]) {
  if (rows.length === 0) return 0;
  return Math.round((rows.filter((i) => i.is_completed).length / rows.length) * 100);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: lists } = await supabase
    .from("checklist_lists")
    .select("slug,title,sort_order,checklist_items(id,title,is_completed,sort_order,week_number)")
    .order("sort_order");

  const orderedLists = (lists as ListRow[] | null)?.map((list) => ({
    ...list,
    checklist_items: sortChecklistItems(
      (list.checklist_items ?? []).map((item) => ({
        ...item,
        sort_order: item.sort_order ?? 0,
        week_number: item.week_number ?? null,
      })),
    ),
  }));

  const allItems =
    orderedLists?.flatMap((l) =>
      (l.checklist_items ?? []).map((i) => ({
        ...i,
        listSlug: l.slug,
        listTitle: l.title,
      })),
    ) ?? [];

  const total = allItems.length;
  const completed = allItems.filter((i) => i.is_completed).length;
  const overall = total === 0 ? 0 : Math.round((completed / total) * 100);

  const openImmediate = allItems.filter((i) => i.listSlug === "immediate" && !i.is_completed).slice(0, 5);

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Command center</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Progress across playbook checklists. Details and edits live on{" "}
            <Link href="/checklists" className="font-medium text-teal-400 hover:text-teal-300">
              Checklists
            </Link>
            .
          </p>
        </div>
        {user ? (
          <p className="text-xs uppercase tracking-wide text-slate-500">Signed in as {user.email}</p>
        ) : null}
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_minmax(0,1fr)]">
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-lg shadow-black/30">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400/90">
            Overall playbook progress
          </h2>
          <div className="mt-4 flex flex-wrap items-baseline gap-2">
            <span className="text-5xl font-semibold text-white tabular-nums">{overall}%</span>
            <span className="text-sm text-slate-400">
              {completed} of {total} steps complete
            </span>
          </div>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-black/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-700 to-teal-400 transition-[width] duration-500"
              style={{ width: `${overall}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400/90">
            Per track
          </h2>
          <ul className="flex flex-col gap-4">
            {orderedLists?.map((list) => {
              const items = list.checklist_items ?? [];
              const p = calcProgress(items);
              return (
                <li key={list.slug} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-200">{list.title}</span>
                    <span className="tabular-nums text-slate-500">{p}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-black/35">
                    <div
                      className="h-full rounded-full bg-teal-600/90"
                      style={{ width: `${p}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500">
                    {items.filter((i) => i.is_completed).length} / {items.length} done
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400/90">
            Next immediate steps
          </h2>
          <Link href="/checklists#immediate" className="text-xs font-medium text-teal-400 hover:text-teal-300">
            Open checklist →
          </Link>
        </div>
        {openImmediate.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            {total === 0
              ? "No checklist rows yet — run the database migration then sign up fresh (or seed per docs)."
              : "Immediate track is cleared — rotate to the 30-day plan or monthly rhythm."}
          </p>
        ) : (
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-slate-200">
            {openImmediate.map((i) => (
              <li key={i.id}>{i.title}</li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
