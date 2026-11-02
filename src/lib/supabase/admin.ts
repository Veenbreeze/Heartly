import { createClient } from "@supabase/supabase-js";
import {
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
  isSupabaseAdminConfigured,
} from "@/lib/env";

export function createAdminClient() {
  if (!isSupabaseAdminConfigured()) {
    throw new Error("SUPABASE_ADMIN_NOT_CONFIGURED");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export function getAdminClient() {
  if (!isSupabaseAdminConfigured()) return null;
  return createAdminClient();
}
