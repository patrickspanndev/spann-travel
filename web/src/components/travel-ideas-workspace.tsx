"use client";

import { useMemo, useState } from "react";
import { createTravelIdea, deleteTravelIdea, updateTravelIdea } from "@/app/actions/travel-ideas";

export type TravelIdeaVM = {
  id: string;
  title: string;
  category: string;
  url: string | null;
  notes: string | null;
};

const CATEGORIES = [
  "dining",
  "resort",
  "museum",
  "anniversary",
  "show",
  "attraction",
  "family",
  "tour",
  "beach",
  "japan",
  "europe",
  "luxury",
  "other",
] as const;

const CAT_FILTER = [{ id: "all", label: "All" }, ...CATEGORIES.map((c) => ({ id: c, label: c }))];

export function TravelIdeasWorkspace({ ideas, canEdit }: { ideas: TravelIdeaVM[]; canEdit: boolean }) {
  const [cat, setCat] = useState<string>("all");

  const filtered = useMemo(() => {
    if (cat === "all") return ideas;
    return ideas.filter((i) => i.category === cat);
  }, [ideas, cat]);

  return (
    <div className="mt-10 space-y-10">
      {canEdit ? (
        <section className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold text-white">Add inspiration</h2>
          <form action={createTravelIdea} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs sm:col-span-2">
              <span className="font-medium text-slate-400">Title</span>
              <input
                name="title"
                required
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal-500/40 focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-medium text-slate-400">Category</span>
              <select
                name="category"
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal-500/40 focus:ring-2"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-medium text-slate-400">Link (optional)</span>
              <input
                name="url"
                type="url"
                placeholder="https://…"
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
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-[#05201d] hover:bg-teal-400"
              >
                Save idea
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section>
        <div className="flex flex-wrap gap-2">
          {CAT_FILTER.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${
                cat === c.id
                  ? "border-teal-500/60 bg-teal-500/15 text-teal-200"
                  : "border-white/10 text-slate-400 hover:border-white/20"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">
            {ideas.length === 0
              ? "No ideas yet — add one above or apply the Phase 8 migration."
              : "Nothing in this category."}
          </p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {filtered.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} canEdit={canEdit} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function IdeaCard({ idea, canEdit }: { idea: TravelIdeaVM; canEdit: boolean }) {
  if (!canEdit) {
    return (
      <li className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm">
        <p className="text-[10px] uppercase tracking-wide text-slate-500">{idea.category}</p>
        <p className="mt-1 font-medium text-white">{idea.title}</p>
        {idea.url ? (
          <a href={idea.url} className="mt-2 inline-block text-xs text-teal-400 hover:text-teal-300" target="_blank" rel="noreferrer">
            Open link →
          </a>
        ) : null}
        {idea.notes ? <p className="mt-2 text-xs text-slate-400">{idea.notes}</p> : null}
      </li>
    );
  }

  return (
    <li className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] uppercase tracking-wide text-slate-500">{idea.category}</span>
        <form action={deleteTravelIdea}>
          <input type="hidden" name="id" value={idea.id} />
          <button type="submit" className="text-xs text-rose-300 hover:text-rose-200">
            Delete
          </button>
        </form>
      </div>
      <form action={updateTravelIdea} className="mt-3 grid gap-2">
        <input type="hidden" name="id" value={idea.id} />
        <label className="text-xs">
          <span className="text-slate-500">Title</span>
          <input
            name="title"
            required
            defaultValue={idea.title}
            className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
          />
        </label>
        <label className="text-xs">
          <span className="text-slate-500">Category</span>
          <select
            name="category"
            defaultValue={idea.category}
            className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs">
          <span className="text-slate-500">URL</span>
          <input
            name="url"
            type="url"
            defaultValue={idea.url ?? ""}
            className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
          />
        </label>
        <label className="text-xs">
          <span className="text-slate-500">Notes</span>
          <input
            name="notes"
            defaultValue={idea.notes ?? ""}
            className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
          />
        </label>
        <button
          type="submit"
          className="mt-1 text-left text-xs font-medium text-teal-300 hover:text-teal-200"
        >
          Update
        </button>
      </form>
    </li>
  );
}
