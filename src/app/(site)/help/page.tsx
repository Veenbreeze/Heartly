import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  Gift,
  KeyRound,
  LifeBuoy,
  Mail,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Help centre",
  description:
    "Answers for editing gifts, sharing links, passwords, billing and reporting content on Heartly.",
};

const supportEmail =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "hello@heartly.example";

const topics = [
  {
    icon: Gift,
    title: "Creating and editing",
    items: [
      "Choose a template from Explore, then add your message, photos and colours in the studio.",
      "Changes save automatically while you edit. Use the Publish tab when you are ready to share.",
      "Guest gifts live in the browser that made them. Create an account to keep gifts attached to your email.",
    ],
  },
  {
    icon: KeyRound,
    title: "Links and passwords",
    items: [
      "A published gift has one link. Anyone with the link can open it unless you add a password.",
      "Password-protected gifts require Premium. The recipient is asked for the password before the gift opens.",
      "If a link says the gift is missing, it may be unpublished, expired or mistyped.",
    ],
  },
  {
    icon: CreditCard,
    title: "Premium and payments",
    items: [
      "Premium activates automatically after ClickPesa confirms the payment.",
      "If the page is still confirming, keep it open for a few seconds while we check the provider.",
      "For a missing or duplicate charge, email us with the payment reference from your billing page.",
    ],
  },
  {
    icon: ShieldAlert,
    title: "Reporting a gift",
    items: [
      "Open the gift and use the report link at the bottom of the page.",
      "Choose the reason and add any details that help us review it.",
      "Reports are private. The person who sent the gift is not told who reported it.",
    ],
  },
];

export default function HelpPage() {
  return (
    <>
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-20 top-0 size-72 rounded-full bg-blush/70 blur-3xl" />
          <div className="absolute -right-16 top-24 size-80 rounded-full bg-petal/50 blur-3xl" />
        </div>
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <LifeBuoy className="mx-auto size-9 text-rose" />
            <h1 className="mt-5 text-balance text-4xl leading-tight text-plum sm:text-6xl">
              Help centre
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-ink-soft">
              Quick answers for gifts, links, passwords and payments. If you
              cannot find what you need, we are one email away.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/create">
                  <Sparkles /> Make a gift
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">
                  <Mail /> Contact support
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line/70 bg-white/40 py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Common topics"
            title="Start with the thing that is stuck."
            align="center"
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {topics.map((topic) => (
              <article
                key={topic.title}
                className="rounded-3xl border border-line bg-white/75 p-6 shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-blush text-rose">
                    <topic.icon className="size-4" />
                  </span>
                  <h2 className="font-display text-2xl text-plum">{topic.title}</h2>
                </div>
                <ul className="mt-4 space-y-3">
                  {topic.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-ink-soft">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-rose" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div id="reporting" className="mx-auto mt-10 max-w-3xl rounded-3xl border border-line bg-white/75 p-6 text-center">
            <ShieldAlert className="mx-auto size-6 text-rose" />
            <h2 className="mt-3 font-display text-2xl text-plum">
              Need to report something?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
              Open the gift and select the report option at the bottom. If the
              report form is not available, email{" "}
              <a
                href={`mailto:${supportEmail}?subject=Report%20a%20Heartly%20gift`}
                className="font-medium text-rose hover:underline"
              >
                {supportEmail}
              </a>{" "}
              with the link. Do not include screenshots of private content unless
              we ask for them.
            </p>
          </div>

          <p className="mt-8 text-center text-sm text-ink-soft">
            Still stuck?{" "}
            <Link href="/contact" className="inline-flex items-center gap-1 font-medium text-rose hover:underline">
              Contact us <ArrowRight className="size-3.5" />
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
