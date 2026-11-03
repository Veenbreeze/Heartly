import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Crown,
  Heart,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { UpgradeButton } from "@/components/payments/upgrade-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCurrentProfile, getCurrentUser, getEntitlements } from "@/lib/auth";
import { getCatalogue } from "@/lib/templates/data";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start free, then unlock every template, music, scheduled delivery, QR codes and more with Heartly Premium.",
};

const comparison = [
  { feature: "Active gifts", free: "3", premium: "100" },
  { feature: "Photos per gift", free: "3", premium: "20" },
  { feature: "Premium templates", free: false, premium: true },
  { feature: "Background music", free: false, premium: true },
  { feature: "Advanced animations", free: false, premium: true },
  { feature: "Scheduled delivery", free: false, premium: true },
  { feature: "Password protection", free: false, premium: true },
  { feature: "Gift expiry", free: true, premium: true },
  { feature: "QR codes", free: false, premium: true },
  { feature: "Advanced analytics", free: false, premium: true },
  { feature: "Remove Heartly branding", free: false, premium: true },
];

const faqs = [
  {
    question: "Can I send a gift without an account?",
    answer:
      "Yes. You can create and publish a free gift as a guest. Creating an account lets you come back later to edit, track views and see replies.",
  },
  {
    question: "What happens when I upgrade?",
    answer:
      "Premium unlocks immediately after payment is confirmed. You keep every gift you have already made, and all Premium features apply to new and existing gifts.",
  },
  {
    question: "Can I cancel at any time?",
    answer:
      "Yes. Cancel from your billing page whenever you like. Your Premium features stay active until the end of the paid period.",
  },
  {
    question: "How do payments work?",
    answer:
      "Pay securely through ClickPesa by M-Pesa, HaloPesa, Airtel Money, Mixx by Yas, or card where enabled. Heartly never asks for or stores your mobile money PIN or full card number.",
  },
];

