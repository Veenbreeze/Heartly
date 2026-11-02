import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = safeRedirectPath(url.searchParams.get("next"), "/dashboard");
  const errorDescription = url.searchParams.get("error_description");

  if (errorDescription) {
    const login = url.clone();
    login.pathname = "/login";
    login.search = `?error=${encodeURIComponent(errorDescription)}`;
    return NextResponse.redirect(login);
  }

  if (!code && !(tokenHash && type)) {
    const login = url.clone();
    login.pathname = "/login";
    login.search = "?error=missing_code";
    return NextResponse.redirect(login);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    const login = url.clone();
    login.pathname = "/login";
    login.search = "?setup=1";
    return NextResponse.redirect(login);
  }

  const result =
    tokenHash && type
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : await supabase.auth.exchangeCodeForSession(code as string);

  if (result.error) {
    const login = url.clone();
    login.pathname = "/login";
    login.search = `?error=${encodeURIComponent(result.error.message)}`;
    return NextResponse.redirect(login);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
