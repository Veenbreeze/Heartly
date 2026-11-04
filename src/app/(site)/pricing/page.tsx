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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCurrentUser, getEntitlements } from "@/lib/auth";
import { getCatalogue } from "@/lib/templates/data";
import { formatMoney } from "@/lib/utils";
import type { Plan } from "@/lib/types";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start free, then choose a Heartly Premium plan from TZS 3,000 to TZS 15,000 per month.",
};

const comparisonFeatures: Array<{
  feature: string;
  free: string | boolean;
  key?: keyof Plan["limits"];
}> = [
  { feature: "Active gifts", free: "3", key: "max_active_gifts" },
  { feature: "Photos per gift", free: "3", key: "max_media" },
  { feature: "Premium templates", free: false, key: "premium_templates" },
  { feature: "Background music", free: false, key: "music" },
  { feature: "Advanced animations", free: false, key: "advanced_animation" },
  { feature: "Scheduled delivery", free: false, key: "scheduled_delivery" },
  { feature: "Password protection", free: false, key: "password_protection" },
  { feature: "Gift expiry", free: true, key: "gift_expiry" },
  { feature: "QR codes", free: false, key: "qr_code" },
  { feature: "Advanced analytics", free: false, key: "advanced_analytics" },
  { feature: "Remove Heartly branding", free: false, key: "remove_branding" },
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
      "Premium unlocks immediately after payment is confirmed. You keep every gift you have already made, and your new limits apply straight away.",
  },
  {
    question: "Can I change my plan later?",
    answer:
      "Yes. Choose another plan from this page whenever you like. The new plan starts when the new payment is confirmed.",
  },
  {
    question: "How do payments work?",
    answer:
      "Choose a plan, enter your mobile money number, select your network, then approve the ClickPesa prompt with your wallet PIN. Heartly never asks for or stores your PIN.",
  },
];

function premiumValue(plan: Plan, key: keyof Plan["limits"]) {
  const value = plan.limits[key];
  if (typeof value === "number") return value.toLocaleString("en-TZ");
  return Boolean(value);
}

function PlanCard({
  plan,
  signedIn,
  highlight,
  current,
}: {
  plan: Plan;
  signedIn: boolean;
  highlight?: boolean;
  current?: boolean;
}) {
  return (
    <article
      className={
        highlight
          ? "relative flex flex-col overflow-hidden rounded-[2rem] border border-plum/10 bg-plum p-6 text-white shadow-lift"
          : "flex flex-col rounded-[2rem] border border-line bg-white/75 p-6 shadow-soft"
      }
    >
      {highlight ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-rose/30 blur-3xl"
        />
      ) : null}
      <div className="relative flex items-start justify-between gap-2">
        <div>
          <p
            className={
              highlight
                ? "text-xs font-semibold uppercase tracking-[0.2em] text-petal"
                : "text-xs font-semibold uppercase tracking-[0.2em] text-rose"
            }
          >
            {plan.name}
          </p>
          <p
            className={
              highlight
                ? "mt-2 font-display text-3xl"
                : "mt-2 font-display text-3xl text-plum"
            }
          >
            {formatMoney(plan.price_tzs, "TZS")}
            <span
              className={
                highlight
                  ? "ml-1 font-sans text-xs text-white/60"
                  : "ml-1 font-sans text-xs text-ink-soft"
              }
            >
              / month
            </span>
          </p>
        </div>
        <span
          className={
            highlight
              ? "flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white/15"
              : "flex size-10 shrink-0 items-center justify-center rounded-2xl bg-blush text-rose"
          }
        >
          <Crown className="size-4" />
        </span>
      </div>
      <p
        className={
          highlight
            ? "relative mt-3 text-xs leading-relaxed text-white/65"
            : "mt-3 text-xs leading-relaxed text-ink-soft"
        }
      >
        {plan.description}
      </p>
      <ul className="relative mt-5 flex-1 space-y-2.5">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className={
              highlight
                ? "flex items-start gap-2 text-xs text-white/85"
                : "flex items-start gap-2 text-xs text-ink-soft"
            }
          >
            <span
              className={
                highlight
                  ? "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-white/15"
                  : "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-blush text-rose"
              }
            >
              <Check className="size-2.5" />
            </span>
            {feature}
          </li>
        ))}
      </ul>
      {current ? (
        <Button
          asChild
          variant={highlight ? "secondary" : "outline"}
          className={highlight ? "mt-6 w-full bg-white text-plum hover:bg-blush" : "mt-6 w-full"}
        >
          <Link href="/dashboard/billing">Current plan</Link>
        </Button>
      ) : (
        <Button
          asChild
          variant={highlight ? "secondary" : "default"}
          className={highlight ? "mt-6 w-full bg-white text-plum hover:bg-blush" : "mt-6 w-full"}
        >
          <Link
            href={
              signedIn
                ? `/checkout/${plan.code}`
                : `/register?next=${encodeURIComponent(`/checkout/${plan.code}`)}`
            }
          >
            Choose plan <ArrowRight />
          </Link>
        </Button>
      )}
    </article>
  );
}

