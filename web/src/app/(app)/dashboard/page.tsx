import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard · Spann Travel",
  description: "Household points by program type.",
};

const TYPE_ORDER = ["Airline", "Hotel", "Credit Card", "Car Rental", "Other"] as const;

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: rows, error } = await supabase.from("loyalty_accounts").select(`
      points_balance,
      loyalty_programs ( program_type, name )
    `);

  const missingRelation = error?.message.includes("relation") || error?.message.includes("column");
  const missingColumn =
    error?.message.includes("program_type") || error?.message.includes("points_balance");

  if (missingRelation) {
    return (
      <>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Dashboard</h1>
        <p className="mt-4 max-w-2xl rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-5 text-sm text-amber-100">
          Loyalty tables are not installed yet. Run Phase 8 migrations from{" "}
          <code className="rounded bg-black/30 px-1 text-xs text-amber-200">supabase/migrations/</code> in Supabase
          SQL.
        </p>
      </>
    );
  }

  if (missingColumn) {
    return (
      <>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Dashboard</h1>
        <p className="mt-4 max-w-2xl rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-5 text-sm text-amber-100">
          Run{" "}
          <code className="rounded bg-black/30 px-1 text-xs text-amber-200">
            supabase/migrations/20260510100000_loyalty_program_type_points.sql
          </code>{" "}
          (and earlier loyalty migrations if you see errors about{" "}
          <code className="text-amber-200">login_password</code>), then reload.
        </p>
      </>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-100">{error.message}</div>
    );
  }

  type Row = {
    points_balance: number | null;
    loyalty_programs: { program_type: string; name: string } | { program_type: string; name: string }[] | null;
  };

  const aggregates: Record<string, { totalPoints: number; accounts: number; programs: Set<string> }> = {};
  for (const t of TYPE_ORDER) {
    aggregates[t] = { totalPoints: 0, accounts: 0, programs: new Set<string>() };
  }

  for (const raw of rows ?? []) {
    const r = raw as Row;
    const lp = Array.isArray(r.loyalty_programs) ? r.loyalty_programs[0] : r.loyalty_programs;
    const ptype = lp?.program_type;
    const bucket: (typeof TYPE_ORDER)[number] =
      ptype && (TYPE_ORDER as readonly string[]).includes(ptype)
        ? (ptype as (typeof TYPE_ORDER)[number])
        : "Other";
    aggregates[bucket].accounts += 1;
    if (lp?.name) aggregates[bucket].programs.add(lp.name);
    if (r.points_balance != null) aggregates[bucket].totalPoints += Number(r.points_balance);
  }

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Totals use optional <strong className="font-medium text-slate-300">points</strong> on each loyalty row
            (miles/points as a whole number). Free-text balance lines are for notes only — edit accounts on{" "}
            <Link href="/loyalty-programs" className="font-medium text-teal-400 hover:text-teal-300">
              Loyalty
            </Link>
            . Playbook execution lives on{" "}
            <Link href="/command-center" className="font-medium text-teal-400 hover:text-teal-300">
              Command Central
            </Link>
            .
          </p>
        </div>
      </div>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TYPE_ORDER.map((t) => {
          const a = aggregates[t];
          const noAccounts = a.accounts === 0;
          return (
            <article
              key={t}
              className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-lg shadow-black/20"
            >
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400/90">{t}</h2>
              <p className="mt-4 text-3xl font-semibold tabular-nums text-white">
                {noAccounts ? "—" : formatPoints(a.totalPoints)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {noAccounts
                  ? "no accounts in this type"
                  : a.totalPoints === 0
                    ? "sum is 0 — add points on loyalty rows if you want totals"
                    : "sum of points (where entered)"}
              </p>
              <p className="mt-4 text-xs text-slate-400">
                {a.accounts} account{a.accounts === 1 ? "" : "s"}
                {a.programs.size > 0 ? (
                  <span className="mt-1 block text-slate-500">
                    {Array.from(a.programs).slice(0, 5).join(" · ")}
                    {a.programs.size > 5 ? " · …" : ""}
                  </span>
                ) : null}
              </p>
            </article>
          );
        })}
      </section>
    </>
  );
}

function formatPoints(n: number): string {
  return n.toLocaleString("en-US");
}
