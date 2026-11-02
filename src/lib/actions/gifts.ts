"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser, getEntitlements } from "@/lib/auth";
import { databaseSetupMessage } from "@/lib/env";
import {
  generateGiftSlug,
  hashOwnershipToken,
  setGuestToken,
  clearGuestToken,
} from "@/lib/gift/security";
import { mergeGiftContent } from "@/lib/gift/schema";
import { getGiftAccess } from "@/lib/gift/access";
import type { ActionState } from "@/lib/actions/state";
import type { Template } from "@/lib/types";

const createSchema = z.object({
  templateSlug: z.string().min(1),
  recipientName: z.string().trim().max(120).optional(),
});

export async function createGiftAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = createSchema.safeParse({
    templateSlug: formData.get("templateSlug"),
    recipientName: formData.get("recipientName") ?? "",
  });
  if (!parsed.success) {
    return { status: "error", message: "Choose a template to begin." };
  }

  const admin = getAdminClient();
  if (!admin) {
    return { status: "error", message: databaseSetupMessage() };
  }

  const { data: templateData, error: templateError } = await admin
    .from("templates")
    .select("*")
    .eq("slug", parsed.data.templateSlug)
    .eq("is_active", true)
    .maybeSingle();
  if (templateError || !templateData) {
    return { status: "error", message: "That template is no longer available." };
  }
  const template = templateData as Template;

  const user = await getCurrentUser();
  const entitlements = await getEntitlements(user?.id);
  if (template.is_premium && !entitlements.can("premium_templates")) {
    return {
      status: "error",
      message:
        "That template is part of Heartly Premium. Upgrade to use it, or start with one of the free designs.",
    };
  }

  const content = mergeGiftContent(template.default_content, {
    recipientName: parsed.data.recipientName ?? "",
    title: (template.default_content as { title?: string }).title ?? template.name,
  });

  const token = user ? null : randomBytes(24).toString("base64url");
  const baseRow = {
    sender_id: user?.id ?? null,
    guest_token_hash: token ? hashOwnershipToken(token) : null,
    template_id: template.id,
    category_id: template.category_id,
    recipient_name: content.recipientName,
    sender_name: content.senderName,
    title: content.title,
    message: content.message,
    content_data: content,
    status: "draft" as const,
  };

  let inserted: { id: string; slug: string } | null = null;
  let lastError: string | null = null;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const { data, error } = await admin
      .from("gifts")
      .insert({ ...baseRow, slug: generateGiftSlug() })
      .select("id, slug")
      .single();
    if (!error && data) {
      inserted = data as { id: string; slug: string };
      break;
    }
    lastError = error?.message ?? "Could not create the gift.";
  }

  if (!inserted) {
    return { status: "error", message: lastError ?? "Could not create the gift." };
  }

  if (token) {
    await setGuestToken(inserted.id, token);
  }

  revalidatePath("/dashboard");
  redirect(`/studio/${inserted.id}`);
}

export async function duplicateGiftAction(giftId: string) {
  const admin = getAdminClient();
  const access = await getGiftAccess(giftId);
  if (!admin || !access) return { status: "error" as const, message: "Gift not found." };
  const gift = access.gift;
  const user = await getCurrentUser();
  if (!user || gift.sender_id !== user.id) {
    return { status: "error" as const, message: "Only the sender can duplicate this gift." };
  }

  const { data } = await admin
    .from("gifts")
    .insert({
      sender_id: user.id,
      template_id: gift.template_id,
      category_id: gift.category_id,
      recipient_name: gift.recipient_name,
      sender_name: gift.sender_name,
      title: gift.title ? `${gift.title} (copy)` : "Untitled gift",
      message: gift.message,
      content_data: {
        ...gift.content_data,
        title: gift.title ? `${gift.title} (copy)` : "Untitled gift",
      },
      slug: generateGiftSlug(),
      status: "draft",
    })
    .select("id")
    .single();

  if (!data) return { status: "error" as const, message: "Could not duplicate the gift." };
  revalidatePath("/dashboard/gifts");
  redirect(`/studio/${data.id}`);
}

export async function deleteGiftAction(giftId: string) {
  const admin = getAdminClient();
  const access = await getGiftAccess(giftId);
  if (!admin || !access) {
    return { status: "error" as const, message: "Gift not found." };
  }
  const { error } = await admin.from("gifts").delete().eq("id", giftId);
  if (error) {
    return { status: "error" as const, message: error.message };
  }
  if (access.via === "guest") {
    await clearGuestToken(giftId);
  }
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/gifts");
  return { status: "success" as const, message: "Gift deleted." };
}
