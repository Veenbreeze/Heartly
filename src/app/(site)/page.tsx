import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Crown,
  Gift,
  Globe2,
  Heart,
  Link2,
  Music,
  Palette,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { TemplateCard } from "@/components/templates/template-card";
import { categoryIcons } from "@/components/templates/template-art";
import { getCatalogue } from "@/lib/templates/data";
import { formatMoney } from "@/lib/utils";

const steps = [
  {
    icon: Palette,
    title: "Choose a feeling",
    body: "Pick a template that matches the moment — a birthday, a love letter, a question, or a surprise.",
  },
  {
    icon: Wand2,
    title: "Make it yours",
    body: "Add your words, photos, colours, music, and a little animation. Preview it as you go.",
  },
  {
    icon: Send,
    title: "Send the link",
    body: "Share one private link. They open it, feel it, and can reply right there.",
  },
];

const features = [
  {
    icon: Heart,
    title: "Made to feel personal",
    body: "Your words, your photos, your colours. Every gift is built around the person receiving it.",
  },
  {
    icon: Music,
    title: "Music and motion",
    body: "Set the mood with background music and gentle animations that make the moment land.",
  },
  {
    icon: Smartphone,
    title: "Beautiful on any screen",
    body: "Designed mobile-first, because the link will almost certainly be opened on a phone.",
  },
  {
    icon: Link2,
    title: "One simple link",
    body: "No apps, no accounts for the recipient. They tap, they open, they smile.",
  },
  {
    icon: BarChart3,
    title: "Know it arrived",
    body: "See views and replies so you are not left wondering whether they saw it.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    body: "Unlisted links, optional passwords, and expiry dates put you in control.",
  },
];

