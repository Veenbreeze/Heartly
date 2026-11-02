import { describe, expect, it } from "vitest";
import { freeEntitlements, entitlementsFromPlan } from "@/lib/entitlements";
import { defaultGiftContent } from "@/lib/gift/schema";
import {
  contentEntitlementError,
  createUnlockToken,
  generateGiftSlug,
  hashOwnershipToken,
  hashPassword,
  sha256,
  verifyPassword,
  verifyUnlockToken,
} from "@/lib/gift/security";
import { getFallbackPlan } from "@/lib/templates/data";

describe("gift slugs", () => {
  it("uses a readable alphabet and requested length", () => {
    const slug = generateGiftSlug(16);

    expect(slug).toHaveLength(16);
    expect(slug).toMatch(/^[abcdefghijkmnpqrstuvwxyz23456789]+$/);
  });

  it("produces different slugs", () => {
    expect(generateGiftSlug()).not.toBe(generateGiftSlug());
  });
});

describe("hashes", () => {
  it("is deterministic for ownership tokens", () => {
    expect(hashOwnershipToken("abc")).toBe(hashOwnershipToken("abc"));
    expect(hashOwnershipToken("abc")).not.toBe(hashOwnershipToken("abd"));
    expect(sha256("heartly")).toHaveLength(64);
  });
});

describe("gift passwords", () => {
  it("verifies a matching password", () => {
    const stored = hashPassword("correct horse battery staple");

    expect(verifyPassword("correct horse battery staple", stored)).toBe(true);
    expect(verifyPassword("wrong", stored)).toBe(false);
  });

  it("rejects missing and malformed hashes", () => {
    expect(verifyPassword("anything", null)).toBe(false);
    expect(verifyPassword("anything", "plain-text")).toBe(false);
    expect(verifyPassword("anything", "scrypt:zz:zz")).toBe(false);
  });
});

describe("unlock tokens", () => {
  it("verifies a token for the matching slug", () => {
    const token = createUnlockToken("birthday-gift", 60);

    expect(verifyUnlockToken("birthday-gift", token)).toBe(true);
    expect(verifyUnlockToken("another-gift", token)).toBe(false);
  });

  it("rejects missing, malformed and expired tokens", () => {
    expect(verifyUnlockToken("birthday-gift", undefined)).toBe(false);
    expect(verifyUnlockToken("birthday-gift", "not-a-token")).toBe(false);
    expect(
      verifyUnlockToken("birthday-gift", `${Math.floor(Date.now() / 1000) + 60}.${"z".repeat(64)}`),
    ).toBe(false);
    expect(
      verifyUnlockToken("birthday-gift", createUnlockToken("birthday-gift", -10)),
    ).toBe(false);
  });
});

describe("content entitlements", () => {
  const free = freeEntitlements();
  const premium = entitlementsFromPlan(getFallbackPlan("premium"));

  it("allows basic content on the free plan", () => {
    expect(contentEntitlementError(defaultGiftContent(), free)).toBeNull();
  });

  it("blocks premium animation and music on the free plan", () => {
    const advanced = {
      ...defaultGiftContent(),
      animation: { type: "confetti" as const, intensity: "medium" as const },
    };
    const music = {
      ...defaultGiftContent(),
      music: { enabled: true, track: "dreamy" as const },
    };

    expect(contentEntitlementError(advanced, free)).toBe(
      "premium_required:advanced_animation",
    );
    expect(contentEntitlementError(music, free)).toBe("premium_required:music");
  });

  it("allows premium content for premium subscribers", () => {
    const content = {
      ...defaultGiftContent(),
      animation: { type: "hearts" as const, intensity: "high" as const },
      music: { enabled: true, track: "romantic" as const },
    };

    expect(contentEntitlementError(content, premium)).toBeNull();
  });
});
