import { z } from "zod";
import { getAdminClient } from "@/lib/supabase/admin";
import { getGiftAccess } from "@/lib/gift/access";
import { getEntitlements, getCurrentUser } from "@/lib/auth";
import {
  contentEntitlementError,
  getGuestTokens,
  hashPassword,
} from "@/lib/gift/security";
import { giftContentSchema } from "@/lib/gift/schema";
import { entitlementErrorMessage } from "@/lib/entitlements";
import { apiError, apiOk, assertSameOrigin, readJson } from "@/lib/api";
import { sendTransactionalEmail } from "@/lib/email";
import { absoluteUrl, formatDateTime } from "@/lib/utils";

const publishSchema = z.object({
  visibility: z.enum(["public", "unlisted", "password"]).default("unlisted"),
  password: z.string().min(4).max(72).optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
  removeBranding: z.boolean().default(false),
  revision: z.number().int().min(0).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await assertSameOrigin())) return apiError("Invalid origin", 403);
  const { id } = await params;
  const access = await getGiftAccess(id);
  if (!access) return apiError("Gift not found", 404);
  if (access.via === "admin") return apiError("Admins cannot publish gifts", 403);

  const { data: body, error } = await readJson<unknown>(request);
  if (error) return apiError(error, 400);
  const parsed = publishSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      parsed.error.issues[0]?.message ?? "Invalid publish settings",
      400,
    );
  }

  const admin = getAdminClient();
  if (!admin) return apiError("Database is not configured", 503);

  const gift = access.gift;
  const user = await getCurrentUser();
  const entitlements = await getEntitlements(user?.id);

  let content;
  try {
    content = giftContentSchema.parse({
      ...(gift.templates?.default_content ?? {}),
      ...gift.content_data,
    });
  } catch {
    return apiError("Finish the gift content before publishing.", 422);
  }

  const contentIssue = contentEntitlementError(content, entitlements);
  if (contentIssue) {
    return apiError(entitlementErrorMessage(contentIssue), 402, contentIssue);
  }

  if (gift.templates?.is_premium && !entitlements.can("premium_templates")) {
    return apiError(
      "This template is part of Heartly Premium. Upgrade to publish it.",
      402,
      "premium_required:premium_templates",
    );
  }

  if (
    parsed.data.visibility === "password" &&
    !entitlements.can("password_protection")
  ) {
    return apiError(
      "Password protection is a Premium feature.",
      402,
      "premium_required:password_protection",
    );
  }

  if (content.music.enabled && !entitlements.can("music")) {
    return apiError(
      "Background music is a Premium feature.",
      402,
      "premium_required:music",
    );
  }

  if (parsed.data.removeBranding && !entitlements.can("remove_branding")) {
    return apiError(
      "Removing Heartly branding is a Premium feature.",
      402,
      "premium_required:remove_branding",
    );
  }

  const scheduledAt = parsed.data.scheduledAt
    ? new Date(parsed.data.scheduledAt)
    : null;
  if (scheduledAt && scheduledAt.getTime() > Date.now()) {
    if (!entitlements.can("scheduled_delivery")) {
      return apiError(
        "Scheduled delivery is a Premium feature.",
        402,
        "premium_required:scheduled_delivery",
      );
    }
  }

  if (parsed.data.visibility === "password" && !parsed.data.password) {
    return apiError("Add a password for this gift.", 422);
  }

  if (gift.content_data.media && Array.isArray(gift.content_data.media)) {
    if (gift.content_data.media.length > entitlements.maxMedia) {
      return apiError(
        `Your plan includes up to ${entitlements.maxMedia} photos per gift.`,
        402,
        "limit:max_media",
      );
    }
  }

  if (!user) {
    const tokens = await getGuestTokens();
    const guestIds = Object.keys(tokens);
    if (guestIds.length) {
      const { count } = await admin
        .from("gifts")
        .select("id", { count: "exact", head: true })
        .in("id", guestIds)
        .eq("status", "published")
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
      if ((count ?? 0) >= entitlements.maxActiveGifts) {
        return apiError(
          `This free plan includes ${entitlements.maxActiveGifts} active gifts. Sign in to manage more, or upgrade for more room.`,
          402,
          "limit_reached:max_active_gifts",
        );
      }
    }
  }

  const passwordHash =
    parsed.data.visibility === "password" && parsed.data.password
      ? hashPassword(parsed.data.password)
      : null;

  const updatePayload = {
    status: "published" as const,
    visibility: parsed.data.visibility,
    password_hash: passwordHash,
    expires_at: parsed.data.expiresAt ?? null,
    scheduled_at: scheduledAt?.toISOString() ?? null,
    content_data: {
      ...content,
      branding: { remove: parsed.data.removeBranding },
    },
    published_at: gift.published_at ?? new Date().toISOString(),
  };

  let query = admin
    .from("gifts")
    .update(updatePayload)
    .eq("id", id);
  if (typeof parsed.data.revision === "number") {
    query = query.eq("revision", parsed.data.revision);
  }

  const { data, error: publishError } = await query
    .select("slug, revision, published_at, scheduled_at")
    .maybeSingle();

  if (publishError) {
    const message = publishError.message;
    if (message.startsWith("premium_required:") || message.startsWith("limit_reached:")) {
      return apiError(entitlementErrorMessage(message), 402, message);
    }
    return apiError("Could not publish this gift right now.", 500);
  }
  if (!data) {
    return apiError("This gift was changed somewhere else. Refresh and try again.", 409);
  }

  const nextRevision = data.revision ? data.revision + 1 : 1;
  await admin
    .from("gifts")
    .update({ revision: nextRevision })
    .eq("id", id)
    .eq("revision", data.revision ?? 0);

  if (gift.sender_id && gift.status !== "published") {
    try {
      const { data: sender } = await admin
        .from("profiles")
        .select("email")
        .eq("id", gift.sender_id)
        .maybeSingle();
      const link = absoluteUrl(`/g/${data.slug}`);
      const isScheduled = Boolean(
        scheduledAt && scheduledAt.getTime() > Date.now(),
      );
      await sendTransactionalEmail({
        to: sender?.email,
        subject: isScheduled
          ? "Your Heartly gift is scheduled"
          : "Your Heartly gift is live",
        text: isScheduled
          ? `Your gift is scheduled and will open on ${formatDateTime(scheduledAt)}.\n\nPreview it: ${link}\n\nHeartly`
          : `Your gift is live and ready to share.\n\nOpen it: ${link}\n\nHeartly`,
      });
    } catch {
      // Email delivery is best effort; publishing already succeeded.
    }
  }

  return apiOk({
    slug: data.slug,
    revision: nextRevision,
    publishedAt: data.published_at,
    scheduledAt: data.scheduled_at,
    url: `/g/${data.slug}`,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await assertSameOrigin())) return apiError("Invalid origin", 403);
  const { id } = await params;
  const access = await getGiftAccess(id);
  if (!access || access.via === "admin") return apiError("Gift not found", 404);
  const admin = getAdminClient();
  if (!admin) return apiError("Database is not configured", 503);
  const { data, error } = await admin
    .from("gifts")
    .update({ status: "unpublished", visibility: "unlisted", password_hash: null })
    .eq("id", id)
    .select("revision")
    .maybeSingle();
  if (error) return apiError("Could not unpublish this gift", 500);
  return apiOk({ revision: data?.revision ?? access.gift.revision });
}
