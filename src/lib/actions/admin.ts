"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase/admin";

const idSchema = z.string().uuid();

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function audit(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  metadata: Record<string, unknown> = {},
) {
  const admin = getAdminClient();
  if (!admin) return;
  await admin.from("audit_logs").insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
  });
}

export async function adminUnpublishGiftAction(formData: FormData) {
  const { user } = await requireAdmin();
  const parsed = idSchema.safeParse(formData.get("giftId"));
  if (!parsed.success) return;
  const admin = getAdminClient();
  if (!admin) return;
  const reason = formString(formData, "reason");
  const { error } = await admin
    .from("gifts")
    .update({ status: "unpublished", visibility: "unlisted", password_hash: null })
    .eq("id", parsed.data);
  if (error) return;
  await audit(user.id, "gift.unpublished_by_admin", "gift", parsed.data, {
    reason: reason || null,
  });
  revalidatePath("/admin");
  revalidatePath("/admin/gifts");
  revalidatePath("/admin/reports");
}

export async function adminDeleteGiftAction(formData: FormData) {
  const { user } = await requireAdmin();
  const parsed = idSchema.safeParse(formData.get("giftId"));
  if (!parsed.success) return;
  const admin = getAdminClient();
  if (!admin) return;
  const reason = formString(formData, "reason");
  const { error } = await admin.from("gifts").delete().eq("id", parsed.data);
  if (error) return;
  await audit(user.id, "gift.deleted_by_admin", "gift", parsed.data, {
    reason: reason || null,
  });
  revalidatePath("/admin");
  revalidatePath("/admin/gifts");
  revalidatePath("/admin/reports");
}

const roleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["user", "admin"]),
});

export async function adminUpdateUserRoleAction(formData: FormData) {
  const { user } = await requireAdmin();
  const parsed = roleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!parsed.success) redirect("/admin/users?error=Invalid role update.");

  if (parsed.data.userId === user.id && parsed.data.role !== "admin") {
    redirect("/admin/users?error=You cannot remove your own administrator access.");
  }

  const admin = getAdminClient();
  if (!admin) redirect("/admin/users?error=Administration is not configured.");

  if (parsed.data.role === "user") {
    const { count } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    const { data: target } = await admin
      .from("profiles")
      .select("role")
      .eq("id", parsed.data.userId)
      .maybeSingle();
    if ((count ?? 0) <= 1 && target?.role === "admin") {
      redirect("/admin/users?error=At least one administrator must remain.");
    }
  }

  const { error } = await admin
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.userId);
  if (error) redirect("/admin/users?error=Could not update this user.");

  await audit(user.id, "user.role_updated", "profile", parsed.data.userId, {
    role: parsed.data.role,
  });
  revalidatePath("/admin/users");
  redirect("/admin/users?updated=1");
}

const reportUpdateSchema = z.object({
  reportId: z.string().uuid(),
  status: z.enum(["open", "reviewing", "resolved", "dismissed"]),
  notes: z.string().max(2000).optional(),
});

export async function adminUpdateReportAction(formData: FormData) {
  const { user } = await requireAdmin();
  const parsed = reportUpdateSchema.safeParse({
    reportId: formData.get("reportId"),
    status: formData.get("status"),
    notes: formString(formData, "notes") || undefined,
  });
  if (!parsed.success) return;
  const admin = getAdminClient();
  if (!admin) return;
  const closed = parsed.data.status === "resolved" || parsed.data.status === "dismissed";
  const { error } = await admin
    .from("reports")
    .update({
      status: parsed.data.status,
      resolution_notes: parsed.data.notes ?? null,
      resolved_by: closed ? user.id : null,
    })
    .eq("id", parsed.data.reportId);
  if (error) return;
  await audit(user.id, "report.updated", "report", parsed.data.reportId, {
    status: parsed.data.status,
    notes: parsed.data.notes ?? null,
  });
  revalidatePath("/admin");
  revalidatePath("/admin/reports");
}

const settingSchema = z.object({
  key: z.string().regex(/^[a-z0-9_.-]{2,80}$/),
  value: z.string().min(1).max(4000),
  description: z.string().max(500).optional(),
});

export async function adminUpdateSettingAction(formData: FormData) {
  const { user } = await requireAdmin();
  const parsed = settingSchema.safeParse({
    key: formString(formData, "key"),
    value: formString(formData, "value"),
    description: formString(formData, "description") || undefined,
  });
  if (!parsed.success) return;
  let value: unknown;
  try {
    value = JSON.parse(parsed.data.value);
  } catch {
    return;
  }
  const admin = getAdminClient();
  if (!admin) return;
  const { error } = await admin.from("platform_settings").upsert({
    key: parsed.data.key,
    value,
    description: parsed.data.description ?? null,
    updated_by: user.id,
  });
  if (error) return;
  await audit(user.id, "setting.updated", "platform_setting", parsed.data.key, {
    value,
  });
  revalidatePath("/admin/settings");
}
