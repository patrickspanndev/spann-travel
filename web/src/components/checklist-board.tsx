import { ChecklistToggle } from "@/components/checklist-toggle";
import { sortChecklistItems } from "@/lib/checklists/sort";

export type BoardItem = {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  week_number: number | null;
  is_completed: boolean;
};

export type BoardList = {
  id: string;
  slug: string;
  title: string;
  sort_order: number;
  checklist_items: BoardItem[];
};

export function ChecklistBoard({
  lists,
  canEdit,
}: {
  lists: BoardList[];
  canEdit: boolean;
}) {
  const ordered = [...lists].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="flex flex-col gap-14">
      {ordered.map((list) => (
        <section key={list.id} id={list.slug} className="scroll-mt-28">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-teal-400/85">{list.slug.replace(/_/g, " ")}</p>
              <h2 className="text-xl font-semibold text-white">{list.title}</h2>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            {sortChecklistItems(list.checklist_items).map((item) =>
              item.week_number ? (
                <div key={`${item.id}-${item.is_completed}`} className="flex flex-col gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Week {item.week_number}
                  </p>
                  <ChecklistToggle
                    id={item.id}
                    done={item.is_completed}
                    label={item.title}
                    description={item.description}
                    disabled={!canEdit}
                  />
                </div>
              ) : (
                <ChecklistToggle
                  key={`${item.id}-${item.is_completed}`}
                  id={item.id}
                  done={item.is_completed}
                  label={item.title}
                  description={item.description}
                  disabled={!canEdit}
                />
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
