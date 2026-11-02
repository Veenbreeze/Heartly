import { cookies, headers } from "next/headers";
import { randomUUID } from "node:crypto";
import { getAdminClient } from "@/lib/supabase/admin";
import { clientKey, privacyHash, rateLimit } from "@/lib/rate-limit";
import { unlockCookieName, verifyUnlockToken } from "@/lib/gift/security";
import { responseSchema } from "@/lib/gift/schema";
import { apiError, apiOk, assertSameOrigin, readJson } from "@/lib/api";
import { sendTransactionalEmail } from "@/lib/email";
import { absoluteUrl } from "@/lib/utils";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await assertSameOrigin())) return apiError("Invalid origin", 403);
  const { id: slug } = await params;
  const requestHeaders = await headers();
  if (!rateLimit(clientKey(requestHeaders, "respond"), 8, 60_000).allowed) {
    return apiError("Too many replies. Try again in a minute.", 429);
  }

  const { data: body, error } = await readJson<unknown>(request);
  if (error) return apiError(error, 400);
  const parsed = responseSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid reply", 400);
  }

  const admin = getAdminClient();
  if (!admin) return apiError("Database is not configured", 503);

  const { data: gift } = await admin
    .from("gifts")
    .select(
      "id, status, visibility, expires_at, scheduled_at, sender_id, title, recipient_name, slug",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (!gift || gift.status !== "published") return apiError("Gift not found", 404);
  const now = Date.now();
  if (gift.expires_at && new Date(gift.expires_at).getTime() <= now) {
    return apiError("This gift has expired", 410);
  }
  if (gift.scheduled_at && new Date(gift.scheduled_at).getTime() > now) {
    return apiError("This gift is not open yet", 404);
  }

  const jar = await cookies();
  if (gift.visibility === "password") {
    const token = jar.get(unlockCookieName(slug))?.value;
    if (!verifyUnlockToken(slug, token)) {
      return apiError("Unlock this gift first", 403);
    }
  }

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

  const { data: existing } = await admin
    .from("gift_responses")
    .select("id")
    .eq("gift_id", gift.id)
    .eq("visitor_hash", visitorHash)
    .maybeSingle();
  if (existing) {
    return apiError("You have already replied to this gift.", 409, "already_responded");
  }

  const { data: row, error: insertError } = await admin
    .from("gift_responses")
    .insert({
      gift_id: gift.id,
      response_type: parsed.data.responseType,
      response_data: parsed.data.responseData,
      message: parsed.data.message || null,
      respondent_name: parsed.data.respondentName || null,
      visitor_hash: visitorHash,
    })
    .select("id, created_at")
    .single();

  if (insertError) {
    return apiError("Could not send that reply. Try again.", 500);
  }

  if (gift.sender_id) {
    try {
      const { data: sender } = await admin
        .from("profiles")
        .select("email")
        .eq("id", gift.sender_id)
        .maybeSingle();
      const respondent = parsed.data.respondentName?.trim() || "Someone";
      const giftTitle =
        gift.title?.trim() ||
        (gift.recipient_name
          ? `your gift for ${gift.recipient_name}`
          : "your gift");
      await sendTransactionalEmail({
        to: sender?.email,
        subject: `${respondent} replied to ${giftTitle}`,
        text: `${respondent} just replied to ${giftTitle} on Heartly.\n\nSee their reply: ${absoluteUrl(`/dashboard/gifts/${gift.id}`)}\n\nHeartly`,
      });
    } catch {
      // Email delivery is best effort; the reply itself already succeeded.
    }
  }

  return apiOk({ response: { id: row.id, createdAt: row.created_at } }, 201);
}
