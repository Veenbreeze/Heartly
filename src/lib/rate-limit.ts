import { createHash } from "node:crypto";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Process-local fixed-window limiter. It protects against accidental bursts and
 * basic abuse in a single Node instance. Production deployments with multiple
 * instances should also enable Vercel WAF / Upstash Redis for global limits.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }
  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }
  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

export function privacyHash(value: string): string {
  const secret =
    process.env.GIFT_UNLOCK_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "heartly-privacy";
  return createHash("sha256").update(`${secret}:${value}`).digest("hex");
}

export function clientKey(headers: Headers, bucket: string): string {
  const forwarded = headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || headers.get("x-real-ip") || "local";
  const day = new Date().toISOString().slice(0, 10);
  return `${bucket}:${privacyHash(`${ip}:${day}`)}`;
}

export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}
