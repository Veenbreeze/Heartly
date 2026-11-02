"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase/admin";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import {
  createUnlockToken,
  unlockCookieName,
  verifyPassword,
} from "@/lib/gift/security";

export interface UnlockState {
  error?: string;
}

const unlockSchema = z.object({
  slug: z.string().min(4).max(64),
  password: z.string().min(1).max(72),
});

export async function unlockGift(
  _previous: UnlockState,
  formData: FormData,
): Promise<UnlockState> {
  const parsed = unlockSchema.safeParse({
    slug: formData.get("slug"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter the password for this gift." };
  }

  const requestHeaders = await headers();
  if (
    !rateLimit(clientKey(requestHeaders, `unlock:${parsed.data.slug}`), 6, 60_000)
      .allowed
  ) {
    return { error: "Too many attempts. Please wait a minute and try again." };
  }

  const admin = getAdminClient();
  if (!admin) {
    return { error: "This gift is temporarily unavailable." };
  }

  const { data: gift } = await admin
    .from("gifts")
    .select("id, visibility, password_hash, status, expires_at, scheduled_at")
    .eq("slug", parsed.data.slug)
    .maybeSingle();

  if (
    !gift ||
    gift.visibility !== "password" ||
    gift.status !== "published" ||
    !gift.password_hash
  ) {
    return { error: "That password did not work." };
  }

  const now = Date.now();
  if (gift.expires_at && new Date(gift.expires_at).getTime() <= now) {
    return { error: "This gift has expired." };
  }
  if (gift.scheduled_at && new Date(gift.scheduled_at).getTime() > now) {
    return { error: "This gift is not open yet." };
  }

  if (!verifyPassword(parsed.data.password, gift.password_hash)) {
    return { error: "That password did not work." };
  }

  const jar = await cookies();
  jar.set(unlockCookieName(parsed.data.slug), createUnlockToken(parsed.data.slug), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/g/${parsed.data.slug}`,
    maxAge: 60 * 60 * 6,
  });

  redirect(`/g/${parsed.data.slug}`);
}
