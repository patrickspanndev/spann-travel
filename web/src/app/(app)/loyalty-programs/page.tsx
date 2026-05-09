import type { Metadata } from "next";
import { LoyaltyWorkspace, type LoyaltyAccountVM } from "@/components/loyalty-workspace";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Loyalty · Spann Travel",
  description: "Household loyalty programs by traveler.",
};

export default async function LoyaltyProgramsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };

  const canEdit = profile?.role !== "viewer";

  const { data: programs, error: programsError } = await supabase
    .from("loyalty_programs")
    .select("id,slug,name,category,alliance,program_type")
    .order("sort_order");

  const { data: travelers } = await supabase.from("profiles").select("id,display_name").order("display_name");

  const { data: accountsRaw, error: accountsError } = await supabase
    .from("loyalty_accounts")
    .select(
      `
      id,
      member_id_hint,
      login_email_hint,
      login_url,
      login_password,
      points_balance,
      balance_display,
      tier,
      notes,
      last_reviewed_at,
      loyalty_programs ( slug, name, category, alliance, program_type ),
      profiles!traveler_profile_id ( display_name )
    `,
    )
    .order("created_at", { ascending: true });

  if (programsError?.message.includes("relation") || accountsError?.message.includes("relation")) {
    return (
      <>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Loyalty programs</h1>
        <p className="mt-4 max-w-2xl rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-5 text-sm text-amber-100">
          Database tables are not installed yet. In Supabase → SQL, run{" "}
          <code className="rounded bg-black/30 px-1 text-xs text-amber-200">
            supabase/migrations/20260509100000_phase8_loyalty_trips_ideas.sql
          </code>{" "}
          once, then reload this page.
        </p>
      </>
    );
  }

  const missingTypeOrPoints =
    programsError?.message.includes("program_type") ||
    accountsError?.message.includes("program_type") ||
    accountsError?.message.includes("points_balance");

  if (missingTypeOrPoints) {
    return (
      <>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Loyalty programs</h1>
        <p className="mt-4 max-w-2xl rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-5 text-sm text-amber-100">
          Run{" "}
          <code className="rounded bg-black/30 px-1 text-xs text-amber-200">
            supabase/migrations/20260510100000_loyalty_program_type_points.sql
          </code>{" "}
          in Supabase SQL (adds program type, points, and missing login columns), then reload.
        </p>
      </>
    );
  }

  if (programsError || accountsError) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-100">
        {programsError?.message ?? accountsError?.message}
      </div>
    );
  }

  const accounts: LoyaltyAccountVM[] = (accountsRaw ?? []).map((row) => {
    const r = row as {
      id: string;
      member_id_hint: string | null;
      login_email_hint: string | null;
      login_url: string | null;
      points_balance?: number | null;
      balance_display: string | null;
      tier: string | null;
      notes: string | null;
      last_reviewed_at: string | null;
      login_password?: string | null;
      loyalty_programs:
        | { slug: string; name: string; category: string; alliance: string | null; program_type: string }
        | { slug: string; name: string; category: string; alliance: string | null; program_type: string }[]
        | null;
      profiles: { display_name: string } | { display_name: string }[] | null;
    };
    const lp = Array.isArray(r.loyalty_programs) ? r.loyalty_programs[0] : r.loyalty_programs;
    const pr = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    const pw = r.login_password;
    const passwordIsSet = typeof pw === "string" && pw.length > 0;
    return {
      id: r.id,
      member_id_hint: r.member_id_hint,
      login_email_hint: r.login_email_hint,
      login_url: r.login_url,
      passwordIsSet,
      points_balance: r.points_balance ?? null,
      balance_display: r.balance_display,
      tier: r.tier,
      notes: r.notes,
      last_reviewed_at: r.last_reviewed_at,
      loyalty_programs: lp ?? null,
      profiles: pr ?? null,
    };
  });

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight text-white">Loyalty programs</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-400">
        Catalog is shared; each row is a traveler plus one program. Member ID: mask only. Optional{" "}
        <strong className="font-medium text-slate-300">website password</strong> is stored for convenience (anyone in
        this household can see stored credentials via RLS); a password manager is still safer for high-value logins.
      </p>
      {!canEdit ? (
        <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
          View-only mode — you can browse accounts but not edit.
        </p>
      ) : null}
      <details className="group mt-6 max-w-2xl rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-slate-400 open:border-teal-500/25">
        <summary className="cursor-pointer list-none font-medium text-teal-200/90 marker:hidden [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            Manual tracking — household tips
            <span className="text-xs font-normal text-slate-500 group-open:hidden">(expand)</span>
          </span>
        </summary>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
          <li>
            Use <strong className="font-medium text-slate-300">Last reviewed</strong> as your “as of” date when balances or tier change.
          </li>
          <li>
            Keep <strong className="font-medium text-slate-300">Balance</strong> in shorthand you both understand; add
            whole-number <strong className="font-medium text-slate-300">points</strong> for accurate{" "}
            <a className="text-teal-400 hover:text-teal-300" href="/dashboard">
              Dashboard
            </a>{" "}
            totals.
          </li>
          <li>
            Store <strong className="font-medium text-slate-300">masked</strong> member IDs only; prefer a password manager over the optional stored website password for high-value logins.
          </li>
          <li>
            <strong className="font-medium text-slate-300">Login URL</strong> should be the real member sign-in page you use day to day.
          </li>
          <li>
            Anyone who can edit Loyalty is <strong className="font-medium text-slate-300">trusted</strong> with rows in this household — use the <strong className="font-medium text-slate-300">viewer</strong> role for read-only access.
          </li>
          <li>
            Before transfers, follow <a className="text-teal-400 hover:text-teal-300" href="/strategy">Strategy</a> (confirm award space, no speculative moves).
          </li>
        </ul>
        <p className="mt-3 border-t border-white/5 pt-3 text-xs text-slate-500">
          Longer checklist: repo{" "}
          <code className="rounded bg-white/10 px-1 text-slate-400">docs/LOYALTY_BEST_PRACTICES.md</code>
        </p>
      </details>
      <LoyaltyWorkspace
        programs={programs ?? []}
        travelers={travelers ?? []}
        accounts={accounts}
        canEdit={canEdit}
      />
    </>
  );
}
