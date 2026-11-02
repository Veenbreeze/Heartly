import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudioEditor } from "@/components/studio/studio-editor";
import { getGiftAccess } from "@/lib/gift/access";
import { safeGiftContent } from "@/lib/gift/schema";
import {
  getCurrentProfile,
  getCurrentUser,
  getEntitlements,
} from "@/lib/auth";
import type { StudioCapabilities } from "@/components/studio/types";
import type { AnimationType, TemplateType } from "@/lib/gift/schema";

export const metadata: Metadata = {
  title: "Gift studio",
  robots: { index: false, follow: false },
};

export default async function StudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const access = await getGiftAccess(id);
  if (!access || access.via === "admin") notFound();

  const gift = access.gift;
  const template = gift.templates;
  if (!template) notFound();

  const currentUser = await getCurrentUser();
  const entitlements = await getEntitlements(currentUser?.id);
  const profile = currentUser ? await getCurrentProfile() : null;

  const content = safeGiftContent(template.default_content, gift.content_data);
  const capabilities: StudioCapabilities = {
    tier: entitlements.tier,
    planName: entitlements.planName,
    maxMedia: entitlements.maxMedia,
    maxActiveGifts: entitlements.maxActiveGifts,
    premiumTemplates: entitlements.can("premium_templates"),
    advancedAnimation: entitlements.can("advanced_animation"),
    music: entitlements.can("music"),
    customFonts: entitlements.can("custom_fonts"),
    qrCode: entitlements.can("qr_code"),
    advancedAnalytics: entitlements.can("advanced_analytics"),
    scheduledDelivery: entitlements.can("scheduled_delivery"),
    removeBranding: entitlements.can("remove_branding"),
    giftExpiry: entitlements.can("gift_expiry"),
    passwordProtection: entitlements.can("password_protection"),
    limits: entitlements.limits,
  };

  const animationConfig = template.animation_config as { type?: AnimationType };
  const defaultAnimation: AnimationType = animationConfig.type ?? "fade";

  return (
    <StudioEditor
      gift={{
        id: gift.id,
        slug: gift.slug,
        status: gift.status,
        visibility: gift.visibility,
        revision: gift.revision,
        expiresAt: gift.expires_at,
        scheduledAt: gift.scheduled_at,
        publishedAt: gift.published_at,
        updatedAt: gift.updated_at,
      }}
      template={template}
      templateType={template.template_type as TemplateType}
      initialContent={content}
      capabilities={capabilities}
      isGuest={!gift.sender_id}
      defaultAnimation={defaultAnimation}
      senderName={profile?.full_name ?? ""}
      templateArtUrl={`/api/template-art/${template.slug}`}
    />
  );
}
