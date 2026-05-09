import Link from "next/link";
import { signOut } from "@/app/actions/auth";

type AppNavProps = {
  displayName?: string | null;
  role?: string | null;
};

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/command-center", label: "Command Central" },
  { href: "/checklists", label: "Checklists" },
  { href: "/loyalty-programs", label: "Loyalty" },
  { href: "/trips", label: "Trips" },
  { href: "/travel-ideas", label: "Ideas" },
  { href: "/strategy", label: "Strategy" },
  { href: "/settings", label: "Settings" },
] as const;

export function AppNav({ displayName, role }: AppNavProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07141d]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 lg:gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <Link href="/dashboard" className="shrink-0 text-lg font-semibold tracking-tight text-teal-300">
            Spann Travel
          </Link>
          <nav className="flex flex-wrap gap-x-1 gap-y-2 text-sm text-slate-400">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className="rounded px-2 py-1 hover:bg-white/5 hover:text-teal-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {displayName ? (
            <span className="max-w-[10rem] truncate text-slate-300" title={displayName}>
              {displayName}
              {role ? ` · ${role}` : ""}
            </span>
          ) : null}
          <form action={signOut}>
            <button
              type="submit"
              className="rounded border border-white/10 px-3 py-1.5 font-medium text-slate-300 hover:border-teal-500/60 hover:text-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
