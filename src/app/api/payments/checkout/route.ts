import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { createCheckout } from "@/lib/payments/service";
import { apiError, apiOk, assertSameOrigin, readJson } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import type { Plan, PlanLimits } from "@/lib/types";

const checkoutSchema = z.object({
  planCode: z.string().trim().regex(/^[a-z0-9_]{2,40}$/),
  currency: z.literal("TZS").default("TZS"),
  phoneNumber: z.string().trim().min(9).max(18),
  network: z.enum(["mpesa", "halopesa", "airtelmoney", "yas"]),
});

export async function POST(request: Request) {
  if (!(await assertSameOrigin())) return apiError("Invalid origin", 403);
  const user = await getCurrentUser();
  if (!user) return apiError("Sign in to upgrade", 401);
  if (!rateLimit(`checkout:${user.id}`, 5, 60_000).allowed) {
    return apiError("Too many checkout attempts. Try again in a minute.", 429);
  }

  const { data: body, error } = await readJson<unknown>(request);
  if (error) return apiError(error, 400);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return apiError("Choose a valid plan and currency", 400);
  const digits = parsed.data.phoneNumber.replace(/[\s()+-]/g, "");
  const phoneNumber = digits.startsWith("0")
    ? `255${digits.slice(1)}`
    : digits.startsWith("255")
      ? digits
      : `255${digits}`;
  if (!/^255[67]\d{8}$/.test(phoneNumber)) {
    return apiError("Enter a valid Tanzanian mobile number", 400);
  }

  const admin = getAdminClient();
  if (!admin) return apiError("Payments are not configured yet", 503);

  const { data: plan } = await admin
    .from("plans")
    .select("*")
    .eq("code", parsed.data.planCode)
    .eq("is_active", true)
    .maybeSingle();
  if (!plan) return apiError("That plan is not available", 404);
  if ((plan.limits as PlanLimits | null)?.tier !== "premium") {
    return apiError("That plan is not available", 404);
  }

  try {
    const checkout = await createCheckout({
      userId: user.id,
      plan: plan as Plan,
      currency: "TZS",
      phoneNumber,
      network: parsed.data.network,
    });
    return apiOk({
      url: checkout.checkoutUrl,
      reference: checkout.reference,
      provider: checkout.provider,
      status: checkout.status,
    });
  } catch (caught) {
    const code = caught instanceof Error ? caught.message : "UNKNOWN";
    console.error("Payment checkout initialization failed", {
      reason: code.replace(/[^a-zA-Z0-9_.:-]/g, "").slice(0, 100),
    });
    if (code === "PLAN_NOT_PURCHASABLE") {
      return apiError("That plan cannot be purchased right now", 400);
    }
    if (code === "CLICKPESA_USSD_TZS_ONLY") {
      return apiError("Mobile money phone prompts are available for TZS payments", 400);
    }
    if (code.startsWith("CLICKPESA_PUSH_FAILED:400")) {
      const reason = code.replace(/^CLICKPESA_PUSH_FAILED:400:?/, "");
      if (/phone number/i.test(reason)) {
        return apiError("ClickPesa could not use that phone number. Check it and try again.", 400);
      }
      if (/COLLECTION_API/i.test(reason)) {
        return apiError("Mobile money prompts are not enabled on the payment account.", 503);
      }
      return apiError("ClickPesa rejected that payment request. Check your details and try again.", 400);
    }
    return apiError("Could not start checkout. Please try again.", 502);
  }
}
