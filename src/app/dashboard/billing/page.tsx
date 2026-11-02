import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CreditCard,
  ReceiptText,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser, getEntitlements } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Payment, Subscription } from "@/lib/types";
import { formatDate, formatMoney } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Billing · Heartly",
  robots: { index: false, follow: false },
};

const paymentVariant: Record<
  Payment["status"],
  "success" | "warning" | "danger" | "outline"
> = {
  succeeded: "success",
  pending: "warning",
  failed: "danger",
  refunded: "outline",
};

const planFeatures = [
  "All premium templates",
  "Music and advanced animations",
  "Scheduled delivery and password protection",
  "QR codes and gift expiry",
  "Advanced analytics",
  "Remove Heartly branding",
];

export default async function BillingPage() {
  const user = await requireUser();
  const entitlements = await getEntitlements(user.id);
  const supabase = await getSupabaseServerClient();

  const [subscriptionResult, paymentResult] = supabase
    ? await Promise.all([
        supabase
          .from("subscriptions")
          .select("*, plans(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("payments")
          .select("*, plans(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(30),
      ])
    : [{ data: null }, { data: [] }];

  const subscription = subscriptionResult.data as Subscription | null;
  const payments = (paymentResult.data ?? []) as Payment[];
  const isPremium = entitlements.tier === "premium";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-plum">Billing</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Your plan, payments and the features that come with them.
        </p>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-plum/10 bg-plum text-white shadow-lift">
        <div className="relative p-6 sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-rose/30 blur-3xl"
          />
          <div className="relative flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/60">
                Current plan
              </p>
              <h2 className="mt-2 font-display text-4xl">
                {entitlements.planName || (isPremium ? "Premium" : "Free")}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/65">
                {isPremium
                  ? "Everything is unlocked. Make as many little moments as you like."
                  : "A gentle place to start. Upgrade when you want more room and more ways to make someone feel seen."}
              </p>
            </div>
            {!isPremium ? (
              <Button asChild variant="secondary" className="bg-white text-plum hover:bg-blush">
                <Link href="/pricing">
                  <Sparkles /> Upgrade <ArrowRight />
                </Link>
              </Button>
            ) : (
              <Badge variant="premium" className="border-white/20 bg-white/10">
                <Check /> Active
              </Badge>
            )}
          </div>
          <div className="relative mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-white/60">
            <span>{entitlements.maxActiveGifts} live gifts</span>
            <span>{entitlements.maxMedia} photos per gift</span>
            <span>
              {subscription?.current_period_end
                ? `Renews or ends ${formatDate(subscription.current_period_end)}`
                : isPremium
                  ? "No renewal date"
                  : "No expiry"}
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="rounded-3xl border border-line bg-white/70 p-5 shadow-soft sm:p-6">
          <h2 className="font-display text-2xl text-plum">
            {isPremium ? "Your Premium features" : "Included in Premium"}
          </h2>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {(isPremium
              ? planFeatures.filter((feature) => {
                  if (feature.includes("branding")) return entitlements.can("remove_branding");
                  return true;
                })
              : planFeatures
            ).map((feature) => (
              <p key={feature} className="flex items-start gap-2 text-xs text-ink-soft">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-blush text-rose">
                  <Check className="size-2.5" />
                </span>
                {feature}
              </p>
            ))}
          </div>
          {!isPremium ? (
            <Button asChild className="mt-5">
              <Link href="/pricing">See plans and prices</Link>
            </Button>
          ) : null}
        </section>

        <section className="rounded-3xl border border-line bg-white/70 p-5 shadow-soft sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-blush text-rose">
              <CreditCard className="size-4" />
            </span>
            <div>
              <h2 className="font-display text-xl text-plum">Payment method</h2>
              <p className="text-xs text-ink-soft">
                Secure mobile money and card checkout.
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-ink-soft">
            {payments.some((payment) => payment.status === "succeeded")
              ? "Your past payments were handled by ClickPesa. Heartly never stores your mobile money PIN or full card number."
              : "Heartly uses ClickPesa for mobile money and card payments. You will be redirected to a secure checkout page."}
          </p>
          {subscription?.provider ? (
            <p className="mt-3 text-[11px] text-ink-soft">
              Provider: <span className="font-medium text-plum">{subscription.provider}</span>
            </p>
          ) : null}
        </section>
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl text-plum">Payment history</h2>
            <p className="text-xs text-ink-soft">Receipts for every completed checkout.</p>
          </div>
          {payments.length ? <Badge variant="outline">{payments.length}</Badge> : null}
        </div>

        {payments.length ? (
          <div className="overflow-hidden rounded-3xl border border-line bg-white/70 shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-line bg-cream/60 text-[10px] uppercase tracking-wider text-ink-soft">
                  <tr>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Plan</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-line/70 last:border-0">
                      <td className="whitespace-nowrap px-5 py-3 text-ink-soft">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="px-5 py-3 text-plum">
                        {payment.plans?.name ?? "Heartly"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-plum">
                        {formatMoney(payment.amount, payment.currency)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={paymentVariant[payment.status]}>
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="max-w-40 truncate px-5 py-3 font-mono text-[10px] text-ink-soft">
                        {payment.provider_reference}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={ReceiptText}
            title="No payments yet"
            description="When you upgrade, your receipts will be listed here."
            action={
              !isPremium ? (
                <Button asChild variant="outline">
                  <Link href="/pricing">View plans</Link>
                </Button>
              ) : undefined
            }
          />
        )}
      </section>

      <p className="text-center text-[11px] text-ink-soft">
        Need help with a charge?{" "}
        <Link href="/contact" className="font-medium text-rose hover:underline">
          Contact support
        </Link>
        .
      </p>
    </div>
  );
}