export default async function PricingPage() {
  const [{ plans }, user] = await Promise.all([getCatalogue(), getCurrentUser()]);
  const entitlements = await getEntitlements(user?.id);
  const free = plans.find((plan) => plan.code === "free");
  const premiumPlans = plans
    .filter((plan) => plan.limits.tier === "premium" && plan.price_tzs > 0)
    .sort((a, b) => a.sort_order - b.sort_order);

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
              Every gift starts with a free account and a free link. Premium plans
              start at TZS 3,000 per month and add every template, music, scheduling
              and more.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <article className="flex flex-col rounded-[2rem] border border-line bg-white/75 p-6 shadow-soft">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">
                    Free
                  </p>
                  <p className="mt-2 font-display text-3xl text-plum">
                    Free
                    <span className="ml-1 font-sans text-xs text-ink-soft">forever</span>
                  </p>
                </div>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-blush text-rose">
                  <Heart className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-ink-soft">
                {free?.description ?? "Everything you need to send a thoughtful digital gift."}
              </p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {(free?.features ?? []).map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs text-ink-soft">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-blush text-rose">
                      <Check className="size-2.5" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" variant="outline" className="mt-6 w-full">
                <Link href={user ? "/create" : "/register?next=/create"}>
                  Start for free <ArrowRight />
                </Link>
              </Button>
            </article>

            {premiumPlans.map((plan) => (
              <PlanCard
                key={plan.code}
                plan={plan}
                signedIn={Boolean(user)}
                highlight={plan.code === "premium_plus"}
                current={entitlements.planCode === plan.code}
              />
            ))}
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
            description="Every Premium plan unlocks the full feature set. Higher plans add more active gifts and more photos per gift."
          />
          <div className="mx-auto mt-10 max-w-5xl overflow-x-auto rounded-3xl border border-line bg-white/75 shadow-soft">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-line bg-cream/60 text-[10px] uppercase tracking-wider text-ink-soft">
                <tr>
                  <th className="px-5 py-4 font-medium">Feature</th>
                  <th className="px-5 py-4 text-center font-medium">Free</th>
                  {premiumPlans.map((plan) => (
                    <th
                      key={plan.code}
                      className="px-5 py-4 text-center font-medium text-rose"
                    >
                      {plan.name.replace("Heartly ", "")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row) => (
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
                    {premiumPlans.map((plan) => {
                      const value = row.key ? premiumValue(plan, row.key) : true;
                      return (
                        <td
                          key={plan.code}
                          className="px-5 py-3.5 text-center font-medium text-plum"
                        >
                          {typeof value === "boolean" ? (
                            value ? (
                              <Check className="mx-auto size-4 text-rose" />
                            ) : (
                              <X className="mx-auto size-4 text-ink-soft/40" />
                            )
                          ) : (
                            value
                          )}
                        </td>
                      );
                    })}
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
