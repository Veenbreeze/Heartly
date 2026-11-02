import { getAdminClient } from "@/lib/supabase/admin";
import { getGiftAccess } from "@/lib/gift/access";
import { getCurrentUser } from "@/lib/auth";
import { generateGiftSlug } from "@/lib/gift/security";
import { apiError, apiOk, assertSameOrigin } from "@/lib/api";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await assertSameOrigin())) return apiError("Invalid origin", 403);
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return apiError("Sign in to duplicate this gift", 401);
  const access = await getGiftAccess(id);
  if (!access || access.gift.sender_id !== user.id) {
    return apiError("Gift not found", 404);
  }

  const admin = getAdminClient();
  if (!admin) return apiError("Database is not configured", 503);
  const gift = access.gift;
  const title = gift.title ? `${gift.title} (copy)` : "Untitled gift";

  const { data, error } = await admin
    .from("gifts")
    .insert({
      sender_id: user.id,
      template_id: gift.template_id,
      category_id: gift.category_id,
      recipient_name: gift.recipient_name,
      sender_name: gift.sender_name,
      title,
      message: gift.message,
      content_data: { ...gift.content_data, title },
      slug: generateGiftSlug(),
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !data) {
    return apiError("Could not duplicate this gift", 500);
  }
  return apiOk({ id: data.id, url: `/studio/${data.id}` }, 201);
}
