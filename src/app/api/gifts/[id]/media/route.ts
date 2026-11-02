import { randomUUID } from "node:crypto";
import { getAdminClient } from "@/lib/supabase/admin";
import { getGiftAccess } from "@/lib/gift/access";
import { getCurrentUser, getEntitlements } from "@/lib/auth";
import { apiError, apiOk, assertSameOrigin } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await assertSameOrigin())) return apiError("Invalid origin", 403);
  const { id } = await params;
  const access = await getGiftAccess(id);
  if (!access) return apiError("Gift not found", 404);
  if (access.via === "admin") return apiError("Admins cannot edit gifts", 403);

  if (!rateLimit(`upload:${id}`, 20, 60_000).allowed) {
    return apiError("Too many uploads. Try again in a minute.", 429);
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return apiError("Choose an image to upload", 400);

  const extension = ALLOWED.get(file.type);
  if (!extension) {
    return apiError("Use a JPG, PNG, WebP, or GIF image.", 415);
  }
  if (file.size > MAX_BYTES) {
    return apiError("Photos must be 4MB or smaller.", 413);
  }

  const user = await getCurrentUser();
  const entitlements = await getEntitlements(user?.id);
  const existingMedia = Array.isArray(access.gift.content_data.media)
    ? access.gift.content_data.media
    : [];
  if (existingMedia.length >= entitlements.maxMedia) {
    return apiError(
      `Your plan includes up to ${entitlements.maxMedia} photos per gift.`,
      402,
      "limit:max_media",
    );
  }

  const admin = getAdminClient();
  if (!admin) return apiError("Storage is not configured", 503);

  const path = `${id}/${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await admin.storage
    .from("gift-images")
    .upload(path, buffer, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
  if (uploadError) {
    return apiError("Could not upload that image. Try a smaller file.", 500);
  }

  const { data: publicUrlData } = admin.storage
    .from("gift-images")
    .getPublicUrl(path);
  const publicUrl = publicUrlData.publicUrl;

  const { data: row, error: rowError } = await admin
    .from("gift_media")
    .insert({
      gift_id: id,
      storage_path: path,
      public_url: publicUrl,
      media_type: "image",
      alt_text: "",
      sort_order: existingMedia.length,
      size_bytes: file.size,
    })
    .select("id")
    .single();

  if (rowError) {
    await admin.storage.from("gift-images").remove([path]);
    return apiError("Could not save that image. Try again.", 500);
  }

  return apiOk({
    media: {
      id: row.id,
      url: publicUrl,
      alt: "",
    },
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await assertSameOrigin())) return apiError("Invalid origin", 403);
  const { id } = await params;
  const access = await getGiftAccess(id);
  if (!access) return apiError("Gift not found", 404);
  const url = new URL(request.url);
  const mediaId = url.searchParams.get("mediaId");
  const admin = getAdminClient();
  if (!admin || !mediaId) return apiError("Media item not found", 404);

  const { data: media } = await admin
    .from("gift_media")
    .select("id, storage_path")
    .eq("id", mediaId)
    .eq("gift_id", id)
    .maybeSingle();
  if (!media) return apiError("Media item not found", 404);

  await admin.storage.from("gift-images").remove([media.storage_path]);
  await admin.from("gift_media").delete().eq("id", mediaId);
  return apiOk();
}
