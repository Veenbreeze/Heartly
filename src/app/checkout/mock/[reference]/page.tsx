import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { MockCheckout } from "@/components/payments/mock-checkout";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getPaymentByReference } from "@/lib/payments/service";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Simulated checkout · Heartly",
  robots: { index: false, follow: false },
};

export default async function MockCheckoutPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const user = await requireUser();
  const payment = await getPaymentByReference(decodeURIComponent(reference));

  if (
    !payment ||
    payment.user_id !== user.id ||
    payment.provider !== "mock" ||
    !payment.plans
  ) {
    notFound();
  }
  if (payment.status === "succeeded") redirect("/dashboard/billing?paid=1");
  if (payment.status !== "pending") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-5">
        <div className="max-w-sm text-center">
          <Logo />
          <h1 className="mt-8 font-display text-3xl text-plum">
            This checkout is closed.
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            The simulated payment is {payment.status}. Start a new checkout from
            the billing page.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard/billing">Back to billing</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Logo size="sm" />
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/billing">
              <ArrowLeft /> Billing
            </Link>
          </Button>
        </div>
        <MockCheckout
          reference={payment.provider_reference}
          planName={payment.plans.name}
          amount={formatMoney(payment.amount, payment.currency)}
        />
      </div>
    </main>
  );
}
