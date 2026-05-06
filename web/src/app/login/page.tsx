import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-8 shadow-xl shadow-black/20 backdrop-blur">
        <p className="text-sm font-medium uppercase tracking-wider text-teal-400/90">
          Spann Travel
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Sign in</h1>
        <p className="mt-1 text-sm text-slate-400">
          Household-only — use the email/password you configured in Supabase Auth.
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          <Link href="/" className="text-teal-400 hover:text-teal-300 underline-offset-2 hover:underline">
            Back home
          </Link>
        </p>
      </div>
    </div>
  );
}
