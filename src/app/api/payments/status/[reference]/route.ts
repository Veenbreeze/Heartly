import { getCurrentUser } from "@/lib/auth";
import { getPaymentByReference } from "@/lib/payments/service";
import { apiError, apiOk } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  const user = await getCurrentUser();
  if (!user) return apiError("Sign in first", 401);
  const payment = await getPaymentByReference(decodeURIComponent(reference));
  if (!payment || payment.user_id !== user.id) {
    return apiError("Payment not found", 404);
  }
  return apiOk({
    status: payment.status,
    provider: payment.provider,
    planName: payment.plans?.name ?? "Heartly Premium",
    paidAt: payment.paid_at,
    checkoutUrl:
      payment.status === "pending" && payment.provider === "mock"
        ? payment.checkout_url
        : null,
  });
}
