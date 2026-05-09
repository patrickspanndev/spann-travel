"use client";

import { useMemo, useState } from "react";
import {
  createLoyaltyAccount,
  deleteLoyaltyAccount,
  updateLoyaltyAccount,
} from "@/app/actions/loyalty";

type ProgramInfo = {
  slug: string;
  name: string;
  category: string;
  alliance: string | null;
};

type Traveler = { id: string; display_name: string };

export type LoyaltyAccountVM = {
  id: string;
  member_id_hint: string | null;
  login_email_hint: string | null;
  login_url: string | null;
  passwordIsSet: boolean;
  balance_display: string | null;
  tier: string | null;
  notes: string | null;
  last_reviewed_at: string | null;
  loyalty_programs: ProgramInfo | null;
  profiles: { display_name: string } | null;
};

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "airline", label: "Airlines" },
  { id: "hotel", label: "Hotels" },
  { id: "credit_card", label: "Cards" },
  { id: "portal", label: "Portals" },
  { id: "dining", label: "Dining" },
  { id: "other", label: "Other" },
];

export function LoyaltyWorkspace({
  programs,
  travelers,
  accounts,
  canEdit,
}: {
  programs: { id: string; slug: string; name: string; category: string; alliance: string | null }[];
  travelers: Traveler[];
  accounts: LoyaltyAccountVM[];
  canEdit: boolean;
}) {
  const [cat, setCat] = useState<string>("all");

  const filtered = useMemo(() => {
    if (cat === "all") return accounts;
    return accounts.filter((a) => a.loyalty_programs?.category === cat);
  }, [accounts, cat]);

  return (
    <div className="mt-10 space-y-10">
      {canEdit ? (
        <section className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold text-white">Add program per traveler</h2>
          <p className="mt-1 text-xs text-slate-500">
            One row per person per program. Member ID is optional — store last digits or a mask, not full account
            numbers. Website password is optional and shared with everyone in this household who can open Loyalty.
          </p>
          <form action={createLoyaltyAccount} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-medium text-slate-400">Traveler</span>
              <select
                name="traveler_profile_id"
                required
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal-500/40 focus:ring-2"
              >
                <option value="">Choose…</option>
                {travelers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.display_name || "Member"}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs sm:col-span-2 lg:col-span-2">
              <span className="font-medium text-slate-400">Program</span>
              <select
                name="loyalty_program_id"
                required
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal-500/40 focus:ring-2"
              >
                <option value="">Choose…</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-medium text-slate-400">Member ID (mask)</span>
              <input
                name="member_id_hint"
                placeholder="e.g. …7821"
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none ring-teal-500/40 focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-medium text-slate-400">Login email hint</span>
              <input
                name="login_email_hint"
                placeholder="which inbox logs in"
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none ring-teal-500/40 focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs sm:col-span-2">
              <span className="font-medium text-slate-400">Program login URL (optional)</span>
              <input
                type="url"
                name="login_url"
                placeholder="https://… or flyingblue.com"
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none ring-teal-500/40 focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-medium text-slate-400">Website password (optional)</span>
              <input
                type="password"
                name="login_password"
                autoComplete="new-password"
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal-500/40 focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <input
                name="balance_display"
                placeholder="e.g. 48k FB"
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none ring-teal-500/40 focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-medium text-slate-400">Tier</span>
              <input
                name="tier"
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal-500/40 focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-medium text-slate-400">Last reviewed</span>
              <input
                type="date"
                name="last_reviewed_at"
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal-500/40 focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs sm:col-span-2">
              <span className="font-medium text-slate-400">Notes</span>
              <input
                name="notes"
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal-500/40 focus:ring-2"
              />
            </label>
            <div className="flex items-end sm:col-span-2 lg:col-span-3">
              <button
                type="submit"
                className="rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-[#05201d] hover:bg-teal-400"
              >
                Save account
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-white">Household accounts</h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCat(c.id)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  cat === c.id
                    ? "border-teal-500/60 bg-teal-500/15 text-teal-200"
                    : "border-white/10 text-slate-400 hover:border-white/20"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-6 rounded-lg border border-white/10 bg-black/20 px-4 py-6 text-sm text-slate-500">
            {accounts.length === 0
              ? "No loyalty rows yet — add one above (or run the Phase 8 migration if this message persists)."
              : "Nothing in this filter."}
          </p>
        ) : (
          <ul className="mt-6 grid gap-4 lg:grid-cols-2">
            {filtered.map((row) => (
              <LoyaltyAccountCard key={row.id} row={row} canEdit={canEdit} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function LoyaltyAccountCard({ row, canEdit }: { row: LoyaltyAccountVM; canEdit: boolean }) {
  const p = row.loyalty_programs;
  const who = row.profiles?.display_name ?? "Traveler";

  if (!canEdit) {
    return (
      <li className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{p?.category ?? "—"}</p>
            <h3 className="mt-1 font-medium text-white">{p?.name ?? "Program"}</h3>
            <p className="text-xs text-slate-500">{who}</p>
          </div>
          {p?.alliance ? (
            <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-slate-400">
              {p.alliance}
            </span>
          ) : null}
        </div>
        <dl className="mt-4 grid gap-2 text-xs text-slate-400">
          {row.login_url ? (
            <div>
              <dt className="text-slate-500">Sign in</dt>
              <dd>
                <a
                  href={row.login_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:text-teal-300"
                >
                  Open program login →
                </a>
              </dd>
            </div>
          ) : null}
          {row.member_id_hint ? (
            <div>
              <dt className="text-slate-500">Member ref</dt>
              <dd className="font-mono text-slate-300">{row.member_id_hint}</dd>
            </div>
          ) : null}
          {row.balance_display ? (
            <div>
              <dt className="text-slate-500">Balance</dt>
              <dd className="text-slate-200">{row.balance_display}</dd>
            </div>
          ) : null}
          {row.passwordIsSet ? (
            <div>
              <dt className="text-slate-500">Website password</dt>
              <dd className="text-slate-400">Saved (not shown in view-only)</dd>
            </div>
          ) : null}
          {row.tier ? (
            <div>
              <dt className="text-slate-500">Tier</dt>
              <dd>{row.tier}</dd>
            </div>
          ) : null}
        </dl>
      </li>
    );
  }

  return (
    <li className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{p?.category ?? "—"}</p>
          <h3 className="mt-1 font-medium text-white">{p?.name ?? "Program"}</h3>
          <p className="text-xs text-teal-200/80">{who}</p>
          {row.login_url ? (
            <a
              href={row.login_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs font-medium text-teal-400 hover:text-teal-300"
            >
              Open program login →
            </a>
          ) : null}
        </div>
        <form action={deleteLoyaltyAccount}>
          <input type="hidden" name="id" value={row.id} />
          <button
            type="submit"
            className="text-xs text-rose-300/90 hover:text-rose-200"
            title="Remove row"
          >
            Remove
          </button>
        </form>
      </div>
      <form action={updateLoyaltyAccount} className="mt-4 grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="id" value={row.id} />
        <label className="flex flex-col gap-1 text-xs sm:col-span-2">
          <span className="text-slate-500">Member ID (mask)</span>
          <input
            name="member_id_hint"
            defaultValue={row.member_id_hint ?? ""}
            className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-teal-500/50"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs sm:col-span-2">
          <span className="text-slate-500">Program login URL</span>
          <input
            type="url"
            name="login_url"
            defaultValue={row.login_url ?? ""}
            placeholder="https://…"
            className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-teal-500/50"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs sm:col-span-2">
          <span className="text-slate-500">Login email</span>
          <input
            name="login_email_hint"
            defaultValue={row.login_email_hint ?? ""}
            className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-teal-500/50"
          />
        </label>
        {row.passwordIsSet ? (
          <p className="text-xs text-slate-500 sm:col-span-2">
            A website password is stored. Enter a new one below to replace it, or check &ldquo;clear&rdquo; to remove.
          </p>
        ) : (
          <p className="text-xs text-slate-500 sm:col-span-2">No website password stored yet.</p>
        )}
        <label className="flex flex-col gap-1 text-xs sm:col-span-2">
          <span className="text-slate-500">New website password (leave blank to keep)</span>
          <input
            type="password"
            name="new_login_password"
            autoComplete="new-password"
            className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-teal-500/50"
          />
        </label>
        <label className="flex items-center gap-2 text-xs sm:col-span-2">
          <input type="checkbox" name="clear_login_password" className="size-3 rounded border-white/30" />
          <span className="text-slate-400">Clear stored website password</span>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-slate-500">Balance</span>
          <input
            name="balance_display"
            defaultValue={row.balance_display ?? ""}
            className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-teal-500/50"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-slate-500">Tier</span>
          <input
            name="tier"
            defaultValue={row.tier ?? ""}
            className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-teal-500/50"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-slate-500">Last reviewed</span>
          <input
            type="date"
            name="last_reviewed_at"
            defaultValue={row.last_reviewed_at ?? ""}
            className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-teal-500/50"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs sm:col-span-2">
          <span className="text-slate-500">Notes</span>
          <input
            name="notes"
            defaultValue={row.notes ?? ""}
            className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-teal-500/50"
          />
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-lg border border-teal-500/40 bg-teal-500/10 px-3 py-1.5 text-xs font-medium text-teal-200 hover:bg-teal-500/20"
          >
            Update
          </button>
        </div>
      </form>
    </li>
  );
}
