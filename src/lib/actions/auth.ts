"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { databaseSetupMessage, isSupabaseConfigured } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth";
import { safeRedirectPath, siteUrl } from "@/lib/utils";
import type { ActionState } from "@/lib/actions/state";

function setupState(): ActionState {
  return { status: "error", message: databaseSetupMessage() };
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !result[key]) {
      result[key] = issue.message;
    }
  }
  return result;
}

function stringValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2, "Tell us your name").max(120),
    email: z.string().trim().email("Enter a valid email").max(254),
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .max(72, "Password is too long"),
    confirmPassword: z.string(),
    next: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export async function signUpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return setupState();
  const parsed = signUpSchema.safeParse({
    fullName: stringValue(formData, "fullName"),
    email: stringValue(formData, "email"),
    password: stringValue(formData, "password"),
    confirmPassword: stringValue(formData, "confirmPassword"),
    next: stringValue(formData, "next"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return setupState();

  const next = safeRedirectPath(parsed.data.next, "/dashboard");
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  if (!data.session) {
    redirect(
      `/verify-email?email=${encodeURIComponent(parsed.data.email)}&next=${encodeURIComponent(next)}`,
    );
  }

  redirect(next);
}

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(254),
  password: z.string().min(1, "Enter your password").max(72),
  next: z.string().optional(),
});

export async function signInAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return setupState();
  const parsed = signInSchema.safeParse({
    email: stringValue(formData, "email"),
    password: stringValue(formData, "password"),
    next: stringValue(formData, "next"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check your email and password.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return setupState();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    if (/email not confirmed/i.test(error.message)) {
      const next = safeRedirectPath(parsed.data.next, "/dashboard");
      redirect(
        `/verify-email?email=${encodeURIComponent(parsed.data.email)}&next=${encodeURIComponent(next)}&notice=unconfirmed`,
      );
    }
    return {
      status: "error",
      message:
        error.message === "Invalid login credentials"
          ? "That email and password combination did not work."
          : error.message,
    };
  }

  redirect(safeRedirectPath(parsed.data.next, "/dashboard"));
}

export async function signOutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase?.auth.signOut();
  }
  redirect("/");
}

export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return setupState();
  const parsed = z
    .string()
    .trim()
    .email("Enter a valid email")
    .safeParse(stringValue(formData, "email"));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Enter the email address you signed up with.",
      fieldErrors: { email: "Enter a valid email" },
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return setupState();
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${siteUrl()}/auth/callback?next=/reset-password`,
  });

  return {
    status: "success",
    message:
      "If an account exists for that email, a password reset link is on its way.",
  };
}

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .max(72, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export async function updatePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return setupState();
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/reset-password");

  const parsed = passwordSchema.safeParse({
    password: stringValue(formData, "password"),
    confirmPassword: stringValue(formData, "confirmPassword"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Choose a new password.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return setupState();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { status: "error", message: error.message };

  return {
    status: "success",
    message: "Your password has been updated. You can keep exploring Heartly.",
  };
}

const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your name").max(120),
  bio: z.string().trim().max(280, "Keep it under 280 characters").optional(),
  locale: z.enum(["en", "sw"]),
  currency: z.enum(["TZS", "USD"]),
});

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return setupState();
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/settings");

  const parsed = profileSchema.safeParse({
    fullName: stringValue(formData, "fullName"),
    bio: stringValue(formData, "bio"),
    locale: stringValue(formData, "locale") || "en",
    currency: stringValue(formData, "currency") || "TZS",
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return setupState();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      bio: parsed.data.bio ?? null,
      locale: parsed.data.locale,
      currency: parsed.data.currency,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) return { status: "error", message: error.message };

  await supabase.auth.updateUser({
    data: { full_name: parsed.data.fullName },
  });
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { status: "success", message: "Profile saved." };
}

export async function signInWithGoogleAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/login?setup=1");
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?setup=1");
  const next = safeRedirectPath(stringValue(formData, "next"), "/dashboard");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error || !data.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "oauth")}`);
  }
  redirect(data.url);
}

export async function resendVerificationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return setupState();
  const parsed = z
    .object({
      email: z.string().trim().email("Enter a valid email").max(254),
      next: z.string().optional(),
    })
    .safeParse({
      email: stringValue(formData, "email"),
      next: stringValue(formData, "next"),
    });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Enter the email address you signed up with.",
      fieldErrors: { email: "Enter a valid email" },
    };
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return setupState();
  const next = safeRedirectPath(parsed.data.next, "/dashboard");
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error?.status === 429) {
    return {
      status: "error",
      message: "Please wait a moment before requesting another email.",
    };
  }
  return {
    status: "success",
    message:
      "If that email needs confirmation, a new confirmation link is on its way.",
  };
}

const verifySignupOtpSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(254),
  token: z.string().trim().regex(/^\d{6}$/, "Enter the six digit code from your email"),
  next: z.string().optional(),
});

export async function verifySignupOtpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) return setupState();
  const parsed = verifySignupOtpSchema.safeParse({
    email: stringValue(formData, "email"),
    token: stringValue(formData, "token"),
    next: stringValue(formData, "next"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Enter the six digit code sent to your email.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return setupState();
  const { error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: "signup",
  });
  if (error) {
    return {
      status: "error",
      message: "That code is invalid or has expired. Request a new code and try again.",
    };
  }

  redirect(safeRedirectPath(parsed.data.next, "/dashboard"));
}
