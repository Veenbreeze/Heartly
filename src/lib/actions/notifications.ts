"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function markNotificationReadAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const id = formData.get("id");
  if (typeof id !== "string") return;
  const supabase = await getSupabaseServerClient();
  if (!supabase) return;
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard");
}

export async function markAllNotificationsReadAction() {
  const user = await getCurrentUser();
  if (!user) return;
  const supabase = await getSupabaseServerClient();
  if (!supabase) return;
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard");
}

export async function deleteNotificationAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const id = formData.get("id");
  if (typeof id !== "string") return;
  const supabase = await getSupabaseServerClient();
  if (!supabase) return;
  await supabase
    .from("notifications")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/dashboard/notifications");
}
