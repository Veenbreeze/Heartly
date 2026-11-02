import type { Plan, PlanLimits, Subscription } from "@/lib/types";
import { getFallbackPlan } from "@/lib/templates/data";

export type BooleanFeature =
  | "premium_templates"
  | "advanced_animation"
  | "music"
  | "custom_fonts"
  | "qr_code"
  | "advanced_analytics"
  | "scheduled_delivery"
  | "remove_branding"
  | "gift_expiry"
  | "password_protection";

export interface Entitlements {
  tier: "free" | "premium";
  planName: string;
  planCode: string;
  limits: PlanLimits;
  subscription: Subscription | null;
  maxActiveGifts: number;
  maxMedia: number;
  can: (feature: BooleanFeature) => boolean;
}

export const FREE_LIMITS: PlanLimits = {
  tier: "free",
  max_active_gifts: 3,
  max_media: 3,
  premium_templates: false,
  advanced_animation: false,
  music: false,
  custom_fonts: false,
  qr_code: false,
  advanced_analytics: false,
  scheduled_delivery: false,
  remove_branding: false,
  gift_expiry: false,
  password_protection: false,
  plan_name: "Free",
};

export function subscriptionIsActive(
  subscription:
    | Pick<Subscription, "status" | "current_period_end">
    | null
    | undefined,
  now = Date.now(),
): boolean {
  if (!subscription || subscription.status !== "active") return false;
  if (!subscription.current_period_end) return true;
  const end = new Date(subscription.current_period_end).getTime();
  return Number.isFinite(end) && end > now;
}

export function entitlementsFromPlan(
  plan: Plan | null | undefined,
  subscription: Subscription | null = null,
): Entitlements {
  const fallback = getFallbackPlan("free");
  const limits: PlanLimits = {
    ...FREE_LIMITS,
    ...(plan?.limits ?? {}),
  };
  const tier =
    limits.tier === "premium" || limits.premium_templates ? "premium" : "free";

  return {
    tier,
    planName: plan?.name ?? limits.plan_name ?? "Free",
    planCode: plan?.code ?? "free",
    limits,
    subscription,
    maxActiveGifts: limits.max_active_gifts ?? fallback.limits.max_active_gifts ?? 3,
    maxMedia: limits.max_media ?? fallback.limits.max_media ?? 3,
    can(feature) {
      return Boolean(limits[feature]);
    },
  };
}

export function freeEntitlements(): Entitlements {
  return entitlementsFromPlan(getFallbackPlan("free"));
}

export function entitlementErrorMessage(code: string): string {
  if (code.includes("premium_templates")) {
    return "That template is part of Heartly Premium. Upgrade to use it.";
  }
  if (code.includes("advanced_animation")) {
    return "That animation is a Premium feature.";
  }
  if (code.includes("music")) {
    return "Background music is a Premium feature.";
  }
  if (code.includes("scheduled_delivery")) {
    return "Scheduled delivery is a Premium feature.";
  }
  if (code.includes("max_active_gifts")) {
    return "You have reached the active gift limit for your plan.";
  }
  if (code.includes("password")) {
    return "Password protection is a Premium feature.";
  }
  if (code.includes("qr_code")) {
    return "QR codes are available on Heartly Premium.";
  }
  return "This feature is not available on your current plan.";
}
