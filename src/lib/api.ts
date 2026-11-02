import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { absoluteUrl, siteUrl } from "@/lib/utils";

export function apiError(
  message: string,
  status = 400,
  code?: string,
): NextResponse {
  return NextResponse.json(
    { ok: false, error: message, ...(code ? { code } : {}) },
    { status },
  );
}

export function apiOk(data: Record<string, unknown> = {}, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

/**
 * Basic same-origin check for mutating route handlers. Browser fetches from the
 * studio and gift pages set an Origin header; server-to-server calls without an
 * Origin header are allowed and still require auth or a guest token.
 */
export async function assertSameOrigin(): Promise<boolean> {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  if (!origin) return true;
  const allowed = new Set([
    siteUrl(),
    absoluteUrl(""),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ]);
  try {
    const originHost = new URL(origin).host;
    for (const candidate of allowed) {
      if (new URL(candidate).host === originHost) return true;
    }
    const host = requestHeaders.get("host");
    return Boolean(host && originHost === host);
  } catch {
    return false;
  }
}

export async function readJson<T>(
  request: Request,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = (await request.json()) as T;
    return { data, error: null };
  } catch {
    return { data: null, error: "Invalid JSON body" };
  }
}

export function contentDispositionSafe(value: string): string {
  return value.replace(/["\r\n]/g, "");
}
