"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleChecklistItem } from "@/app/actions/checklist";

type ChecklistToggleProps = {
  id: string;
  done: boolean;
  label: string;
  description?: string | null;
  disabled?: boolean;
};

export function ChecklistToggle({
  id,
  done,
  label,
  description,
  disabled = false,
}: ChecklistToggleProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [checked, setChecked] = useState(done);

  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-xl border px-4 py-3 transition-colors hover:border-teal-500/35 hover:bg-teal-500/5 ${checked ? "border-teal-500/25 bg-teal-400/10" : "border-white/[0.08]"}`}
    >
      <input
        type="checkbox"
        className="mt-1 size-4 rounded border-white/20 bg-transparent text-teal-500 accent-teal-500 disabled:opacity-60"
        checked={checked}
        disabled={disabled || pending}
        onChange={(e) => {
          const next = e.target.checked;
          setChecked(next);
          const fd = new FormData();
          fd.append("itemId", id);
          fd.append("completed", next ? "true" : "false");
          startTransition(async () => {
            const res = await toggleChecklistItem(fd);
            if (res.error) {
              setChecked(!next);
            }
            router.refresh();
          });
        }}
      />
      <span className="flex-1 select-none">
        <span
          className={`block text-sm leading-relaxed ${checked ? "text-slate-400 line-through" : "text-slate-100"}`}
        >
          {label}
        </span>
        {description ? (
          <span className="mt-1 block text-xs text-slate-500">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
