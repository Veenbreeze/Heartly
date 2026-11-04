import { describe, expect, it } from "vitest";
import {
  entitlementErrorMessage,
  entitlementsFromPlan,
  freeEntitlements,
  FREE_LIMITS,
  subscriptionIsActive,
} from "@/lib/entitlements";
import { getFallbackPlan } from "@/lib/templates/data";

describe("entitlements", () => {
  it("defaults to the free plan", () => {
    const free = freeEntitlements();

    expect(free.tier).toBe("free");
    expect(free.maxActiveGifts).toBe(3);
    expect(free.maxMedia).toBe(3);
    expect(free.can("premium_templates")).toBe(false);
    expect(free.can("music")).toBe(false);
  });

  it("unlocks premium features from a premium plan", () => {
    const premium = entitlementsFromPlan(getFallbackPlan("premium"));

    expect(premium.tier).toBe("premium");
    expect(premium.planName).toBe("Heartly Premium");
    expect(premium.maxActiveGifts).toBe(20);
    expect(premium.maxMedia).toBe(5);
    expect(premium.can("premium_templates")).toBe(true);
    expect(premium.can("advanced_animation")).toBe(true);
    expect(premium.can("music")).toBe(true);
    expect(premium.can("qr_code")).toBe(true);
  });

  it("scales limits across premium tiers", () => {
    const plus = entitlementsFromPlan(getFallbackPlan("premium_plus"));
    const max = entitlementsFromPlan(getFallbackPlan("premium_max"));

    expect(plus.tier).toBe("premium");
    expect(plus.maxActiveGifts).toBe(50);
    expect(plus.maxMedia).toBe(10);
    expect(max.tier).toBe("premium");
    expect(max.maxActiveGifts).toBe(100);
    expect(max.maxMedia).toBe(20);
  });

  it("merges partial plan limits over free limits", () => {
    const custom = entitlementsFromPlan({
      ...getFallbackPlan("premium"),
      limits: { max_media: 12 },
    });

    expect(custom.maxMedia).toBe(12);
    expect(custom.maxActiveGifts).toBe(FREE_LIMITS.max_active_gifts);
    expect(custom.tier).toBe("free");
  });

  it("only treats current active subscriptions as active", () => {
    const now = Date.parse("2026-10-31T12:00:00.000Z");

    expect(subscriptionIsActive(null, now)).toBe(false);
    expect(
      subscriptionIsActive(
        { status: "active", current_period_end: "2026-10-31T12:00:01.000Z" },
        now,
      ),
    ).toBe(true);
    expect(
      subscriptionIsActive(
        { status: "active", current_period_end: "2026-10-31T11:59:59.000Z" },
        now,
      ),
    ).toBe(false);
    expect(
      subscriptionIsActive({ status: "canceled", current_period_end: null }, now),
    ).toBe(false);
  });

  it("maps entitlement errors to friendly copy", () => {
    expect(entitlementErrorMessage("premium_required:music")).toContain("music");
    expect(entitlementErrorMessage("premium_required:qr_code")).toContain("QR");
    expect(entitlementErrorMessage("unknown_feature")).toContain("current plan");
  });
});
