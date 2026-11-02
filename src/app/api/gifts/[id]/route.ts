import { z } from "zod";
import { getAdminClient } from "@/lib/supabase/admin";
import { getGiftAccess } from "@/lib/gift/access";
import { mergeGiftContent } from "@/lib/gift/schema";
import { apiError, apiOk, assertSameOrigin, readJson } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

const saveSchema = z.object({
  content: z.unknown(),
  revision: z.number().int().min(0),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await assertSameOrigin())) return apiError("Invalid origin", 403);
  const { id } = await params;
  const access = await getGiftAccess(id);
  if (!access) return apiError("Gift not found", 404);
  if (access.via === "admin") return apiError("Admins cannot edit gifts", 403);

  const key = `save:${id}`;
  if (!rateLimit(key, 40, 60_000).allowed) {
    return apiError("Saving too quickly. Pause for a moment.", 429);
  }

  const { data: body, error } = await readJson<unknown>(request);
  if (error) return apiError(error, 400);
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) return apiError("Invalid save payload", 400);

  const gift = access.gift;
  if (gift.status === "expired") {
    return apiError("This gift has expired and can no longer be edited.", 409);
  }

  let content;
  try {
    content = mergeGiftContent(gift.templates?.default_content, parsed.data.content);
  } catch {
    return apiError("Some gift content is invalid. Check the fields and try again.", 422);
  }

  const admin = getAdminClient();
  if (!admin) return apiError("Database is not configured", 503);

  const nextRevision = parsed.data.revision + 1;
  const { data, error: updateError } = await admin
    .from("gifts")
    .update({
      content_data: content,
      recipient_name: content.recipientName,
      sender_name: content.senderName,
      title: content.title,
      message: content.message,
      revision: nextRevision,
    })
    .eq("id", id)
    .eq("revision", parsed.data.revision)
    .select("revision, updated_at")
    .maybeSingle();

  if (updateError) {
    return apiError("Could not save this gift right now.", 500);
  }

  if (!data) {
    const { data: current } = await admin
      .from("gifts")
      .select("revision, updated_at, content_data")
      .eq("id", id)
      .maybeSingle();
    return Response.json(
      {
        ok: false,
        error: "This gift was changed somewhere else.",
        code: "revision_conflict",
        current,
      },
      { status: 409 },
    );
  }

  return apiOk({
    revision: data.revision,
    updatedAt: data.updated_at,
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const access = await getGiftAccess(id);
  if (!access) return apiError("Gift not found", 404);
  return apiOk({
    gift: {
      id: access.gift.id,
      revision: access.gift.revision,
      status: access.gift.status,
      content: access.gift.content_data,
      updatedAt: access.gift.updated_at,
    },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const access = await getGiftAccess(id);
  if (!access) return apiError("Gift not found", 404);
  const admin = getAdminClient();
  if (!admin) return apiError("Database is not configured", 503);
  const { error } = await admin.from("gifts").delete().eq("id", id);
  if (error) return apiError("Could not delete this gift", 500);
  return apiOk();
}
