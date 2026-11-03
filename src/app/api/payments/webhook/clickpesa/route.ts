import { getAdminClient } from "@/lib/supabase/admin";
import {
  activatePayment,
  getPaymentByReference,
  markPaymentFailed,
  recordPaymentEvent,
} from "@/lib/payments/service";
import { verifyChecksum } from "@/lib/payments/clickpesa";
import { apiError, apiOk } from "@/lib/api";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.length <= 500 ? value : null;
}

const successStatuses = new Set(["success", "successful", "completed", "paid", "settled"]);
const failureStatuses = new Set([
  "failed",
  "cancelled",
  "canceled",
  "declined",
  "expired",
]);

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = record(await request.json());
  } catch {
    return apiError("Invalid JSON", 400);
  }

  const provided =
    stringValue(payload.checksum) ??
    request.headers.get("checksum") ??
    request.headers.get("x-checksum");
  if (!verifyChecksum(payload, provided)) {
    return apiError("Invalid checksum", 401);
  }

  const admin = getAdminClient();
  if (!admin) return apiError("Payments are not configured", 503);

  const nested = record(payload.data ?? payload.payload);
  const reference =
    stringValue(nested.orderReference) ??
    stringValue(nested.order_reference) ??
    stringValue(payload.orderReference) ??
    stringValue(payload.order_reference);
  const status = (
    stringValue(nested.status) ??
    stringValue(nested.paymentStatus) ??
    stringValue(payload.status) ??
    ""
  ).toLowerCase();
  const eventType =
    stringValue(payload.eventType) ??
    stringValue(payload.event_type) ??
    stringValue(payload.event) ??
    stringValue(payload.type) ??
    status ??
    "clickpesa.webhook";
  const providerEventId =
    stringValue(payload.id) ??
    stringValue(nested.id) ??
    stringValue(payload.eventId) ??
    stringValue(payload.event_id);
  const eventId = providerEventId
    ? `${providerEventId}:${eventType}:${status}`
    : `${reference ?? "unknown"}:${eventType}:${status}:${stringValue(nested.updatedAt) ?? Date.now()}`;

  const { data: existing } = await admin
    .from("payment_events")
    .select("id")
    .eq("provider", "clickpesa")
    .eq("provider_event_id", eventId)
    .maybeSingle();
  if (existing) return apiOk({ received: true, duplicate: true });

  const payment = reference ? await getPaymentByReference(reference) : null;
  if (payment && successStatuses.has(status)) {
    try {
      await activatePayment(payment, { providerEventId: eventId, eventType });
    } catch {
      return apiError("Could not process payment", 500);
    }
  } else if (payment && failureStatuses.has(status)) {
    await markPaymentFailed(payment.id, status, {
      providerEventId: eventId,
      eventType,
    });
  }

  await recordPaymentEvent({
    provider: "clickpesa",
    providerEventId: eventId,
    paymentId: payment?.id ?? null,
    eventType,
    payload,
  });

  return apiOk({ received: true });
}
