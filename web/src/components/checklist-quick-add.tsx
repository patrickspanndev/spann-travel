"use client";

import { useActionState } from "react";
import { addChecklistItem } from "@/app/actions/checklist";

type AddState = { error: string | null };

export function ChecklistQuickAdd({ canEdit }: { canEdit: boolean }) {
  const [state, formAction] = useActionState(
    async (_prev: AddState, formData: FormData): Promise<AddState> => addChecklistItem(formData),
    { error: null },
  );

  if (!canEdit) return null;

  return (
    <div className="mt-8 rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
      <h2 className="text-sm font-semibold text-white">Add a list item</h2>
      <p className="mt-1 text-xs text-slate-500">Append to any playbook track — does not modify the Word master doc.</p>
      {state.error ? (
        <p className="mt-3 text-sm text-rose-300" role="alert">
          {state.error}
        </p>
      ) : null}
      <form action={formAction} className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex min-w-[10rem] flex-col gap-1 text-xs">
          <span className="font-medium text-slate-400">List</span>
          <select
            name="list_slug"
            required
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal-500/40 focus:ring-2"
          >
            <option value="immediate">Immediate</option>
            <option value="plan_30d">30-day plan</option>
            <option value="monthly">Monthly rhythm</option>
          </select>
        </label>
        <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs">
          <span className="font-medium text-slate-400">Title</span>
          <input
            name="title"
            required
            placeholder="New task"
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none ring-teal-500/40 focus:ring-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-[#05201d] hover:bg-teal-400"
        >
          Add
        </button>
      </form>
    </div>
  );
}
