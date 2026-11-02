import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { Plan, Profile, Subscription } from "@/lib/types";
import {
  entitlementsFromPlan,
  freeEntitlements,
  subscriptionIsActive,
  type Entitlements,
} from "@/lib/entitlements";

export const getCurrentUser = cache(async (): Promise<User | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (data) return data as Profile;
  return {
    id: user.id,
    email: user.email ?? null,
    full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
    avatar_url: null,
    role: "user",
    locale: "en",
    currency: "TZS",
    bio: null,
    onboarded_at: null,
    created_at: user.created_at,
    updated_at: user.created_at,
  };
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    if (!isSupabaseConfigured()) {
      redirect("/login?setup=1");
    }
    redirect("/login");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    notFound();
  }
  return { user, profile };
}

export async function getEntitlements(userId?: string | null): Promise<Entitlements> {
  if (!userId || !isSupabaseConfigured()) return freeEntitlements();
  const supabase = await getSupabaseServerClient();
  if (!supabase) return freeEntitlements();

  const { data: subscriptionRows } = await supabase
    .from("subscriptions")
    .select("*, plans(*)")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1);

  const subscription =
    ((subscriptionRows ?? []) as Subscription[]).find((row) =>
      subscriptionIsActive(row),
    ) ?? null;
  if (subscription?.plans) {
    return entitlementsFromPlan(subscription.plans as Plan, subscription);
  }

  const { data: freePlan } = await supabase
    .from("plans")
    .select("*")
    .eq("code", "free")
    .maybeSingle();

  return entitlementsFromPlan((freePlan as Plan | null) ?? null, null);
}

export async function isAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.role === "admin";
}