export default async function HomePage() {
  const { categories, templates } = await getCatalogue();
  const featured = [
    ...templates.filter((template) => !template.is_premium),
    ...templates.filter((template) => template.is_premium),
  ].slice(0, 8);
  const premium = formatMoney(15000, "TZS");

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-24 top-10 size-72 rounded-full bg-blush/70 blur-3xl" />
          <div className="absolute -right-16 top-28 size-80 rounded-full bg-petal/50 blur-3xl" />
          <div className="absolute left-1/2 top-0 size-64 -translate-x-1/2 rounded-full bg-white/60 blur-3xl" />
        </div>
        <div className="container-page grid items-center gap-14 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-24">
          <div className="animate-fade-up">
            <Badge variant="outline" className="mb-6 border-petal bg-white/70 px-3 py-1">
              <Sparkles className="text-rose" />
              Digital gifts, made personal
            </Badge>
            <h1 className="text-balance text-[2.75rem] leading-[1.05] tracking-tight text-plum sm:text-6xl">
              Send a little joy,
              <span className="block text-rose">wrapped in a link.</span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink-soft">
              Create a beautiful digital gift with your own message, photos,
              music, and animation. Share it in seconds — and give someone a
              moment they will want to open again.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/create">
                  Create a free gift <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/explore">See how it looks</Link>
              </Button>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-soft">
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

          <div className="relative mx-auto w-full max-w-md animate-fade-up [animation-delay:150ms]">
            <div className="absolute -left-6 top-10 hidden rotate-[-8deg] rounded-3xl border border-line bg-white/80 p-4 shadow-soft sm:block">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-blush text-rose">
                  <Gift className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-plum">A gift for you</p>
                  <p className="text-[10px] text-ink-soft">heartly.link/hello</p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[2.25rem] border border-white/70 bg-gradient-to-br from-blush via-cream to-petal/70 p-3 shadow-lift">
              <div className="relative overflow-hidden rounded-[1.8rem] bg-cream">
                <div className="relative flex min-h-[26rem] flex-col items-center justify-center px-8 py-12 text-center">
                  <div className="absolute left-8 top-8 size-2 rounded-full bg-rose/40" />
                  <div className="absolute right-10 top-16 size-3 rounded-full bg-plum/20" />
                  <div className="absolute bottom-12 left-12 size-2.5 rounded-full bg-rose/30" />
                  <Heart className="mb-6 size-9 fill-rose/15 text-rose" strokeWidth={1.4} />
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-rose">
                    A little something
                  </p>
                  <h2 className="mt-4 font-display text-4xl leading-tight text-plum">
                    Just because
                    <br />
                    you matter.
                  </h2>
                  <p className="mt-5 max-w-[17rem] text-sm leading-relaxed text-ink-soft">
                    &ldquo;You make ordinary days feel like celebrations. Thank
                    you for being exactly you.&rdquo;
                  </p>
                  <div className="mt-8 h-px w-16 bg-petal" />
                  <p className="mt-4 font-display text-lg text-plum">With love, always</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-ink-soft">
                    <Sparkles className="size-3 text-rose" /> Tap to open
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -right-4 hidden rotate-6 items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 shadow-soft sm:flex">
              <span className="flex size-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Check className="size-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-plum">Gift opened</p>
                <p className="text-[10px] text-ink-soft">just now</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line/70 bg-white/40 py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="For every moment"
            title="Some feelings deserve more than a text."
            description="Start with the occasion. Heartly gives you a thoughtful canvas for birthdays, love, friendship, gratitude, and the moments in between."
            action={
              <Button asChild variant="outline">
                <Link href="/categories">
                  All categories <ArrowRight />
                </Link>
              </Button>
            }
          />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.slice(0, 12).map((category) => {
              const Icon = categoryIcons[category.slug] ?? Gift;
              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group flex items-center gap-3 rounded-2xl border border-line/80 bg-white/70 p-3.5 transition hover:-translate-y-0.5 hover:border-rose/30 hover:bg-white"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blush text-rose transition group-hover:bg-rose group-hover:text-white">
                    <Icon className="size-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-plum">
                      {category.name}
                    </p>
                    {category.is_premium ? (
                      <p className="text-[10px] font-medium uppercase tracking-wider text-rose">
                        Premium
                      </p>
                    ) : (
                      <p className="text-[10px] text-ink-soft">Explore</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Start with a design"
            title="Templates that already feel like something."
            description="Every template is a starting point. Change the words, the colours, and the feeling until it sounds like you."
            action={
              <Button asChild variant="outline">
                <Link href="/explore">
                  Explore all templates <ArrowRight />
                </Link>
              </Button>
            }
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                categories={categories}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-plum py-20 text-white">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-petal">
              Three small steps
            </p>
            <h2 className="text-balance text-3xl leading-tight sm:text-4xl">
              From &ldquo;I should do something&rdquo; to &ldquo;I just sent it.&rdquo;
            </h2>
            <p className="mt-4 text-pretty text-base leading-relaxed text-white/70">
              Heartly is built for the moments when you want to say something
              meaningful but do not have hours to design it.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="relative rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur"
              >
                <span className="font-display text-5xl text-petal/40">
                  0{index + 1}
                </span>
                <step.icon className="mt-6 size-5 text-petal" />
                <h3 className="mt-4 font-display text-2xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Button asChild size="lg" variant="secondary">
              <Link href="/create">
                Start your first gift <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Why Heartly"
            title="The thoughtfulness of a handmade gift. The ease of a link."
            align="center"
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-line bg-white/70 p-6 transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-blush text-rose">
                  <feature.icon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-xl text-plum">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line/70 bg-blush/35 py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Badge variant="premium" className="mb-5">
              <Crown /> Heartly Premium
            </Badge>
            <h2 className="text-balance text-3xl leading-tight text-plum sm:text-4xl">
              For the gifts you want to linger over.
            </h2>
            <p className="mt-4 max-w-lg text-pretty leading-relaxed text-ink-soft">
              Premium unlocks every template, background music, richer
              animations, scheduled delivery, password protection, and deeper
              analytics.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/pricing">
                  See what is included <ArrowRight />
                </Link>
              </Button>
              <p className="flex items-center text-sm text-ink-soft">
                From <span className="mx-1.5 font-semibold text-plum">{premium}</span>{" "}
                / month
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "All premium templates",
              "Background music",
              "Advanced animations",
              "20 photos per gift",
              "Scheduled delivery",
              "Password protection",
              "QR codes",
              "Remove Heartly branding",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-line bg-white/75 px-4 py-3 text-sm text-ink"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-rose/10 text-rose">
                  <Check className="size-3.5" />
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-line bg-gradient-to-br from-blush via-cream to-petal/60 px-6 py-14 text-center sm:px-14">
            <div className="pointer-events-none absolute -left-10 -top-10 size-40 rounded-full bg-white/60 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-12 -right-8 size-48 rounded-full bg-rose/10 blur-2xl" />
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
                  Create a gift <Sparkles />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/explore">
                  <Globe2 /> Browse the gallery
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
