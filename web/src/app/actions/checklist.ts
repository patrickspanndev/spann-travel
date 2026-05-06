"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleChecklistItem(formData: FormData) {
  const rawId = formData.get("itemId");
  const rawCompleted = formData.get("completed");
  if (typeof rawId !== "string" || !rawId) {
    return { error: "Missing item." };
  }
  const completed = rawCompleted === "true";

  const supabase = await createClient();

  const { error } = await supabase
    .from("checklist_items")
    .update({
      is_completed: completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", rawId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/checklists");
  return { error: null as string | null };
}
