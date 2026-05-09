"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

type Category = (typeof CATEGORIES)[number];

async function requireEditor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { supabase, user: null as null, profile: null as null, error: "Not signed in." };
  }
  const { data: profile } = await supabase.from("profiles").select("household_id,role").eq("id", user.id).maybeSingle();
  if (!profile?.household_id) {
    return { supabase, user, profile: null, error: "No household." };
  }
  if (profile.role === "viewer") {
    return { supabase, user, profile, error: "View-only users cannot edit ideas." };
  }
  return { supabase, user, profile, error: null as string | null };
}

function nullIfEmpty(v: FormDataEntryValue | null): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function parseCategory(v: string): Category {
  return (CATEGORIES.includes(v as Category) ? v : "other") as Category;
}

export async function createTravelIdea(formData: FormData): Promise<void> {
  const ctx = await requireEditor();
  if (ctx.error || !ctx.profile) throw new Error(ctx.error ?? "Unauthorized.");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required.");

  const payload = {
    household_id: ctx.profile.household_id,
    title,
    category: parseCategory(String(formData.get("category") ?? "other")),
    url: nullIfEmpty(formData.get("url")),
    notes: nullIfEmpty(formData.get("notes")),
  };

  const { error } = await ctx.supabase.from("travel_ideas").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/travel-ideas");
  revalidatePath("/command-center");
}

export async function updateTravelIdea(formData: FormData): Promise<void> {
  const ctx = await requireEditor();
  if (ctx.error || !ctx.profile) throw new Error(ctx.error ?? "Unauthorized.");

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required.");

  const { error } = await ctx.supabase
    .from("travel_ideas")
    .update({
      title,
      category: parseCategory(String(formData.get("category") ?? "other")),
      url: nullIfEmpty(formData.get("url")),
      notes: nullIfEmpty(formData.get("notes")),
    })
    .eq("id", id)
    .eq("household_id", ctx.profile.household_id);

  if (error) throw new Error(error.message);
  revalidatePath("/travel-ideas");
  revalidatePath("/command-center");
}

export async function deleteTravelIdea(formData: FormData): Promise<void> {
  const ctx = await requireEditor();
  if (ctx.error || !ctx.profile) throw new Error(ctx.error ?? "Unauthorized.");

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");

  const { error } = await ctx.supabase
    .from("travel_ideas")
    .delete()
    .eq("id", id)
    .eq("household_id", ctx.profile.household_id);

  if (error) throw new Error(error.message);
  revalidatePath("/travel-ideas");
  revalidatePath("/command-center");
}
