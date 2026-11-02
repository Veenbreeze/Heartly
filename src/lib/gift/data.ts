import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import type {
  Category,
  GiftResponse,
  GiftView,
  GiftWithMeta,
  Template,
} from "@/lib/types";

export interface PublicGift {
  gift: GiftWithMeta;
  template: Template;
  category: Category;
}

export async function getPublicGiftBySlug(
  slug: string,
): Promise<PublicGift | null> {
  const admin = getAdminClient();
  if (!admin) return null;
  const { data, error } = await admin
    .from("gifts")
    .select("*, templates(*), categories(*)")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as GiftWithMeta;
  if (!row.templates || !row.categories) return null;
  return { gift: row, template: row.templates, category: row.categories };
}

export async function getGiftForOwner(
  id: string,
): Promise<GiftWithMeta | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("gifts")
    .select("*, templates(*), categories(*)")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as GiftWithMeta;
}

export async function getGiftAdmin(id: string): Promise<GiftWithMeta | null> {
  const admin = getAdminClient();
  if (!admin) return null;
  const { data, error } = await admin
    .from("gifts")
    .select("*, templates(*), categories(*)")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as GiftWithMeta;
}

export async function listGiftsForUser(
  userId: string,
  options?: { status?: "draft" | "published" | "unpublished"; limit?: number },
) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [] as GiftWithMeta[];
  let query = supabase
    .from("gifts")
    .select("*, templates(*), categories(*)")
    .eq("sender_id", userId)
    .order("updated_at", { ascending: false })
    .limit(options?.limit ?? 100);
  if (options?.status) query = query.eq("status", options.status);
  const { data } = await query;
  return (data ?? []) as GiftWithMeta[];
}

export async function getDashboardStats(userId: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return {
      total: 0,
      published: 0,
      drafts: 0,
      views: 0,
      responses: 0,
      unread: 0,
    };
  }

  const { data: gifts } = await supabase
    .from("gifts")
    .select("id, status, view_count")
    .eq("sender_id", userId);

  const rows = gifts ?? [];
  const ids = rows.map((gift) => gift.id as string);
  let responses = 0;
  if (ids.length) {
    const { count } = await supabase
      .from("gift_responses")
      .select("id", { count: "exact", head: true })
      .in("gift_id", ids);
    responses = count ?? 0;
  }
  const { count: unread } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);

  return {
    total: rows.length,
    published: rows.filter((row) => row.status === "published").length,
    drafts: rows.filter((row) => row.status === "draft").length,
    views: rows.reduce((sum, row) => sum + Number(row.view_count ?? 0), 0),
    responses,
    unread: unread ?? 0,
  };
}

export async function getGiftAnalytics(giftId: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return {
      totalViews: 0,
      uniqueVisitors: 0,
      firstViewedAt: null as string | null,
      lastViewedAt: null as string | null,
      daily: [] as { date: string; views: number }[],
      responses: [] as GiftResponse[],
    };
  }

  const [{ data: viewRows }, { data: responseRows }] = await Promise.all([
    supabase
      .from("gift_views")
      .select("id, visitor_hash, view_date, created_at")
      .eq("gift_id", giftId)
      .order("created_at", { ascending: true })
      .limit(5000),
    supabase
      .from("gift_responses")
      .select("*")
      .eq("gift_id", giftId)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const views = (viewRows ?? []) as Pick<
    GiftView,
    "id" | "visitor_hash" | "view_date" | "created_at"
  >[];
  const unique = new Set(views.map((row) => row.visitor_hash));
  const byDay = new Map<string, number>();
  for (const view of views) {
    byDay.set(view.view_date, (byDay.get(view.view_date) ?? 0) + 1);
  }

  return {
    totalViews: views.length,
    uniqueVisitors: unique.size,
    firstViewedAt: views[0]?.created_at ?? null,
    lastViewedAt: views[views.length - 1]?.created_at ?? null,
    daily: Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, views: count })),
    responses: (responseRows ?? []) as GiftResponse[],
  };
}

export async function getActiveOwnedGiftCount(userId: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return 0;
  const { count } = await supabase
    .from("gifts")
    .select("id", { count: "exact", head: true })
    .eq("sender_id", userId)
    .eq("status", "published")
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
  return count ?? 0;
}
