import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { createClient } from "@/lib/supabase/server";

export default async function AppSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,display_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav displayName={profile?.display_name} role={profile?.role ?? undefined} />
      <main className="mx-auto w-full flex-1 max-w-6xl px-4 py-10">{children}</main>
      <footer className="border-t border-white/5 px-4 py-6 text-center text-xs text-slate-600">
        Private household app — loyalty and travel ops only (no photos here). See docs in repo root{" "}
        <code className="text-slate-500">docs/</code>.
      </footer>
    </div>
  );
}
