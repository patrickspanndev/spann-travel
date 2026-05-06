import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profileRes = user
    ? await supabase
        .from("profiles")
        .select("display_name,role,household_id")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const householdRes = profileRes.data?.household_id
    ? await supabase
        .from("households")
        .select("name")
        .eq("id", profileRes.data.household_id)
        .maybeSingle()
    : { data: null };

  const profile = profileRes.data;

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight text-white">Settings</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-400">
        Operational controls for admins (household renaming, invitations, masking rules) evolve here — today it surfaces
        your profile context only.
      </p>
      <div className="mt-10 max-w-lg rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 text-sm">
        <dl className="space-y-3 text-slate-300">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Email</dt>
            <dd className="truncate text-right">{user?.email ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Display name</dt>
            <dd className="truncate text-right">{profile?.display_name ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Role</dt>
            <dd className="truncate text-right">{profile?.role ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Household</dt>
            <dd className="truncate text-right">{householdRes.data?.name ?? "Household"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Household ID</dt>
            <dd className="truncate text-right font-mono text-xs text-teal-200/90">
              {profile?.household_id ?? "—"}
            </dd>
          </div>
        </dl>
      </div>
      <div className="mt-10 max-w-xl rounded-xl border border-amber-400/25 bg-amber-400/[0.05] px-5 py-4 text-sm leading-relaxed text-amber-100">
        Invite flow is not wired yet: to pair a second spouse, create another Supabase user and update{" "}
        <code className="rounded bg-black/35 px-1 text-xs text-amber-200">profiles.household_id</code> to match the
        primary household (steps in docs/CHECKLISTS.md).
      </div>
    </>
  );
}
