import { getCurrentUser } from "@/lib/auth";
import { activatePayment, getPaymentByReference, markPaymentFailed } from "@/lib/payments/service";
import { queryClickPesaPayment } from "@/lib/payments/clickpesa";
import { apiError, apiOk } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  const user = await getCurrentUser();
  if (!user) return apiError("Sign in first", 401);
  let payment = await getPaymentByReference(decodeURIComponent(reference));
  if (!payment || payment.user_id !== user.id) {
    return apiError("Payment not found", 404);
  }
  if (payment.status === "pending" && payment.provider === "clickpesa") {
    try {
      const providerStatus = await queryClickPesaPayment(payment.provider_reference);
      if (["success", "successful", "completed", "paid", "settled"].includes(providerStatus ?? "")) {
        await activatePayment(payment, { eventType: "clickpesa.status_query" });
        payment = await getPaymentByReference(payment.provider_reference) ?? payment;
      } else if (["failed", "cancelled", "canceled", "declined", "expired"].includes(providerStatus ?? "")) {
        await markPaymentFailed(payment.id, providerStatus ?? "failed");
        payment = await getPaymentByReference(payment.provider_reference) ?? payment;
      }
    } catch {
      // Keep the request usable while ClickPesa status is temporarily unavailable.
    }
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
