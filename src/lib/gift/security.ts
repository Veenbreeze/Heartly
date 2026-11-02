import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import type { GiftContent } from "@/lib/gift/schema";
import { BASIC_ANIMATIONS } from "@/lib/gift/schema";
import type { Entitlements } from "@/lib/entitlements";

const SLUG_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";
const GUEST_COOKIE = "heartly_guest_gifts";
const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function generateGiftSlug(length = 12): string {
  let slug = "";
  for (let index = 0; index < length; index += 1) {
    slug += SLUG_ALPHABET[randomInt(SLUG_ALPHABET.length)];
  }
  return slug;
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function hashOwnershipToken(token: string): string {
  return sha256(`heartly-owner:${token}`);
}

export function hashVisitor(input: string): string {
  return sha256(`heartly-visitor:${input}`);
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string | null): boolean {
  if (!stored) return false;
  const [scheme, saltHex, hashHex] = stored.split(":");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  if (saltHex.length % 2 !== 0 || hashHex.length % 2 !== 0) return false;
  if (!/^[0-9a-f]+$/i.test(saltHex) || !/^[0-9a-f]+$/i.test(hashHex)) return false;
  try {
    const expected = Buffer.from(hashHex, "hex");
    if (expected.length < 32) return false;
    const salt = Buffer.from(saltHex, "hex");
    if (salt.length < 8) return false;
    const actual = scryptSync(password, salt, expected.length);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

export interface GuestTokenMap {
  [giftId: string]: string;
}

function encodeCookie(value: GuestTokenMap): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decodeCookie(value: string): GuestTokenMap {
  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    );
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const result: GuestTokenMap = {};
    for (const [key, token] of Object.entries(parsed)) {
      if (typeof token === "string" && token.length >= 20) {
        result[key] = token;
      }
    }
    return result;
  } catch {
    return {};
  }
}

export async function getGuestTokens(): Promise<GuestTokenMap> {
  const store = await cookies();
  const raw = store.get(GUEST_COOKIE)?.value;
  return raw ? decodeCookie(raw) : {};
}

export async function setGuestToken(giftId: string, token: string) {
  const store = await cookies();
  const existing = await getGuestTokens();
  const next = { ...existing, [giftId]: token };
  store.set(GUEST_COOKIE, encodeCookie(next), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GUEST_COOKIE_MAX_AGE,
  });
}

export async function clearGuestToken(giftId: string) {
  const store = await cookies();
  const existing = await getGuestTokens();
  delete existing[giftId];
  store.set(GUEST_COOKIE, encodeCookie(existing), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GUEST_COOKIE_MAX_AGE,
  });
}

export async function guestOwnsGift(giftId: string, tokenHash: string | null) {
  if (!tokenHash) return false;
  const tokens = await getGuestTokens();
  const token = tokens[giftId];
  if (!token) return false;
  return hashOwnershipToken(token) === tokenHash;
}

export function contentEntitlementError(
  content: GiftContent,
  entitlements: Entitlements,
): string | null {
  if (
    content.animation.type &&
    !BASIC_ANIMATIONS.includes(content.animation.type) &&
    !entitlements.can("advanced_animation")
  ) {
    return "premium_required:advanced_animation";
  }
  if (content.music.enabled && !entitlements.can("music")) {
    return "premium_required:music";
  }
  return null;
}

function unlockSignature(slug: string, expires: number): string {
  const secret =
    process.env.GIFT_UNLOCK_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "heartly-development-only";
  return createHmac("sha256", secret).update(`${slug}:${expires}`).digest("hex");
}

export function createUnlockToken(slug: string, ttlSeconds = 60 * 60 * 6): string {
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  return `${expires}.${unlockSignature(slug, expires)}`;
}

export function verifyUnlockToken(slug: string, token: string | undefined): boolean {
  if (!token) return false;
  const [expiresRaw, signature] = token.split(".");
  const expires = Number(expiresRaw);
  if (!signature || !/^[0-9a-f]{64}$/i.test(signature)) return false;
  if (!Number.isFinite(expires)) return false;
  if (expires < Math.floor(Date.now() / 1000)) return false;
  const expected = unlockSignature(slug, expires);
  try {
    return timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex"),
    );
  } catch {
    return false;
  }
}

export function unlockCookieName(slug: string) {
  return `heartly_unlock_${slug}`;
}
