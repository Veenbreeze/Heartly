import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Link2,
  MapPin,
  Palette,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "About",
  description:
    "Heartly is a Tanzanian digital gift studio built to make thoughtful moments easier to send.",
};

const values = [
  {
    icon: Heart,
    title: "Feeling over flash",
    body: "A gift should sound like the person who sent it. We build tools that get out of the way of your words.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    body: "Gifts are not a public performance. You control the link, the visibility, the password and the expiry.",
  },
  {
    icon: Palette,
    title: "Beautiful for everyone",
    body: "Good design should not be a premium skill. Every template starts polished and stays easy to change.",
  },
  {
    icon: Users,
    title: "Made for real life",
    body: "Birthdays, long-distance love, quick thank-yous and big questions. Heartly is built around actual moments.",
  },
];

const stats = [
  { value: "12", label: "Occasion categories" },
  { value: "3 min", label: "Typical time to a first gift" },
  { value: "1 link", label: "Everything the recipient needs" },
  { value: "TZ", label: "Designed in Tanzania" },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-24 top-0 size-72 rounded-full bg-blush/70 blur-3xl" />
          <div className="absolute -right-16 top-20 size-80 rounded-full bg-petal/50 blur-3xl" />
        </div>
        <div className="container-page">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="border-petal bg-white/70 px-3 py-1">
              <MapPin className="text-rose" /> Made in Tanzania
            </Badge>
            <h1 className="mt-6 text-balance text-4xl leading-tight text-plum sm:text-6xl">
              The thoughtfulness of handmade. The ease of a link.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-ink-soft">
              Heartly exists for the moment you want to say something meaningful
              but do not have hours to design it. We make beautiful digital gifts
              that feel personal, not mass-produced.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/create">
                  Create a gift <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing">See Premium</Link>
              </Button>
            </div>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-line bg-white/70 p-5 text-center"
              >
                <p className="font-display text-3xl text-plum">{stat.value}</p>
                <p className="mt-1 text-[11px] leading-snug text-ink-soft">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line/70 bg-white/40 py-16">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose">
              Why we built this
            </p>
            <h2 className="mt-3 text-balance text-3xl leading-tight text-plum sm:text-4xl">
              Sending love should feel lighter.
            </h2>
          </div>
          <div className="space-y-4 text-pretty leading-relaxed text-ink-soft">
            <p>
              Physical gifts are wonderful, but they are not always possible.
              Distance, timing, budget and busy lives get in the way. A message
              alone can disappear in a crowded inbox.
            </p>
            <p>
              Heartly sits between the two: more intentional than a text, easier
              than a parcel, and personal enough to keep. A place to gather your
              words, photos and music into one small, beautiful moment.
            </p>
            <p>
              We are building the product we wanted for our own birthdays,
              anniversaries, apologies, thank-yous and just-because days — with
              mobile money, local pricing and a mobile-first experience from the
              start.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="What we believe"
            title="Small product. Strong principles."
            align="center"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-3xl border border-line bg-white/70 p-6"
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-blush text-rose">
                  <value.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-2xl text-plum">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {value.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-line bg-gradient-to-br from-blush via-cream to-petal/60 px-6 py-14 text-center sm:px-14">
            <div className="pointer-events-none absolute -left-10 -top-10 size-40 rounded-full bg-white/60 blur-2xl" />
            <Heart className="mx-auto size-8 fill-rose/20 text-rose" />
            <h2 className="mx-auto mt-5 max-w-2xl text-balance text-3xl leading-tight text-plum sm:text-4xl">
              Someone is going to remember how this made them feel.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-ink-soft">
              Start with a free gift today. You can always make the next one a
              little more extra.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/create">
                  <Sparkles /> Create a gift
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/how-it-works">
                  <Link2 /> How it works
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
