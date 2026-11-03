import { randomBytes } from "node:crypto";
import { getAdminClient } from "@/lib/supabase/admin";
import { initiateClickPesaUssdPush } from "@/lib/payments/clickpesa";
import { paymentProviderName } from "@/lib/env";
import { formatMoney, absoluteUrl } from "@/lib/utils";
import { sendTransactionalEmail } from "@/lib/email";
import type { Payment, Plan, Subscription } from "@/lib/types";

export interface CheckoutResult {
  paymentId: string;
  reference: string;
  checkoutUrl: string | null;
  provider: "mock" | "clickpesa";
  status: string;
}

function periodEnd(
  plan: Plan,
  start: Date,
): string | null {
  if (plan.billing_interval === "lifetime") return null;
  const end = new Date(start);
  if (plan.billing_interval === "year") {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }
  return end.toISOString();
}

export function planAmount(plan: Plan, currency: "TZS" | "USD") {
  return currency === "USD" ? plan.price_usd_cents : plan.price_tzs;
}

export async function createCheckout({
  userId,
  plan,
  currency,
  phoneNumber,
}: {
  userId: string;
  plan: Plan;
  currency: "TZS" | "USD";
  phoneNumber: string;
}): Promise<CheckoutResult> {
  const admin = getAdminClient();
  if (!admin) throw new Error("DATABASE_NOT_CONFIGURED");

  const provider = paymentProviderName();
  const amount = planAmount(plan, currency);
  if (amount <= 0) throw new Error("PLAN_NOT_PURCHASABLE");

  // ClickPesa accepts alphanumeric order references only.
  if (provider === "clickpesa" && currency !== "TZS") {
    throw new Error("CLICKPESA_USSD_TZS_ONLY");
  }
  // ClickPesa USSD order references are limited to 20 alphanumeric characters.
  const reference = `HTL${Date.now().toString(36).toUpperCase()}${randomBytes(4).toString("hex").toUpperCase()}`;

  const { data, error } = await admin
    .from("payments")
    .insert({
      user_id: userId,
      plan_id: plan.id,
      provider,
      provider_reference: reference,
      amount,
      currency,
      status: "pending",
      checkout_url: null,
      metadata: {
        plan_code: plan.code,
        plan_name: plan.name,
        billing_interval: plan.billing_interval,
        initiated_at: new Date().toISOString(),
      },
    })
    .select("id")
    .single();

  if (error || !data) throw new Error("PAYMENT_CREATE_FAILED");

  let checkoutUrl: string | null = null;
  try {
    if (provider === "clickpesa") {
      const push = await initiateClickPesaUssdPush({ amount, orderReference: reference, phoneNumber });
      await admin.from("payments").update({
        metadata: {
          plan_code: plan.code,
          plan_name: plan.name,
          billing_interval: plan.billing_interval,
          initiated_at: new Date().toISOString(),
          provider_transaction_id: push.id,
          provider_status: push.status,
        },
      }).eq("id", data.id);
    } else {
      checkoutUrl = `/checkout/mock/${encodeURIComponent(reference)}`;
      await admin.from("payments").update({ checkout_url: checkoutUrl }).eq("id", data.id);
    }
  } catch (caught) {
    await admin.from("payments").update({ status: "failed" }).eq("id", data.id);
    throw caught;
  }

  return {
    paymentId: data.id,
    reference,
    checkoutUrl,
    provider,
    status: "pending",
  };
}

export async function getPaymentByReference(reference: string) {
  const admin = getAdminClient();
  if (!admin) return null;
  const { data } = await admin
    .from("payments")
    .select("*, plans(*)")
    .eq("provider_reference", reference)
    .maybeSingle();
  return (data as Payment | null) ?? null;
}

