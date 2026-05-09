"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const PURPOSES = ["vacation", "family", "anniversary", "international", "luxury", "getaway", "other"] as const;
const STATUSES = ["idea", "researching", "ready_to_book", "booked", "completed"] as const;

type Purpose = (typeof PURPOSES)[number];
type Status = (typeof STATUSES)[number];

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
    return { supabase, user, profile, error: "View-only users cannot edit trips." };
  }
  return { supabase, user, profile, error: null as string | null };
}

function nullIfEmpty(v: FormDataEntryValue | null): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function parsePurpose(v: string): Purpose {
  return (PURPOSES.includes(v as Purpose) ? v : "other") as Purpose;
}

function parseStatus(v: string): Status {
  return (STATUSES.includes(v as Status) ? v : "idea") as Status;
}

function parseMoney(v: FormDataEntryValue | null): number | null {
  const s = v == null ? "" : String(v).trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function createTrip(formData: FormData): Promise<void> {
  const ctx = await requireEditor();
  if (ctx.error || !ctx.profile) throw new Error(ctx.error ?? "Unauthorized.");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Trip name is required.");

  const payload = {
    household_id: ctx.profile.household_id,
    name,
    destination: nullIfEmpty(formData.get("destination")),
    start_date: nullIfEmpty(formData.get("start_date")),
    end_date: nullIfEmpty(formData.get("end_date")),
    travelers_note: nullIfEmpty(formData.get("travelers_note")),
    purpose: parsePurpose(String(formData.get("purpose") ?? "vacation")),
    status: parseStatus(String(formData.get("status") ?? "idea")),
    target_airline_programs: nullIfEmpty(formData.get("target_airline_programs")),
    target_hotel_programs: nullIfEmpty(formData.get("target_hotel_programs")),
    est_cash_usd: parseMoney(formData.get("est_cash_usd")),
    est_points_note: nullIfEmpty(formData.get("est_points_note")),
    notes: nullIfEmpty(formData.get("notes")),
  };

  const { error } = await ctx.supabase.from("trips").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/trips");
  revalidatePath("/dashboard");
}

export async function updateTrip(formData: FormData): Promise<void> {
  const ctx = await requireEditor();
  if (ctx.error || !ctx.profile) throw new Error(ctx.error ?? "Unauthorized.");

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Trip name is required.");

  const { error } = await ctx.supabase
    .from("trips")
    .update({
      name,
      destination: nullIfEmpty(formData.get("destination")),
      start_date: nullIfEmpty(formData.get("start_date")),
      end_date: nullIfEmpty(formData.get("end_date")),
      travelers_note: nullIfEmpty(formData.get("travelers_note")),
      purpose: parsePurpose(String(formData.get("purpose") ?? "vacation")),
      status: parseStatus(String(formData.get("status") ?? "idea")),
      target_airline_programs: nullIfEmpty(formData.get("target_airline_programs")),
      target_hotel_programs: nullIfEmpty(formData.get("target_hotel_programs")),
      est_cash_usd: parseMoney(formData.get("est_cash_usd")),
      est_points_note: nullIfEmpty(formData.get("est_points_note")),
      notes: nullIfEmpty(formData.get("notes")),
    })
    .eq("id", id)
    .eq("household_id", ctx.profile.household_id);

  if (error) throw new Error(error.message);
  revalidatePath("/trips");
  revalidatePath("/dashboard");
}

export async function deleteTrip(formData: FormData): Promise<void> {
  const ctx = await requireEditor();
  if (ctx.error || !ctx.profile) throw new Error(ctx.error ?? "Unauthorized.");

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id.");

  const { error } = await ctx.supabase.from("trips").delete().eq("id", id).eq("household_id", ctx.profile.household_id);

  if (error) throw new Error(error.message);
  revalidatePath("/trips");
  revalidatePath("/dashboard");
}
