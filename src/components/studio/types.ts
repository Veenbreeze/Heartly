import type { GiftContent, TemplateType, AnimationType } from "@/lib/gift/schema";
import type { GiftStatus, GiftVisibility, GiftWithMeta, PlanLimits, Template } from "@/lib/types";

export interface StudioCapabilities {
  tier: "free" | "premium";
  planName: string;
  maxMedia: number;
  maxActiveGifts: number;
  premiumTemplates: boolean;
  advancedAnimation: boolean;
  music: boolean;
  customFonts: boolean;
  qrCode: boolean;
  advancedAnalytics: boolean;
  scheduledDelivery: boolean;
  removeBranding: boolean;
  giftExpiry: boolean;
  passwordProtection: boolean;
  limits: PlanLimits;
}

export interface StudioGift {
  id: string;
  slug: string;
  status: GiftStatus;
  visibility: GiftVisibility;
  revision: number;
  expiresAt: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  updatedAt: string;
}

export interface PublishSettings {
  visibility: GiftVisibility;
  password: string;
  scheduledAt: string;
  expiresAt: string;
  removeBranding: boolean;
}

export interface StudioEditorProps {
  gift: StudioGift;
  template: Template;
  templateType: TemplateType;
  initialContent: GiftContent;
  capabilities: StudioCapabilities;
  isGuest: boolean;
  defaultAnimation: AnimationType;
  senderName: string;
  templateArtUrl: string;
}

export type { GiftContent, GiftWithMeta };
