"use client";

import { useMemo, useState } from "react";
import { createTrip, deleteTrip, updateTrip } from "@/app/actions/trips";

export type TripVM = {
  id: string;
  name: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  travelers_note: string | null;
  purpose: string;
  status: string;
  target_airline_programs: string | null;
  target_hotel_programs: string | null;
  est_cash_usd: number | null;
  est_points_note: string | null;
  notes: string | null;
};

const STATUS_ORDER = ["idea", "researching", "ready_to_book", "booked", "completed"] as const;
const STATUS_LABEL: Record<string, string> = {
  idea: "Idea",
  researching: "Researching",
  ready_to_book: "Ready to book",
  booked: "Booked",
  completed: "Completed",
};

const PURPOSES = [
  "vacation",
  "family",
  "anniversary",
  "international",
  "luxury",
  "getaway",
  "other",
] as const;

export function TripsWorkspace({ trips, canEdit }: { trips: TripVM[]; canEdit: boolean }) {
  const [focus, setFocus] = useState<string | "all">("all");

  const grouped = useMemo(() => {
    const g: Record<string, TripVM[]> = {};
    for (const s of STATUS_ORDER) g[s] = [];
    for (const t of trips) {
      const key = STATUS_ORDER.includes(t.status as (typeof STATUS_ORDER)[number]) ? t.status : "idea";
      g[key].push(t);
    }
    return g;
  }, [trips]);

  const filtered =
    focus === "all"
      ? trips
      : trips.filter((t) => t.status === focus);

  return (
    <div className="mt-10 space-y-10">
      {canEdit ? (
        <section className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold text-white">New trip</h2>
          <form action={createTrip} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs sm:col-span-2 lg:col-span-3">
              <span className="font-medium text-slate-400">Name</span>
              <input
                name="name"
                required
                placeholder="Spring Europe"
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal-500/40 focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-medium text-slate-400">Destination</span>
              <input
                name="destination"
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal-500/40 focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-medium text-slate-400">Start</span>
              <input
                type="date"
                name="start_date"
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal-500/40 focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-medium text-slate-400">End</span>
              <input
                type="date"
                name="end_date"
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal-500/40 focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs sm:col-span-2">
              <span className="font-medium text-slate-400">Travelers</span>
              <input
                name="travelers_note"
                placeholder="Who is going"
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal-500/40 focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-medium text-slate-400">Purpose</span>
              <select
                name="purpose"
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal-500/40 focus:ring-2"
              >
                {PURPOSES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-medium text-slate-400">Status</span>
              <select
                name="status"
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal-500/40 focus:ring-2"
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-medium text-slate-400">Target airlines</span>
              <input
                name="target_airline_programs"
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal-500/40 focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-medium text-slate-400">Target hotels</span>
              <input
                name="target_hotel_programs"
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal-500/40 focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-medium text-slate-400">Est. cash (USD)</span>
              <input
                name="est_cash_usd"
                type="number"
                step="0.01"
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal-500/40 focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-medium text-slate-400">Est. points note</span>
              <input
                name="est_points_note"
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal-500/40 focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs sm:col-span-2 lg:col-span-3">
              <span className="font-medium text-slate-400">Notes</span>
              <input
                name="notes"
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal-500/40 focus:ring-2"
              />
            </label>
            <div className="sm:col-span-2 lg:col-span-3">
              <button
                type="submit"
                className="rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-[#05201d] hover:bg-teal-400"
              >
                Create trip
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-white">Pipeline</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFocus("all")}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                focus === "all"
                  ? "border-teal-500/60 bg-teal-500/15 text-teal-200"
                  : "border-white/10 text-slate-400 hover:border-white/20"
              }`}
            >
              All
            </button>
            {STATUS_ORDER.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFocus(s)}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  focus === s
                    ? "border-teal-500/60 bg-teal-500/15 text-teal-200"
                    : "border-white/10 text-slate-400 hover:border-white/20"
                }`}
              >
                {STATUS_LABEL[s]} ({grouped[s]?.length ?? 0})
              </button>
            ))}
          </div>
        </div>

        {focus === "all" ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            {STATUS_ORDER.map((s) => (
              <div key={s} className="min-h-[120px] rounded-xl border border-white/[0.06] bg-black/20 p-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {STATUS_LABEL[s]}
                </h3>
                <ul className="mt-3 space-y-3">
                  {(grouped[s] ?? []).map((t) => (
                    <TripCard key={t.id} trip={t} canEdit={canEdit} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <ul className="mt-6 grid gap-4 lg:grid-cols-2">
            {filtered.map((t) => (
              <TripCard key={t.id} trip={t} canEdit={canEdit} full />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function TripCard({ trip, canEdit, full }: { trip: TripVM; canEdit: boolean; full?: boolean }) {
  if (!canEdit) {
    return (
      <li className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm">
        <p className="font-medium text-white">{trip.name}</p>
        <p className="text-xs text-slate-500">{trip.destination ?? "—"}</p>
        <p className="mt-1 text-[11px] text-teal-300/80">{STATUS_LABEL[trip.status] ?? trip.status}</p>
      </li>
    );
  }

  if (!full) {
    return (
      <li className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-xs">
        <p className="font-medium text-white">{trip.name}</p>
        <p className="text-slate-500">{trip.destination ?? ""}</p>
        <TripMiniForm trip={trip} />
      </li>
    );
  }

  return (
    <li className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-white">{trip.name}</h3>
        <form action={deleteTrip}>
          <input type="hidden" name="id" value={trip.id} />
          <button type="submit" className="text-xs text-rose-300 hover:text-rose-200">
            Delete
          </button>
        </form>
      </div>
      <TripEditForm trip={trip} />
    </li>
  );
}

function TripMiniForm({ trip }: { trip: TripVM }) {
  return (
    <form action={updateTrip} className="mt-2 space-y-2 border-t border-white/5 pt-2">
      <input type="hidden" name="id" value={trip.id} />
      <input type="hidden" name="name" value={trip.name} />
      <input type="hidden" name="destination" value={trip.destination ?? ""} />
      <input type="hidden" name="start_date" value={trip.start_date ?? ""} />
      <input type="hidden" name="end_date" value={trip.end_date ?? ""} />
      <input type="hidden" name="travelers_note" value={trip.travelers_note ?? ""} />
      <input type="hidden" name="purpose" value={trip.purpose} />
      <input type="hidden" name="target_airline_programs" value={trip.target_airline_programs ?? ""} />
      <input type="hidden" name="target_hotel_programs" value={trip.target_hotel_programs ?? ""} />
      <input type="hidden" name="est_cash_usd" value={trip.est_cash_usd ?? ""} />
      <input type="hidden" name="est_points_note" value={trip.est_points_note ?? ""} />
      <input type="hidden" name="notes" value={trip.notes ?? ""} />
      <label className="flex items-center gap-2 text-[11px] text-slate-400">
        <span>Status</span>
        <select
          name="status"
          className="flex-1 rounded border border-white/10 bg-black/40 px-2 py-1 text-white"
          defaultValue={trip.status}
        >
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="text-[11px] font-medium text-teal-300 hover:text-teal-200">
        Update status
      </button>
    </form>
  );
}

function TripEditForm({ trip }: { trip: TripVM }) {
  return (
    <form action={updateTrip} className="mt-4 grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="id" value={trip.id} />
      <label className="flex flex-col gap-1 text-xs sm:col-span-2">
        <span className="text-slate-500">Name</span>
        <input
          name="name"
          required
          defaultValue={trip.name}
          className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-slate-500">Destination</span>
        <input
          name="destination"
          defaultValue={trip.destination ?? ""}
          className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-slate-500">Status</span>
        <select
          name="status"
          defaultValue={trip.status}
          className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
        >
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-slate-500">Purpose</span>
        <select
          name="purpose"
          defaultValue={trip.purpose}
          className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
        >
          {PURPOSES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-slate-500">Start</span>
        <input
          type="date"
          name="start_date"
          defaultValue={trip.start_date ?? ""}
          className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-slate-500">End</span>
        <input
          type="date"
          name="end_date"
          defaultValue={trip.end_date ?? ""}
          className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs sm:col-span-2">
        <span className="text-slate-500">Travelers</span>
        <input
          name="travelers_note"
          defaultValue={trip.travelers_note ?? ""}
          className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-slate-500">Target airlines</span>
        <input
          name="target_airline_programs"
          defaultValue={trip.target_airline_programs ?? ""}
          className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-slate-500">Target hotels</span>
        <input
          name="target_hotel_programs"
          defaultValue={trip.target_hotel_programs ?? ""}
          className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-slate-500">Est. cash USD</span>
        <input
          name="est_cash_usd"
          type="number"
          step="0.01"
          defaultValue={trip.est_cash_usd ?? ""}
          className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-slate-500">Est. points</span>
        <input
          name="est_points_note"
          defaultValue={trip.est_points_note ?? ""}
          className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs sm:col-span-2">
        <span className="text-slate-500">Notes</span>
        <input
          name="notes"
          defaultValue={trip.notes ?? ""}
          className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
        />
      </label>
      <div className="sm:col-span-2">
        <button
          type="submit"
          className="rounded-lg border border-teal-500/40 bg-teal-500/10 px-3 py-1.5 text-xs font-medium text-teal-200 hover:bg-teal-500/20"
        >
          Save trip
        </button>
      </div>
    </form>
  );
}
