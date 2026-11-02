import { describe, expect, it } from "vitest";
import {
  defaultGiftContent,
  giftContentSchema,
  giftPublishSchema,
  mergeGiftContent,
  safeGiftContent,
} from "@/lib/gift/schema";

describe("gift content schema", () => {
  it("creates safe defaults", () => {
    const content = defaultGiftContent();

    expect(content.version).toBe(1);
    expect(content.theme.background).toBe("#FFF9F7");
    expect(content.theme.accent).toBe("#E85D75");
    expect(content.animation.type).toBe("fade");
    expect(content.music.enabled).toBe(false);
    expect(content.media).toEqual([]);
    expect(content.branding.remove).toBe(false);
  });

  it("merges template defaults with user content", () => {
    const content = mergeGiftContent(
      {
        title: "Happy birthday",
        theme: { accent: "#123456" },
        animation: { type: "confetti" },
      },
      {
        recipientName: "Neema",
        message: "Have the best day.",
        theme: { background: "#FFFFFF" },
      },
    );

    expect(content.title).toBe("Happy birthday");
    expect(content.recipientName).toBe("Neema");
    expect(content.message).toBe("Have the best day.");
    expect(content.theme.accent).toBe("#123456");
    expect(content.theme.background).toBe("#FFFFFF");
    expect(content.animation.type).toBe("confetti");
  });

  it("rejects unsafe media URLs", () => {
    const result = giftContentSchema.safeParse({
      ...defaultGiftContent(),
      media: [{ url: "javascript:alert(1)", alt: "" }],
    });

    expect(result.success).toBe(false);
  });

  it("rejects oversized messages", () => {
    const result = giftContentSchema.safeParse({
      ...defaultGiftContent(),
      message: "x".repeat(5001),
    });

    expect(result.success).toBe(false);
  });

  it("falls back safely when content is invalid", () => {
    const content = safeGiftContent({}, { theme: { accent: "not-a-colour" } });

    expect(content).toEqual(defaultGiftContent());
  });
});

describe("publish schema", () => {
  it("accepts password protection with a valid password", () => {
    const result = giftPublishSchema.safeParse({
      visibility: "password",
      password: "secret123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects short passwords and invalid timestamps", () => {
    expect(
      giftPublishSchema.safeParse({ visibility: "password", password: "abc" })
        .success,
    ).toBe(false);
    expect(
      giftPublishSchema.safeParse({
        visibility: "public",
        expiresAt: "tomorrow",
      }).success,
    ).toBe(false);
  });
});
