import type { AnimationType, GiftContent, TemplateType } from "@/lib/gift/schema";

export type UserRole = "user" | "admin";
export type GiftStatus = "draft" | "published" | "unpublished" | "expired";
export type GiftVisibility = "public" | "unlisted" | "password";
export type SubscriptionStatus =
  | "pending"
  | "active"
  | "past_due"
  | "canceled"
  | "expired";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  locale: "en" | "sw";
  currency: "TZS" | "USD";
  bio: string | null;
  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  thumbnail_url: string | null;
  is_premium: boolean;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Template {
  id: string;
  slug: string;
  name: string;
  description: string;
  category_id: string;
  template_type: TemplateType;
  thumbnail_url: string | null;
  preview_url: string | null;
  is_premium: boolean;
  config_schema: Record<string, unknown>;
  default_content: Partial<GiftContent> & Record<string, unknown>;
  default_colors: Record<string, string>;
  default_typography: Record<string, string>;
  animation_config: { type?: AnimationType; intensity?: string };
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Gift {
  id: string;
  sender_id: string | null;
  template_id: string;
  category_id: string;
  recipient_name: string;
  sender_name: string;
  title: string;
  message: string;
  slug: string;
  content_data: Partial<GiftContent> & Record<string, unknown>;
  status: GiftStatus;
  visibility: GiftVisibility;
  password_hash: string | null;
  expires_at: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  last_viewed_at: string | null;
  view_count: number;
  revision: number;
  created_at: string;
  updated_at: string;
}

export interface GiftMedia {
  id: string;
  gift_id: string;
  storage_path: string;
  public_url: string | null;
  media_type: "image" | "audio" | "video";
  alt_text: string | null;
  sort_order: number;
  size_bytes: number | null;
  created_at: string;
}

export interface GiftView {
  id: string;
  gift_id: string;
  visitor_hash: string;
  view_date: string;
  referrer: string | null;
  created_at: string;
}

export interface GiftResponse {
  id: string;
  gift_id: string;
  response_type: "accept" | "decline" | "answer" | "message" | "reaction";
  response_data: Record<string, string>;
  message: string | null;
  respondent_name: string | null;
  visitor_hash: string | null;
  created_at: string;
}

export interface Plan {
  id: string;
  code: string;
  name: string;
  description: string;
  price_tzs: number;
  price_usd_cents: number;
  billing_interval: "month" | "year" | "lifetime";
  features: string[];
  limits: PlanLimits;
  is_active: boolean;
  sort_order: number;
}

export interface PlanLimits {
  tier?: "free" | "premium" | string;
  max_active_gifts?: number;
  max_media?: number;
  premium_templates?: boolean;
  advanced_animation?: boolean;
  music?: boolean;
  custom_fonts?: boolean;
  qr_code?: boolean;
  advanced_analytics?: boolean;
  scheduled_delivery?: boolean;
  remove_branding?: boolean;
  gift_expiry?: boolean;
  password_protection?: boolean;
  plan_name?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  provider: string;
  provider_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
  plans?: Plan | null;
}

export interface Payment {
  id: string;
  user_id: string | null;
  subscription_id: string | null;
  plan_id: string;
  provider: string;
  provider_reference: string;
  amount: number;
  currency: "TZS" | "USD";
  status: "pending" | "succeeded" | "failed" | "refunded";
  checkout_url: string | null;
  metadata: Record<string, unknown>;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  plans?: Plan | null;
}

export interface PaymentEvent {
  id: string;
  provider: string;
  provider_event_id: string;
  payment_id: string | null;
  event_type: string;
  payload: Record<string, unknown>;
  processed_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string | null;
  gift_id: string | null;
  reason: string;
  details: string | null;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  resolution_notes: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
  gifts?: Pick<Gift, "id" | "title" | "slug" | "status" | "visibility"> | null;
}

export interface PlatformSetting {
  key: string;
  value: unknown;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_hash: string | null;
  created_at: string;
  profiles?: { full_name: string | null; email: string | null } | null;
}

export interface SavedTemplateRow {
  user_id: string;
  template_id: string;
  created_at: string;
  templates?: Template | null;
}

export interface GiftWithMeta extends Gift {
  guest_token_hash?: string | null;
  templates?: Template | null;
  categories?: Category | null;
}

export interface TemplateWithCategory extends Template {
  categories?: Category | null;
}
