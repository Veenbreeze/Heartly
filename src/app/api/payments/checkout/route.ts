import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { createCheckout } from "@/lib/payments/service";
import { apiError, apiOk, assertSameOrigin, readJson } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import type { Plan } from "@/lib/types";

const checkoutSchema = z.object({
  planCode: z.literal("premium"),
  currency: z.enum(["TZS", "USD"]).default("TZS"),
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

  const admin = getAdminClient();
  if (!admin) return apiError("Payments are not configured yet", 503);

  const { data: plan } = await admin
    .from("plans")
    .select("*")
    .eq("code", parsed.data.planCode)
    .eq("is_active", true)
    .maybeSingle();
  if (!plan) return apiError("That plan is not available", 404);

  try {
    const checkout = await createCheckout({
      userId: user.id,
      plan: plan as Plan,
      currency: parsed.data.currency,
    });
    return apiOk({
      url: checkout.checkoutUrl,
      reference: checkout.reference,
      provider: checkout.provider,
    });
  } catch (caught) {
    const code = caught instanceof Error ? caught.message : "UNKNOWN";
    if (code === "PLAN_NOT_PURCHASABLE") {
      return apiError("That plan cannot be purchased right now", 400);
    }
    return apiError("Could not start checkout. Please try again.", 502);
  }
}