export default async function PricingPage() {
  const [{ plans }, user, profile] = await Promise.all([
    getCatalogue(),
    getCurrentUser(),
    getCurrentProfile(),
  ]);
  const entitlements = await getEntitlements(user?.id);
  const premium = plans.find((plan) => plan.code === "premium");
  const free = plans.find((plan) => plan.code === "free");
  const currency = profile?.currency === "USD" ? "USD" : "TZS";
  const premiumPrice = premium
    ? currency === "USD"
      ? formatMoney(premium.price_usd_cents, "USD")
      : formatMoney(premium.price_tzs, "TZS")
    : formatMoney(15000, "TZS");
  const premiumUsd = premium ? formatMoney(premium.price_usd_cents, "USD") : "$5.99";

  return (
    <>
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-20 top-0 size-72 rounded-full bg-blush/70 blur-3xl" />
          <div className="absolute -right-16 top-24 size-80 rounded-full bg-petal/50 blur-3xl" />
        </div>
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="border-petal bg-white/70 px-3 py-1">
              <Sparkles className="text-rose" /> Simple, honest pricing
            </Badge>
            <h1 className="mt-6 text-balance text-4xl leading-tight text-plum sm:text-6xl">
              Start free. Go Premium when it matters.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-ink-soft">
              Every gift starts with a free account and a free link. Premium gives you
              the whole studio: every template, music, scheduling and more.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
            <article className="flex flex-col rounded-[2rem] border border-line bg-white/75 p-6 shadow-soft sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">
                    Free
                  </p>
                  <h2 className="mt-2 font-display text-3xl text-plum">
                    A gentle place to start
                  </h2>
                </div>
                <span className="flex size-11 items-center justify-center rounded-2xl bg-blush text-rose">
                  <Heart className="size-5" />
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                {free?.description ??
                  "Everything you need to send a thoughtful digital gift."}
              </p>
              <p className="mt-6 font-display text-5xl text-plum">
                Free
                <span className="ml-1 font-sans text-sm text-ink-soft">forever</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {(free?.features ?? []).map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-ink-soft">
                    <Check className="mt-0.5 size-4 shrink-0 text-rose" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" variant="outline" className="mt-8 w-full">
                <Link href={user ? "/create" : "/register?next=/create"}>
                  Start for free <ArrowRight />
                </Link>
              </Button>
            </article>

            <article className="relative flex flex-col overflow-hidden rounded-[2rem] border border-plum/10 bg-plum p-6 text-white shadow-lift sm:p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-rose/30 blur-3xl"
              />
              <div className="relative flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-petal">
                    Heartly Premium
                  </p>
                  <h2 className="mt-2 font-display text-3xl">
                    For the moments you linger over
                  </h2>
                </div>
                <Badge variant="premium" className="border-white/20 bg-white/10">
                  <Crown /> Most loved
                </Badge>
              </div>
              <p className="relative mt-4 text-sm leading-relaxed text-white/65">
                {premium?.description ??
                  "Every template, every detail, and every way to make someone feel special."}
              </p>
              <p className="relative mt-6 font-display text-5xl">
                {premiumPrice}
                <span className="ml-1 font-sans text-sm text-white/60">
                  / month
                </span>
              </p>
              <p className="relative mt-1 text-[11px] text-white/45">
                {currency === "USD"
                  ? "Billed in US dollars."
                  : `About ${premiumUsd} per month.`}
              </p>
              <ul className="relative mt-6 flex-1 space-y-3">
                {(premium?.features ?? []).map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-white/85">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <Check className="size-2.5" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="relative mt-8">
                <UpgradeButton
                  signedIn={Boolean(user)}
                  isPremium={entitlements.tier === "premium"}
                  currency={currency}
                />
                <p className="mt-3 text-center text-[10px] text-white/45">
                  Secure checkout through ClickPesa. Cancel anytime.
                </p>
              </div>
            </article>
          </div>

          <p className="mx-auto mt-6 flex max-w-4xl items-center justify-center gap-2 text-center text-xs text-ink-soft">
            <ShieldCheck className="size-4 text-rose" />
            No hidden fees. No charge for the recipient, ever.
          </p>
        </div>
      </section>

      <section className="border-y border-line/70 bg-white/40 py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Compare"
            title="What changes with Premium."
            description="Everything in Free stays free. Premium adds room, polish and the details that make a gift feel unforgettable."
          />
          <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-3xl border border-line bg-white/75 shadow-soft">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-cream/60 text-[10px] uppercase tracking-wider text-ink-soft">
                <tr>
                  <th className="px-5 py-4 font-medium">Feature</th>
                  <th className="px-5 py-4 text-center font-medium">Free</th>
                  <th className="px-5 py-4 text-center font-medium text-rose">Premium</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.feature} className="border-b border-line/70 last:border-0">
                    <td className="px-5 py-3.5 text-ink-soft">{row.feature}</td>
                    <td className="px-5 py-3.5 text-center text-ink-soft">
                      {typeof row.free === "boolean" ? (
                        row.free ? (
                          <Check className="mx-auto size-4 text-emerald-600" />
                        ) : (
                          <X className="mx-auto size-4 text-ink-soft/40" />
                        )
                      ) : (
                        row.free
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center font-medium text-plum">
                      {typeof row.premium === "boolean" ? (
                        row.premium ? (
                          <Check className="mx-auto size-4 text-rose" />
                        ) : (
                          <X className="mx-auto size-4 text-ink-soft/40" />
                        )
                      ) : (
                        row.premium
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Questions"
            title="A few things people ask."
            align="center"
          />
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-3xl border border-line bg-white/70 p-5"
              >
                <h3 className="flex items-start gap-2 font-display text-xl text-plum">
                  <HelpCircle className="mt-1 size-4 shrink-0 text-rose" />
                  {faq.question}
                </h3>
                <p className="mt-2 pl-6 text-sm leading-relaxed text-ink-soft">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-ink-soft">
            Still unsure?{" "}
            <Link href="/contact" className="font-medium text-rose hover:underline">
              Talk to us
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
