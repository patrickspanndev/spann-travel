import type { Metadata } from "next";
import { TripsWorkspace, type TripVM } from "@/components/trips-workspace";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Trips · Spann Travel",
  description: "Trip ideas through booking pipeline.",
};

export default async function TripsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };

  const canEdit = profile?.role !== "viewer";

  const { data: tripsRaw, error } = await supabase
    .from("trips")
    .select(
      "id,name,destination,start_date,end_date,travelers_note,purpose,status,target_airline_programs,target_hotel_programs,est_cash_usd,est_points_note,notes",
    )
    .order("updated_at", { ascending: false });

  if (error?.message.includes("relation")) {
    return (
      <>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Trips</h1>
        <p className="mt-4 max-w-2xl rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-5 text-sm text-amber-100">
          Run{" "}
          <code className="rounded bg-black/30 px-1 text-xs text-amber-200">
            supabase/migrations/20260509100000_phase8_loyalty_trips_ideas.sql
          </code>{" "}
          in Supabase SQL, then reload.
        </p>
      </>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-100">{error.message}</div>
    );
  }

  const trips = (tripsRaw ?? []) as TripVM[];

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight text-white">Trips</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-400">
        Move ideas through research → booking. Tie trips to target airline and hotel programs for award planning.
      </p>
      {!canEdit ? (
        <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
          View-only mode.
        </p>
      ) : null}
      <TripsWorkspace trips={trips} canEdit={canEdit} />
    </>
  );
}
