"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const ready =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!ready) {
      setMessage("Supabase env is not configured.");
      return;
    }
    setPending(true);
    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } },
        });
        if (error) {
          setMessage(error.message);
          return;
        }
        setMessage("Check email to confirm signup (Supabase dashboard → Auth → Providers). Then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setMessage(error.message);
          return;
        }
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {mode === "signup" ? (
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-400">Display name</span>
          <input
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none ring-teal-500/40 focus:ring-2"
            placeholder="Patrick"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>
      ) : null}
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-400">Email</span>
        <input
          type="email"
          autoComplete="email"
          required
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none ring-teal-500/40 focus:ring-2"
          placeholder="you@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-400">Password</span>
        <input
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
          minLength={6}
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none ring-teal-500/40 focus:ring-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {message ? (
        <p className={`text-sm ${message.includes("Confirm") ? "text-teal-300" : "text-rose-400"}`}>
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending || !ready}
        className="mt-2 inline-flex items-center justify-center rounded-lg bg-teal-500 py-3 text-sm font-semibold text-[#05201d] hover:bg-teal-400 disabled:opacity-60"
      >
        {pending ? "Working…" : mode === "signup" ? "Create account" : "Sign in"}
      </button>
      <button
        type="button"
        className="text-center text-xs text-slate-500 hover:text-teal-300"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin" ? "First sign-up? Create household" : "Already have an account? Sign in"}
      </button>
      {!ready ? (
        <p className="text-xs text-slate-500">
          NEXT_PUBLIC_SUPABASE_URL / ANON_KEY must be defined at build/run time.
        </p>
      ) : null}
    </form>
  );
}
