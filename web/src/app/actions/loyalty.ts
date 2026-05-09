"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
    return { supabase, user, profile, error: "View-only users cannot edit loyalty accounts." };
  }
  return { supabase, user, profile, error: null as string | null };
}

export async function createLoyaltyAccount(formData: FormData): Promise<void> {
  const ctx = await requireEditor();
  if (ctx.error || !ctx.profile) throw new Error(ctx.error ?? "Unauthorized.");

  const programId = String(formData.get("loyalty_program_id") ?? "");
  const travelerId = String(formData.get("traveler_profile_id") ?? "");
  if (!programId || !travelerId) throw new Error("Program and traveler are required.");

  const payload = {
    household_id: ctx.profile.household_id,
    traveler_profile_id: travelerId,
    loyalty_program_id: programId,
    member_id_hint: nullIfEmpty(formData.get("member_id_hint")),
    login_email_hint: nullIfEmpty(formData.get("login_email_hint")),
    balance_display: nullIfEmpty(formData.get("balance_display")),
    tier: nullIfEmpty(formData.get("tier")),
    notes: nullIfEmpty(formData.get("notes")),
    last_reviewed_at: nullIfEmpty(formData.get("last_reviewed_at")),
  };

  const { error } = await ctx.supabase.from("loyalty_accounts").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/loyalty-programs");
  revalidatePath("/dashboard");
}

export async function updateLoyaltyAccount(formData: FormData): Promise<void> {
  const ctx = await requireEditor();
  if (ctx.error || !ctx.profile) throw new Error(ctx.error ?? "Unauthorized.");

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");

  const { error } = await ctx.supabase
    .from("loyalty_accounts")
    .update({
      member_id_hint: nullIfEmpty(formData.get("member_id_hint")),
      login_email_hint: nullIfEmpty(formData.get("login_email_hint")),
      balance_display: nullIfEmpty(formData.get("balance_display")),
      tier: nullIfEmpty(formData.get("tier")),
      notes: nullIfEmpty(formData.get("notes")),
      last_reviewed_at: nullIfEmpty(formData.get("last_reviewed_at")),
    })
    .eq("id", id)
    .eq("household_id", ctx.profile.household_id);

  if (error) throw new Error(error.message);
  revalidatePath("/loyalty-programs");
  revalidatePath("/dashboard");
}

export async function deleteLoyaltyAccount(formData: FormData): Promise<void> {
  const ctx = await requireEditor();
  if (ctx.error || !ctx.profile) throw new Error(ctx.error ?? "Unauthorized.");

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");

  const { error } = await ctx.supabase
    .from("loyalty_accounts")
    .delete()
    .eq("id", id)
    .eq("household_id", ctx.profile.household_id);

  if (error) throw new Error(error.message);
  revalidatePath("/loyalty-programs");
  revalidatePath("/dashboard");
}

function nullIfEmpty(v: FormDataEntryValue | null): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}
