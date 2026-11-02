import { getAdminClient } from "@/lib/supabase/admin";
import type {
  AuditLog,
  GiftStatus,
  GiftVisibility,
  Payment,
  PlatformSetting,
  Profile,
  Report,
} from "@/lib/types";

export interface AdminGiftRow {
  id: string;
  title: string;
  slug: string;
  recipient_name: string;
  sender_id: string | null;
  status: GiftStatus;
  visibility: GiftVisibility;
  view_count: number;
  created_at: string;
  updated_at: string;
  templates?: { name: string; slug: string } | null;
}

export interface AdminPaymentRow extends Payment {
  profiles?: Pick<Profile, "id" | "email" | "full_name"> | null;
}

export interface AdminUserRow extends Profile {
  gift_count?: number;
}

export interface AdminOverview {
  users: number;
  admins: number;
  gifts: number;
  published: number;
  responses: number;
  openReports: number;
  activeSubscriptions: number;
  revenueTzs: number;
  revenueUsd: number;
  recentGifts: AdminGiftRow[];
  recentReports: Report[];
}

async function countRows(
  table: string,
  filter?: { column: string; value: string | string[] },
) {
  const admin = getAdminClient();
  if (!admin) return 0;
  let query = admin.from(table).select("id", { count: "exact", head: true });
  if (filter) {
    query = Array.isArray(filter.value)
      ? query.in(filter.column, filter.value)
      : query.eq(filter.column, filter.value);
  }
  const { count } = await query;
  return count ?? 0;
}

export async function getAdminOverview(): Promise<AdminOverview | null> {
  const admin = getAdminClient();
  if (!admin) return null;

  const [
    users,
    admins,
    gifts,
    published,
    responses,
    openReports,
    activeSubscriptions,
    paymentsResult,
    recentGiftsResult,
    recentReportsResult,
  ] = await Promise.all([
    countRows("profiles"),
    countRows("profiles", { column: "role", value: "admin" }),
    countRows("gifts"),
    countRows("gifts", { column: "status", value: "published" }),
    countRows("gift_responses"),
    countRows("reports", { column: "status", value: ["open", "reviewing"] }),
    countRows("subscriptions", { column: "status", value: "active" }),
    admin.from("payments").select("amount,currency").eq("status", "succeeded"),
    admin
      .from("gifts")
      .select(
        "id,title,slug,recipient_name,sender_id,status,visibility,view_count,created_at,updated_at,templates(name,slug)",
      )
      .order("created_at", { ascending: false })
      .limit(6),
    admin
      .from("reports")
      .select(
        "id,reporter_id,gift_id,reason,details,status,resolution_notes,resolved_by,created_at,updated_at,gifts(id,title,slug,status,visibility)",
      )
      .in("status", ["open", "reviewing"])
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const payments = (paymentsResult.data ?? []) as Pick<Payment, "amount" | "currency">[];
  const revenueTzs = payments
    .filter((payment) => payment.currency === "TZS")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const revenueUsd = payments
    .filter((payment) => payment.currency === "USD")
    .reduce((sum, payment) => sum + payment.amount, 0);

  return {
    users,
    admins,
    gifts,
    published,
    responses,
    openReports,
    activeSubscriptions,
    revenueTzs,
    revenueUsd,
    recentGifts: (recentGiftsResult.data ?? []) as unknown as AdminGiftRow[],
    recentReports: (recentReportsResult.data ?? []) as unknown as Report[],
  };
}

export async function listAdminGifts(options?: {
  status?: string;
  query?: string;
}): Promise<AdminGiftRow[]> {
  const admin = getAdminClient();
  if (!admin) return [];
  let query = admin
    .from("gifts")
    .select(
      "id,title,slug,recipient_name,sender_id,status,visibility,view_count,created_at,updated_at,templates(name,slug)",
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (options?.status && options.status !== "all") {
    query = query.eq("status", options.status);
  }
  const { data, error } = await query;
  if (error) return [];
  const search = options?.query?.trim().toLowerCase();
  const rows = (data ?? []) as unknown as AdminGiftRow[];
  if (!search) return rows;
  return rows.filter((gift) =>
    [gift.title, gift.recipient_name, gift.slug, gift.templates?.name ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(search),
  );
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const admin = getAdminClient();
  if (!admin) return [];
  const { data } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []) as AdminUserRow[];
}

export async function listAdminPayments(): Promise<AdminPaymentRow[]> {
  const admin = getAdminClient();
  if (!admin) return [];
  const { data } = await admin
    .from("payments")
    .select("*, plans(*)")
    .order("created_at", { ascending: false })
    .limit(200);
  const payments = (data ?? []) as unknown as AdminPaymentRow[];
  const userIds = [...new Set(payments.map((payment) => payment.user_id).filter(Boolean))] as string[];
  if (!userIds.length) return payments;
  const { data: profiles } = await admin
    .from("profiles")
    .select("id,email,full_name")
    .in("id", userIds);
  const profileMap = new Map(
    ((profiles ?? []) as Pick<Profile, "id" | "email" | "full_name">[]).map((profile) => [
      profile.id,
      profile,
    ]),
  );
  return payments.map((payment) => ({
    ...payment,
    profiles: payment.user_id ? profileMap.get(payment.user_id) ?? null : null,
  }));
}

export async function listAdminReports(): Promise<Report[]> {
  const admin = getAdminClient();
  if (!admin) return [];
  const { data } = await admin
    .from("reports")
    .select(
      "id,reporter_id,gift_id,reason,details,status,resolution_notes,resolved_by,created_at,updated_at,gifts(id,title,slug,status,visibility)",
    )
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []) as unknown as Report[];
}

export async function listAuditLogs(): Promise<AuditLog[]> {
  const admin = getAdminClient();
  if (!admin) return [];
  const { data } = await admin
    .from("audit_logs")
    .select("id,actor_id,action,entity_type,entity_id,metadata,ip_hash,created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []) as AuditLog[];
}

export async function listPlatformSettings(): Promise<PlatformSetting[]> {
  const admin = getAdminClient();
  if (!admin) return [];
  const { data } = await admin
    .from("platform_settings")
    .select("*")
    .order("key", { ascending: true });
  return (data ?? []) as PlatformSetting[];
}
