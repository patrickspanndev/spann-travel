import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPublicSupabaseConfig } from "@/lib/supabase/public-env";

export default async function Home() {
  const hasSupabaseEnv = getPublicSupabaseConfig() !== null;

  if (!hasSupabaseEnv) {
    return (
      <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-6 py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Spann Travel
        </h1>
        <p className="mt-3 leading-relaxed text-slate-400">
          Configure Supabase credentials in{" "}
          <code className="rounded bg-white/10 px-1 py-0.5 text-teal-200">web/.env.local</code>{" "}
          (see <code className="rounded bg-white/10 px-1 py-0.5 text-teal-200">../README.md</code>
          ).
        </p>
        <p className="mt-4 text-sm text-slate-500">
          After env is set and the migration has been applied, reload and sign in.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-white">Spann Travel</h1>
      <p className="mt-3 leading-relaxed text-slate-400">
        Household travel dashboard — loyalty strategy, trips, checklists.
      </p>
      <Link
        href="/login"
        className="mt-8 inline-flex w-fit items-center justify-center rounded-lg bg-teal-500 px-5 py-3 text-sm font-medium text-[#06201c] hover:bg-teal-400 transition-colors"
      >
        Sign in
      </Link>
    </div>
  );
}
