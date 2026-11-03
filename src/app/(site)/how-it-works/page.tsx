import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Heart,
  Link2,
  LockKeyhole,
  Palette,
  Send,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Choose a template, make it personal, and send one beautiful link. Heartly takes minutes, not hours.",
};

const steps = [
  {
    icon: Palette,
    title: "Choose a feeling",
        body: "Start with a design for a birthday, love letter, invitation, thank you or surprise. Every template is a starting point, not a cage.",
    details: ["12 occasion-led categories", "Free and Premium designs", "Preview before you commit"],
  },
  {
    icon: Wand2,
    title: "Make it yours",
    body: "Add your words, photos, colours and music. Adjust the animation, then watch the live preview update as you type.",
    details: ["Personal message and names", "Photos, music and motion", "Autosaved as you edit"],
  },
  {
    icon: Send,
    title: "Send one link",
    body: "Publish and share a private link. The recipient opens it in their browser — no app, no account and no download needed.",
    details: ["Works on any phone", "Unlisted or password-protected", "See views and replies"],
  },
];

const details = [
  {
    icon: Heart,
    title: "Thoughtful by default",
    body: "The words are yours. Heartly handles the layout, type and motion so the finished gift still feels personal.",
  },
  {
    icon: LockKeyhole,
    title: "Private when you need it",
    body: "Keep a gift unlisted, add a password, or set an expiry date. Your recipient only needs the link you choose to share.",
  },
  {
    icon: Smartphone,
    title: "Made for the phone",
        body: "Most links are opened on a phone, so every template is designed for mobile and tested on small screens.",
  },
  {
    icon: Share2,
    title: "Easy to pass on",
    body: "Send it on WhatsApp, by text or email. Premium adds a QR code for printing or sharing in person.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-20 top-6 size-72 rounded-full bg-blush/70 blur-3xl" />
          <div className="absolute -right-16 top-24 size-80 rounded-full bg-petal/50 blur-3xl" />
        </div>
        <div className="container-page grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose">
              From thought to gift
            </p>
            <h1 className="mt-4 text-balance text-4xl leading-tight text-plum sm:text-6xl">
              A meaningful gift in three small steps.
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-ink-soft">
              You do not need design skills or hours of free time. Pick a
              template, write what you actually mean, and send a link that feels
              like you.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/create">
                  Make a gift <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/explore">Browse templates</Link>
              </Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-rose" /> Free to start
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-rose" /> No app needed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-rose" /> Ready in minutes
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -left-5 top-8 hidden rotate-[-7deg] rounded-2xl border border-line bg-white/85 px-4 py-3 shadow-soft sm:block">
              <p className="flex items-center gap-2 text-xs font-semibold text-plum">
                <Sparkles className="size-3.5 text-rose" /> Just published
              </p>
            </div>
            <div className="relative overflow-hidden rounded-[2.25rem] border border-white/70 bg-gradient-to-br from-blush via-cream to-petal/70 p-3 shadow-lift">
              <div className="rounded-[1.8rem] bg-cream px-8 py-14 text-center">
                <Heart className="mx-auto size-9 fill-rose/15 text-rose" strokeWidth={1.4} />
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.26em] text-rose">
                  For you
                </p>
                <h2 className="mt-3 font-display text-4xl leading-tight text-plum">
                  A little joy,
                  <br />
                  just because.
                </h2>
                <p className="mx-auto mt-5 max-w-[17rem] text-sm leading-relaxed text-ink-soft">
                  Some people make ordinary days feel like celebrations. Thank
                  you for being one of them.
                </p>
                <span className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-ink-soft">
                  <Link2 className="size-3 text-rose" /> heartly.link / your gift
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line/70 bg-white/40 py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="The process"
            title="Simple on the surface. Thoughtful underneath."
            description="Heartly handles the design system, saving and secure sharing so you can focus on what you want to say."
            align="center"
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-3xl border border-line bg-white/75 p-6 shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-blush text-rose">
                    <step.icon className="size-5" />
                  </span>
                  <span className="font-display text-4xl text-petal">
                    0{index + 1}
                  </span>
                </div>
                <h2 className="mt-5 font-display text-2xl text-plum">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
                <ul className="mt-5 space-y-2 border-t border-line/70 pt-4">
                  {step.details.map((detail) => (
                    <li key={detail} className="flex items-center gap-2 text-xs text-ink-soft">
                      <Check className="size-3.5 shrink-0 text-rose" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Built with care"
            title="The small details are the whole point."
            align="center"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {details.map((detail) => (
              <div
                key={detail.title}
                className="rounded-3xl border border-line bg-white/70 p-5"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-blush text-rose">
                  <detail.icon className="size-4" />
                </span>
                <h3 className="mt-4 font-display text-xl text-plum">{detail.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {detail.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-[2rem] border border-line bg-gradient-to-br from-blush via-cream to-petal/60 px-6 py-10 text-center sm:px-12">
            <ShieldCheck className="mx-auto size-7 text-rose" />
            <h2 className="mx-auto mt-4 max-w-2xl text-balance text-3xl leading-tight text-plum">
              Ready when you are.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-pretty text-ink-soft">
              Start with a free design and send something they will want to open
              again.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link href="/create">
                Create your first gift <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
