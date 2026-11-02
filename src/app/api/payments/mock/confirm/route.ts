import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { activatePayment, getPaymentByReference } from "@/lib/payments/service";
import { apiError, apiOk, assertSameOrigin, readJson } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

const confirmSchema = z.object({ reference: z.string().min(4).max(80) });

export async function POST(request: Request) {
  if (!(await assertSameOrigin())) return apiError("Invalid origin", 403);
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_MOCK_PAYMENTS !== "true"
  ) {
    return apiError("Simulated payments are disabled", 403);
  }

  const user = await getCurrentUser();
  if (!user) return apiError("Sign in first", 401);
  if (!rateLimit(`mock-pay:${user.id}`, 5, 60_000).allowed) {
    return apiError("Too many attempts. Try again in a minute.", 429);
  }

  const { data: body, error } = await readJson<unknown>(request);
  if (error) return apiError(error, 400);
  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) return apiError("Invalid reference", 400);

  const payment = await getPaymentByReference(parsed.data.reference);
  if (
    !payment ||
    payment.user_id !== user.id ||
    payment.provider !== "mock" ||
    payment.status !== "pending"
  ) {
    return apiError("This simulated payment is not available", 404);
  }

  await activatePayment(payment, {
    providerEventId: `mock-${payment.id}`,
    eventType: "payment.success",
  });

  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard");
  return apiOk({ url: "/dashboard/billing?paid=1" });
}
