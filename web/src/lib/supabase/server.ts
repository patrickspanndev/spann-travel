import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicSupabaseConfig } from "./public-env";

export async function createClient() {
  const cfg = getPublicSupabaseConfig();
  if (!cfg) {
    throw new Error("Supabase env is not configured.");
  }
  const cookieStore = await cookies();

  return createServerClient(
    cfg.url,
    cfg.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
}
