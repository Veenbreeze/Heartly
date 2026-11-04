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
import { AmbientBackground } from "@/components/site/ambient-background";
import { GiftDemo, type DemoSlide } from "@/components/site/gift-demo";
import { Reveal, RevealGroup, RevealItem } from "@/components/site/reveal";
import { StatCounter } from "@/components/site/stat-counter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { TemplateCard } from "@/components/templates/template-card";
import { categoryIcons } from "@/components/templates/template-art";
import { getCatalogue } from "@/lib/templates/data";
import { templateArtPalette } from "@/lib/templates/catalog";
import { formatMoney } from "@/lib/utils";

const steps = [
  {
    icon: Palette,
    title: "Choose a feeling",
    body: "Pick a template that matches the moment a birthday, a love letter, a question, or a surprise.",
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
        body: "Designed for mobile, because the link will almost certainly be opened on a phone.",
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
  const { categories, templates, plans } = await getCatalogue();
  const featured = [
    ...templates.filter((template) => !template.is_premium),
    ...templates.filter((template) => template.is_premium),
  ].slice(0, 8);
  const demoSlides: DemoSlide[] = featured.slice(0, 4).map((template) => {
    const palette = templateArtPalette(template);
    const content = template.default_content as { title?: string; message?: string };
    return {
      title: content.title ?? template.name,
      message:
        content.message ??
        "Some feelings deserve more than a quick text. This one is just for you.",
      from: "Someone who cares",
      image: template.preview_url ?? `/api/template-art/${template.slug}`,
      accent: palette.accent,
      background: palette.background,
    };
  });
  const startingPremium = Math.min(
    ...plans
      .filter((plan) => plan.limits.tier === "premium" && plan.price_tzs > 0)
      .map((plan) => plan.price_tzs),
  );
  const premium = formatMoney(
    Number.isFinite(startingPremium) ? startingPremium : 3000,
    "TZS",
  );
  const animationStyles = new Set(
    templates.map((template) => template.animation_config?.type),
  ).size;

  return (
    <>
      <section className="relative overflow-hidden">
        <AmbientBackground variant="hero" />
        <div className="container-page grid items-center gap-14 pb-20 pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:pb-28 lg:pt-20">
          <div className="animate-fade-up">
            <Badge variant="outline" className="mb-6 border-petal bg-white/70 px-3 py-1 backdrop-blur">
              <Sparkles className="text-rose" />
              Digital gifts, made personal
            </Badge>
            <h1 className="text-balance text-[2.75rem] leading-[1.02] tracking-tight text-plum sm:text-6xl xl:text-[4.25rem]">
              Send a little joy,
              <span className="block text-gradient-rose">wrapped in a link.</span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink-soft">
              Create a beautiful digital gift with your own message, photos,
              music, and animation. Share it in seconds and give someone a
              moment they will want to open again.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/create">
                  Create a free gift <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/60 backdrop-blur">
                <Link href="/explore">
                  <Gift /> See it come alive
                </Link>
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

            <div className="mt-9 grid max-w-lg grid-cols-3 gap-3">
              {[
                { value: categories.length, suffix: "", label: "occasions" },
                { value: templates.length, suffix: "", label: "templates" },
                { value: animationStyles, suffix: "", label: "motion styles" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/70 bg-white/55 px-3 py-3 text-center backdrop-blur"
                >
                  <p className="font-display text-2xl text-plum">
                    <StatCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md animate-fade-up [animation-delay:150ms]">
            <div
              aria-hidden
              className="absolute inset-x-0 inset-y-6 overflow-hidden rounded-[2.75rem] bg-cover bg-center shadow-[0_35px_90px_-30px_rgba(62,34,50,0.45)]"
              style={{ backgroundImage: "url('/images/editorial/friends-celebrating.jpg')" }}
            >
              <span className="absolute inset-0 bg-gradient-to-br from-[#2d2430]/20 via-transparent to-[#2d2430]/45" />
            </div>
            <div className="absolute -left-8 top-12 hidden animate-float items-center gap-2 rounded-2xl border border-line bg-white/85 px-4 py-3 shadow-soft backdrop-blur sm:flex">
              <span className="flex size-8 items-center justify-center rounded-full bg-blush text-rose">
                <Heart className="size-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-plum">Opened with a smile</p>
                <p className="text-[10px] text-ink-soft">just now</p>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 hidden animate-float items-center gap-2 rounded-2xl border border-line bg-white/85 px-4 py-3 shadow-soft backdrop-blur [animation-delay:1.5s] sm:flex">
              <span className="flex size-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Check className="size-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-plum">They replied</p>
                <p className="text-[10px] text-ink-soft">&ldquo;I love this&rdquo;</p>
              </div>
            </div>
            <GiftDemo slides={demoSlides} className="relative z-10 max-w-[19rem]" />
          </div>
        </div>

        <div className="border-y border-line/60 bg-white/40 py-4 backdrop-blur">
          <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="flex shrink-0 animate-marquee items-center gap-8 pr-8">
              {[...categories, ...categories].map((category, index) => {
                const Icon = categoryIcons[category.slug] ?? Gift;
                return (
                  <span
                    key={`${category.id}-${index}`}
                    className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-medium uppercase tracking-[0.18em] text-ink-soft"
                  >
                    <Icon className="size-3.5 text-rose" />
                    {category.name}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20">
        <AmbientBackground variant="soft" />
        <div className="container-page">
          <Reveal>
            <SectionHeading
              eyebrow="For every moment"
              title="Some feelings deserve more than a text."
              description="Start with the occasion. Heartly gives you a thoughtful canvas for birthdays, love, friendship, gratitude, and the moments in between."
              action={
                <Button asChild variant="outline" className="bg-white/60 backdrop-blur">
                  <Link href="/categories">
                    All categories <ArrowRight />
                  </Link>
                </Button>
              }
            />
          </Reveal>

          <RevealGroup className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.slice(0, 12).map((category) => {
              const Icon = categoryIcons[category.slug] ?? Gift;
              const count = templates.filter(
                (template) => template.category_id === category.id,
              ).length;
              return (
                <RevealItem key={category.id}>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line/80 bg-white/70 p-1.5 transition hover:-translate-y-1 hover:border-rose/30 hover:shadow-soft"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[1.15rem]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          category.thumbnail_url ??
                          `/api/template-art/${templates.find((template) => template.category_id === category.id)?.slug ?? "birthday-blush"}`
                        }
                        alt=""
                        className="size-full object-cover transition duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-plum/35 via-transparent to-transparent" />
                      <span className="absolute left-2.5 top-2.5 flex size-8 items-center justify-center rounded-xl bg-white/85 text-rose backdrop-blur transition group-hover:bg-rose group-hover:text-white">
                        <Icon className="size-4" />
                      </span>
                      {category.is_premium ? (
                        <span className="absolute right-2.5 top-2.5 rounded-full bg-plum/85 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                          Premium
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-1 items-end justify-between gap-2 px-2 pb-2 pt-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-plum">
                          {category.name}
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                          {count} {count === 1 ? "design" : "designs"}
                        </p>
                      </div>
                      <ArrowRight className="size-4 shrink-0 text-rose transition group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </section>

      <section className="border-y border-line/70 bg-white/40 py-20">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              eyebrow="Start with a design"
              title="Templates that already feel like something."
              description="Every template is a starting point with its own motion, palette and personality. Change the words, colours, and feeling until it sounds like you."
              action={
                <Button asChild variant="outline">
                  <Link href="/explore">
                    Explore all templates <ArrowRight />
                  </Link>
                </Button>
              }
            />
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((template, index) => (
              <Reveal key={template.id} delay={index * 0.04}>
                <TemplateCard
                  template={template}
                  categories={categories}
                  className="h-full"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20">
        <AmbientBackground variant="night" />
        <div className="container-page text-white">
          <Reveal>
            <div className="max-w-2xl">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-petal">
                <Sparkles className="size-3.5" /> Three small steps
              </p>
              <h2 className="text-balance text-3xl leading-tight sm:text-4xl">
                From &ldquo;I should do something&rdquo; to &ldquo;I just sent
                it.&rdquo;
              </h2>
              <p className="mt-4 text-pretty text-base leading-relaxed text-white/70">
                Heartly is built for the moments when you want to say something
                meaningful but do not have hours to design it.
              </p>
            </div>
          </Reveal>
          <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3" stagger={0.12}>
            {steps.map((step, index) => (
              <RevealItem key={step.title}>
                <div className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur transition hover:-translate-y-1 hover:border-petal/30 hover:bg-white/[0.09]">
                  <span className="font-display text-5xl text-petal/40">
                    0{index + 1}
                  </span>
                  <span className="mt-6 flex size-10 items-center justify-center rounded-xl bg-white/10 text-petal">
                    <step.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-display text-2xl">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">
                    {step.body}
                  </p>
                  <span className="pointer-events-none absolute -right-10 -top-10 size-24 rounded-full bg-rose/20 blur-2xl transition group-hover:bg-rose/30" />
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
          <div className="mt-10">
            <Button asChild size="lg" variant="secondary">
              <Link href="/create">
                Start your first gift <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              eyebrow="Why Heartly"
              title="The thoughtfulness of a handmade gift. The ease of a link."
              align="center"
            />
          </Reveal>
          <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <RevealItem key={feature.title}>
                <div className="group h-full rounded-3xl border border-line bg-white/70 p-6 transition hover:-translate-y-1 hover:border-rose/25 hover:shadow-soft">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-blush text-rose transition group-hover:bg-rose group-hover:text-white">
                    <feature.icon className="size-5" />
                  </span>
                  <h3 className="mt-5 font-display text-xl text-plum">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {feature.body}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-line/70 py-20">
        <AmbientBackground variant="petals" />
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
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
          </Reveal>
          <Reveal delay={0.1}>
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
                  className="flex items-center gap-3 rounded-2xl border border-line bg-white/75 px-4 py-3 text-sm text-ink backdrop-blur transition hover:-translate-y-0.5 hover:border-rose/30"
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-rose/10 text-rose">
                    <Check className="size-3.5" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.5rem] border border-line bg-gradient-to-br from-blush via-cream to-petal/60 px-6 py-14 text-center sm:px-14">
              <div className="pointer-events-none absolute -left-10 -top-10 size-40 rounded-full bg-white/60 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-12 -right-8 size-48 rounded-full bg-rose/10 blur-2xl" />
              <div className="pointer-events-none absolute inset-0 bg-grain opacity-50" />
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
                <Button asChild size="lg" variant="outline" className="bg-white/60 backdrop-blur">
                  <Link href="/explore">
                    <Globe2 /> Browse the gallery
                  </Link>
                </Button>
              </div>
              <p className="relative mt-8 text-[11px] uppercase tracking-[0.2em] text-ink-soft/70">
                {categories.length} occasions · {templates.length} designs · made personal
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
