/** Sort playbook rows: weekly plan by week_number, otherwise by sort_order. */
export interface ChecklistSortable {
  sort_order: number;
  week_number?: number | null;
}

export function sortChecklistItems<T extends ChecklistSortable>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aw = a.week_number ?? 99;
    const bw = b.week_number ?? 99;
    if (aw !== bw) return aw - bw;
    return a.sort_order - b.sort_order;
  });
}