export async function activatePayment(
  payment: Payment,
  options?: { providerEventId?: string; eventType?: string },
): Promise<{ subscriptionId: string | null; alreadyActive: boolean }> {
  const admin = getAdminClient();
  if (!admin) throw new Error("DATABASE_NOT_CONFIGURED");
  if (!payment.user_id || !payment.plans) {
    throw new Error("PAYMENT_INCOMPLETE");
  }
  if (payment.status === "succeeded") {
    return {
      subscriptionId: payment.subscription_id,
      alreadyActive: true,
    };
  }

  const plan = payment.plans;
  const start = new Date();
  const end = periodEnd(plan, start);

  const { data: existingRows } = await admin
    .from("subscriptions")
    .select("*")
    .eq("user_id", payment.user_id)
    .eq("status", "active")
    .limit(1);
  const existing = (existingRows?.[0] as Subscription | undefined) ?? null;

  let subscriptionId: string | null = null;
  if (existing) {
    const { data } = await admin
      .from("subscriptions")
      .update({
        plan_id: plan.id,
        provider: payment.provider,
        provider_subscription_id: payment.provider_reference,
        current_period_start: start.toISOString(),
        current_period_end: end,
        cancel_at_period_end: false,
        canceled_at: null,
      })
      .eq("id", existing.id)
      .select("id")
      .single();
    subscriptionId = data?.id ?? existing.id;
  } else {
    const { data, error } = await admin
      .from("subscriptions")
      .insert({
        user_id: payment.user_id,
        plan_id: plan.id,
        status: "active",
        provider: payment.provider,
        provider_subscription_id: payment.provider_reference,
        current_period_start: start.toISOString(),
        current_period_end: end,
      })
      .select("id")
      .single();
    if (error || !data) throw new Error("SUBSCRIPTION_CREATE_FAILED");
    subscriptionId = data.id;
  }

  const paidAt = new Date().toISOString();
  const { error: updateError } = await admin
    .from("payments")
    .update({
      status: "succeeded",
      subscription_id: subscriptionId,
      paid_at: paidAt,
      metadata: {
        ...payment.metadata,
        paid_at: paidAt,
        provider_event_id: options?.providerEventId ?? null,
        provider_event_type: options?.eventType ?? null,
      },
    })
    .eq("id", payment.id);

  if (updateError) throw new Error("PAYMENT_UPDATE_FAILED");

  await admin.from("notifications").insert({
    user_id: payment.user_id,
    type: "payment_succeeded",
    title: `${plan.name} is active`,
    body: `Your payment of ${formatMoney(payment.amount, payment.currency)} was received. Every Premium feature is now unlocked.`,
    metadata: {
      paymentId: payment.id,
      reference: payment.provider_reference,
      planCode: plan.code,
    },
  });

  try {
    const { data: profile } = await admin
      .from("profiles")
      .select("email")
      .eq("id", payment.user_id)
      .maybeSingle();
    await sendTransactionalEmail({
      to: profile?.email,
      subject: `${plan.name} is active`,
      text: `Your payment of ${formatMoney(payment.amount, payment.currency)} was received. Every Premium feature is now unlocked.\n\nManage your plan: ${absoluteUrl("/dashboard/billing")}\n\nHeartly`,
    });
  } catch {
    // Email delivery is best effort; the subscription is already active.
  }

  if (options?.providerEventId) {
    await admin.from("audit_logs").insert({
      action: "payment.succeeded",
      entity_type: "payment",
      entity_id: payment.id,
      metadata: {
        provider: payment.provider,
        eventId: options.providerEventId,
        eventType: options.eventType ?? null,
      },
    });
  }

  return { subscriptionId, alreadyActive: false };
}

export async function markPaymentFailed(
  paymentId: string,
  reason: string,
  event?: { providerEventId?: string; eventType?: string },
) {
  const admin = getAdminClient();
  if (!admin) return;
  await admin
    .from("payments")
    .update({
      status: "failed",
      metadata: {
        failure_reason: reason,
        provider_event_id: event?.providerEventId ?? null,
        provider_event_type: event?.eventType ?? null,
      },
    })
    .eq("id", paymentId)
    .eq("status", "pending");
}

export async function recordPaymentEvent(input: {
  provider: string;
  providerEventId: string;
  paymentId: string | null;
  eventType: string;
  payload: Record<string, unknown>;
}) {
  const admin = getAdminClient();
  if (!admin) return false;
  const { error } = await admin.from("payment_events").insert({
    provider: input.provider,
    provider_event_id: input.providerEventId,
    payment_id: input.paymentId,
    event_type: input.eventType,
    payload: input.payload,
    processed_at: new Date().toISOString(),
  });
  return !error;
}
