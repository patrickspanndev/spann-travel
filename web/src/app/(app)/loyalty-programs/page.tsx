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
    .select("id,slug,name,category,alliance")
    .order("sort_order");

  const { data: travelers } = await supabase.from("profiles").select("id,display_name").order("display_name");

  const { data: accountsRaw, error: accountsError } = await supabase
    .from("loyalty_accounts")
    .select(
      `
      id,
      member_id_hint,
      login_email_hint,
      balance_display,
      tier,
      notes,
      last_reviewed_at,
      loyalty_programs ( slug, name, category, alliance ),
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
      balance_display: string | null;
      tier: string | null;
      notes: string | null;
      last_reviewed_at: string | null;
      loyalty_programs:
        | { slug: string; name: string; category: string; alliance: string | null }
        | { slug: string; name: string; category: string; alliance: string | null }[]
        | null;
      profiles: { display_name: string } | { display_name: string }[] | null;
    };
    const lp = Array.isArray(r.loyalty_programs) ? r.loyalty_programs[0] : r.loyalty_programs;
    const pr = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    return {
      id: r.id,
      member_id_hint: r.member_id_hint,
      login_email_hint: r.login_email_hint,
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
        Catalog is shared; each row is a traveler in your household plus one program (Flying Blue, SkyMiles, Hyatt, etc.).
        Store masked member IDs only.
      </p>
      {!canEdit ? (
        <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
          View-only mode — you can browse accounts but not edit.
        </p>
      ) : null}
      <LoyaltyWorkspace
        programs={programs ?? []}
        travelers={travelers ?? []}
        accounts={accounts}
        canEdit={canEdit}
      />
    </>
  );
}
