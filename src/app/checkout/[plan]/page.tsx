import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Check, Clock3, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { PlanCheckoutForm } from "@/components/payments/plan-checkout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser, getEntitlements } from "@/lib/auth";
import { getCatalogue } from "@/lib/templates/data";
import { formatMoney } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ plan: string }>;
}): Promise<Metadata> {
  const { plan: planCode } = await params;
  const { plans } = await getCatalogue();
  const plan = plans.find((item) => item.code === planCode);
  return {
    title: plan ? `Checkout · ${plan.name}` : "Checkout",
    robots: { index: false, follow: false },
  };
}

export default async function PlanCheckoutPage({
  params,
}: {
  params: Promise<{ plan: string }>;
}) {
  const { plan: planCode } = await params;
  const [{ plans }, user] = await Promise.all([getCatalogue(), getCurrentUser()]);
  const plan = plans.find(
    (item) => item.code === planCode && item.is_active && item.price_tzs > 0,
  );

  if (!plan) notFound();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/checkout/${plan.code}`)}`);
  }

  const entitlements = await getEntitlements(user.id);
  const current = entitlements.planCode === plan.code;

  return (
    <main className="min-h-screen bg-cream px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex items-center justify-between gap-3">
          <Logo size="sm" />
          <Button asChild variant="ghost" size="sm">
            <Link href="/pricing">
              <ArrowLeft /> Plans
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[2rem] border border-line bg-white/70 p-6 shadow-soft sm:p-8">
            <Badge variant="outline" className="border-petal bg-white/70 px-3 py-1">
              <Sparkles className="text-rose" /> Secure mobile money checkout
            </Badge>
            <h1 className="mt-5 font-display text-4xl leading-tight text-plum">
              {current ? "You are on this plan." : `Choose ${plan.name}.`}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
              {current
                ? "This plan is already active on your account. You can manage it from your billing page."
                : "Enter the mobile money number you want to pay with. ClickPesa sends a prompt to your phone, and you approve it with your wallet PIN."}
            </p>

            <div className="mt-6 rounded-2xl border border-line bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose">
                    {plan.billing_interval === "month" ? "Monthly plan" : plan.billing_interval}
                  </p>
                  <p className="mt-1 font-display text-2xl text-plum">{plan.name}</p>
                </div>
                <p className="font-display text-2xl text-plum">
                  {formatMoney(plan.price_tzs, "TZS")}
                </p>
              </div>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs text-ink-soft">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-blush text-rose">
                      <Check className="size-2.5" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 grid gap-3 text-xs text-ink-soft sm:grid-cols-3">
              <p className="flex items-start gap-2">
                <Clock3 className="mt-0.5 size-4 shrink-0 text-rose" />
                Activates as soon as payment is confirmed.
              </p>
              <p className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-rose" />
                No card needed. No automatic renewal charges without approval.
              </p>
              <p className="flex items-start gap-2">
                <Lock className="mt-0.5 size-4 shrink-0 text-rose" />
                Your PIN stays on your phone.
              </p>
            </div>
          </section>

          <section className="h-fit rounded-[2rem] border border-line bg-white/85 p-6 shadow-lift sm:p-8">
            {current ? (
              <div className="text-center">
                <h2 className="font-display text-2xl text-plum">Already active</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {plan.name} is the plan on your account right now.
                </p>
                <Button asChild className="mt-5 w-full">
                  <Link href="/dashboard/billing">Manage billing</Link>
                </Button>
                <Button asChild variant="ghost" className="mt-2 w-full">
                  <Link href="/pricing">Compare other plans</Link>
                </Button>
              </div>
            ) : (
              <PlanCheckoutForm
                planCode={plan.code}
                planName={plan.name}
                amountTzs={plan.price_tzs}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
