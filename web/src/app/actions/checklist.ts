"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const LIST_SLUGS = ["immediate", "plan_30d", "monthly"] as const;

export async function addChecklistItem(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: profile } = await supabase.from("profiles").select("household_id,role").eq("id", user.id).maybeSingle();
  if (!profile?.household_id) return { error: "No household." };
  if (profile.role === "viewer") return { error: "View-only users cannot add checklist items." };

  const slug = String(formData.get("list_slug") ?? "");
  if (!LIST_SLUGS.includes(slug as (typeof LIST_SLUGS)[number])) {
    return { error: "Invalid checklist list." };
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required." };

  const { data: listRow, error: listErr } = await supabase
    .from("checklist_lists")
    .select("id")
    .eq("household_id", profile.household_id)
    .eq("slug", slug)
    .maybeSingle();

  if (listErr || !listRow) return { error: listErr?.message ?? "Checklist list not found." };

  const { data: maxRow } = await supabase
    .from("checklist_items")
    .select("sort_order")
    .eq("checklist_list_id", listRow.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (maxRow?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("checklist_items").insert({
    checklist_list_id: listRow.id,
    title,
    description: null,
    week_number: null,
    sort_order: nextOrder,
  });

  if (error) return { error: error.message };
  revalidatePath("/command-center");
  revalidatePath("/checklists");
  return { error: null as string | null };
}

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

  revalidatePath("/command-center");
  revalidatePath("/checklists");
  return { error: null as string | null };
}
