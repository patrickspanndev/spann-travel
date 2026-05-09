import type { Metadata } from "next";
import { TravelIdeasWorkspace, type TravelIdeaVM } from "@/components/travel-ideas-workspace";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Travel ideas · Spann Travel",
  description: "Inspiration without the photo archive.",
};

export default async function TravelIdeasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };

  const canEdit = profile?.role !== "viewer";

  const { data: ideasRaw, error } = await supabase
    .from("travel_ideas")
    .select("id,title,category,url,notes")
    .order("updated_at", { ascending: false });

  if (error?.message.includes("relation")) {
    return (
      <>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Travel inspiration</h1>
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

  const ideas = (ideasRaw ?? []) as TravelIdeaVM[];

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight text-white">Travel inspiration</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-400">
        Restaurants, resorts, museums, anniversary ideas — decoupled from family photos (those stay in Spann Archives).
      </p>
      {!canEdit ? (
        <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
          View-only mode.
        </p>
      ) : null}
      <TravelIdeasWorkspace ideas={ideas} canEdit={canEdit} />
    </>
  );
}
