import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseConfig } from "./public-env";

export function createClient() {
  const cfg = getPublicSupabaseConfig();
  if (!cfg) {
    throw new Error("Supabase env is not configured.");
  }
  return createBrowserClient(cfg.url, cfg.anonKey);
}
