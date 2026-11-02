export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";

export const SUPABASE_ANON_KEY = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ""
).trim();

export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
      SUPABASE_ANON_KEY &&
      !SUPABASE_URL.includes("your-project") &&
      !SUPABASE_ANON_KEY.includes("your-"),
  );
}

export function isSupabaseAdminConfigured(): boolean {
  return (
    isSupabaseConfigured() &&
    Boolean(SUPABASE_SERVICE_ROLE_KEY) &&
    !SUPABASE_SERVICE_ROLE_KEY.includes("your-")
  );
}

export function databaseSetupMessage() {
  return "Connect Supabase to enable accounts, saving, and publishing. Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY to .env.local.";
}

export function giftUnlockSecret(): string {
  return (
    process.env.GIFT_UNLOCK_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "heartly-development-only-unlock-secret"
  );
}

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function paymentProviderName(): "mock" | "clickpesa" {
  return process.env.PAYMENT_PROVIDER?.trim() === "clickpesa" ? "clickpesa" : "mock";
}
