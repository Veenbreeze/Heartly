import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatMoney,
  initials,
  safeRedirectPath,
  slugify,
  truncate,
} from "@/lib/utils";

describe("formatMoney", () => {
  it("formats Tanzanian shillings without decimals", () => {
    expect(formatMoney(15_000, "TZS")).toContain("15,000");
  });

  it("formats USD cents as dollars", () => {
    expect(formatMoney(599, "USD")).toBe("$5.99");
  });
});

describe("safeRedirectPath", () => {
  it("accepts local paths and preserves query strings", () => {
    expect(safeRedirectPath("/dashboard/billing")).toBe("/dashboard/billing");
    expect(safeRedirectPath(" /checkout/success?reference=HTL-123 ")).toBe(
      "/checkout/success?reference=HTL-123",
    );
  });

  it("rejects external and malformed redirects", () => {
    expect(safeRedirectPath("https://example.com")).toBe("/dashboard");
    expect(safeRedirectPath("//example.com")).toBe("/dashboard");
    expect(safeRedirectPath("/\\example.com")).toBe("/dashboard");
    expect(safeRedirectPath("/dashboard\nLocation: https://example.com")).toBe(
      "/dashboard",
    );
    expect(safeRedirectPath(null, "/")).toBe("/");
  });
});

describe("display helpers", () => {
  it("slugifies titles", () => {
    expect(slugify("Hello, Heartly!")).toBe("hello-heartly");
  });

  it("creates initials from names and emails", () => {
    expect(initials("Ada Lovelace")).toBe("AL");
    expect(initials(null, "grace@example.com")).toBe("G");
  });

  it("truncates long strings", () => {
    expect(truncate("abcdef", 4)).toBe("abc…");
    expect(truncate("abc", 4)).toBe("abc");
  });

  it("returns a dash for missing dates", () => {
    expect(formatDate(null)).toBe("—");
  });
});
