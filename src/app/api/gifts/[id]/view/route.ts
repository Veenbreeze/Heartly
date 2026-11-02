import { cookies, headers } from "next/headers";
import { randomUUID } from "node:crypto";
import { getAdminClient } from "@/lib/supabase/admin";
import { clientKey, privacyHash, rateLimit } from "@/lib/rate-limit";
import { apiError, assertSameOrigin } from "@/lib/api";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await assertSameOrigin())) return apiError("Invalid origin", 403);
  const { id: slug } = await params;
  const requestHeaders = await headers();
  if (!rateLimit(clientKey(requestHeaders, "view"), 60, 60_000).allowed) {
    return new Response(null, { status: 204 });
  }

  const admin = getAdminClient();
  if (!admin) return apiError("Database is not configured", 503);

  const { data: gift } = await admin
    .from("gifts")
    .select("id, status, expires_at, scheduled_at")
    .eq("slug", slug)
    .maybeSingle();
  if (!gift || gift.status !== "published") {
    return apiError("Gift not found", 404);
  }
  const now = Date.now();
  if (gift.expires_at && new Date(gift.expires_at).getTime() <= now) {
    return apiError("Gift has expired", 410);
  }
  if (gift.scheduled_at && new Date(gift.scheduled_at).getTime() > now) {
    return apiError("Gift is not available yet", 404);
  }

  const jar = await cookies();
  let visitorId = jar.get("heartly_visitor")?.value;
  if (!visitorId || visitorId.length < 20) {
    visitorId = randomUUID();
    jar.set("heartly_visitor", visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  const forwarded = requestHeaders.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "local";
  const visitorHash = privacyHash(`${visitorId}:${ip}`);
  const referrer = (request.headers.get("referer") ?? "").slice(0, 500) || null;
  const viewDate = new Date().toISOString().slice(0, 10);

  await admin.from("gift_views").upsert(
    {
      gift_id: gift.id,
      visitor_hash: visitorHash,
      view_date: viewDate,
      referrer,
    },
    { onConflict: "gift_id,visitor_hash,view_date", ignoreDuplicates: true },
  );

  return new Response(null, { status: 204 });
}
