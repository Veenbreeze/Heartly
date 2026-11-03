import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ReceiptText } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { PaymentStatus } from "@/components/payments/payment-status";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Payment status · Heartly",
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    reference?: string;
    orderReference?: string;
    order_reference?: string;
  }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  let reference = params.reference ?? params.orderReference ?? params.order_reference;
  if (!reference && user) {
    const admin = getAdminClient();
    if (admin) {
      const { data } = await admin
        .from("payments")
        .select("provider_reference")
        .eq("user_id", user.id)
        .eq("provider", "clickpesa")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      reference = data?.provider_reference ?? undefined;
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-7 flex items-center justify-between">
          <Logo size="sm" />
          <Button asChild variant="ghost" size="sm">
            <Link href={user ? "/dashboard/billing" : "/"}>
              <ArrowLeft /> {user ? "Billing" : "Home"}
            </Link>
          </Button>
        </div>

        {!reference ? (
          <div className="text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <ReceiptText className="size-7" />
            </span>
            <h1 className="mt-6 font-display text-3xl text-plum">
              No payment reference.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Open your billing page to check your plan or start a new checkout.
            </p>
            <Button asChild className="mt-6">
              <Link href="/dashboard/billing">Go to billing</Link>
            </Button>
          </div>
        ) : !user ? (
          <div className="text-center">
            <h1 className="font-display text-3xl text-plum">
              Sign in to confirm your payment.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Your payment reference is saved. Sign in with the account that
              started the checkout and we will check the status.
            </p>
            <Button asChild className="mt-6">
              <Link
                href={`/login?next=${encodeURIComponent(
                  `/checkout/success?reference=${encodeURIComponent(reference)}`,
                )}`}
              >
                Sign in
              </Link>
            </Button>
          </div>
        ) : (
          <PaymentStatus reference={decodeURIComponent(reference)} />
        )}
      </div>
    </main>
  );
}
