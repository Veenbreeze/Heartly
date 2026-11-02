import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  CreditCard,
  Flag,
  HeartHandshake,
  Mail,
  MessageCircleHeart,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Questions about a gift, a payment or your account? Get in touch with the Heartly team.",
};

const supportEmail =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "hello@heartly.example";

const reasons = [
  {
    icon: HeartHandshake,
    title: "A gift or your account",
    body: "Need help editing a gift, recovering access or understanding your plan? Start here.",
    href: `mailto:${supportEmail}?subject=Heartly%20account%20help`,
    action: "Email support",
  },
  {
    icon: CreditCard,
    title: "Payments and billing",
    body: "Questions about a Premium charge, a receipt or a refund? Include your payment reference.",
    href: `mailto:${supportEmail}?subject=Heartly%20billing%20question`,
    action: "Contact billing",
  },
  {
    icon: Flag,
    title: "Report a gift",
    body: "If a gift contains harmful or illegal content, open the gift and use the report link at the bottom.",
    href: "/help#reporting",
    action: "How reporting works",
  },
];

const faqs = [
  {
    question: "How quickly will I hear back?",
    answer:
      "We aim to reply within one business day. Payment issues are prioritised, so include your reference and the email on your account.",
  },
  {
    question: "My gift link is not opening. What should I check?",
    answer:
      "Check that the gift is published, has not expired, and that the full link was copied. Password-protected gifts need the password from the sender.",
  },
  {
    question: "Can you recover a gift I made as a guest?",
    answer:
      "Guest gifts are tied to the browser that created them. If you cleared your browser data, we may not be able to recover access. Creating an account keeps future gifts attached to you.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "See our refund policy for the circumstances in which we can help. If you were charged twice or Premium did not activate, contact us with the payment reference.",
  },
];

export default function ContactPage() {
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
              <MessageCircleHeart className="text-rose" /> We are here
            </Badge>
            <h1 className="mt-6 text-balance text-4xl leading-tight text-plum sm:text-6xl">
              Tell us what you need.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-ink-soft">
              Real people read these messages. Whether something broke, a charge
              looks wrong or you just have a question, we will help you sort it.
            </p>
            <Button asChild size="lg" className="mt-8">
              <a href={`mailto:${supportEmail}`}>
                <Mail /> {supportEmail}
              </a>
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-soft">
              <Clock3 className="size-3.5 text-rose" /> Usually within one business day
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-3">
            {reasons.map((reason) => (
              <article
                key={reason.title}
                className="flex flex-col rounded-3xl border border-line bg-white/75 p-5 shadow-soft"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-blush text-rose">
                  <reason.icon className="size-4" />
                </span>
                <h2 className="mt-4 font-display text-xl text-plum">
                  {reason.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                  {reason.body}
                </p>
                <a
                  href={reason.href}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-rose hover:underline"
                >
                  {reason.action} <ArrowRight className="size-3.5" />
                </a>
              </article>
            ))}
          </div>

          <p className="mx-auto mt-8 flex max-w-2xl items-start justify-center gap-2 text-center text-xs leading-relaxed text-ink-soft">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-rose" />
            Never send your password, mobile money PIN or full card number by
            email. We will never ask for them.
          </p>
        </div>
      </section>

      <section className="border-y border-line/70 bg-white/40 py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Before you write"
            title="Quick answers to common questions."
            align="center"
          />
          <div className="mx-auto mt-10 max-w-3xl space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-line bg-white/75 px-5 py-4"
              >
                <summary className="cursor-pointer list-none text-sm font-medium text-plum marker:hidden">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-ink-soft">
            Looking for policies?{" "}
            <Link href="/legal/privacy" className="font-medium text-rose hover:underline">
              Privacy
            </Link>
            ,{" "}
            <Link href="/legal/terms" className="font-medium text-rose hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/legal/refunds" className="font-medium text-rose hover:underline">
              Refunds
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
