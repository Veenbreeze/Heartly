import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { guestOwnsGift } from "@/lib/gift/security";
import type { GiftWithMeta } from "@/lib/types";

export interface GiftAccess {
  gift: GiftWithMeta;
  via: "owner" | "guest" | "admin";
}

export async function getGiftAccess(
  id: string,
): Promise<GiftAccess | null> {
  const admin = getAdminClient();
  if (!admin) return null;
  const { data } = await admin
    .from("gifts")
    .select("*, templates(*), categories(*)")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const gift = data as GiftWithMeta;

  const user = await getCurrentUser();
  if (user && gift.sender_id === user.id) {
    return { gift, via: "owner" };
  }

  if (user) {
    const profile = await getCurrentProfile();
    if (profile?.role === "admin") return { gift, via: "admin" };
  }

  if (
    !gift.sender_id &&
    (await guestOwnsGift(gift.id, gift.guest_token_hash ?? null))
  ) {
    return { gift, via: "guest" };
  }

  return null;
}
