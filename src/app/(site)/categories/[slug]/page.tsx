import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { AmbientBackground } from "@/components/site/ambient-background";
import { Reveal, RevealGroup, RevealItem } from "@/components/site/reveal";
import { TemplateCard } from "@/components/templates/template-card";
import { categoryIcons } from "@/components/templates/template-art";
import { Button } from "@/components/ui/button";
import { getCatalogue } from "@/lib/templates/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { categories } = await getCatalogue();
  const category = categories.find((row) => row.slug === slug);
  if (!category) return { title: "Category not found" };
  return {
    title: `${category.name} templates`,
    description: category.description,
    alternates: { canonical: `/categories/${category.slug}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { categories, templates } = await getCatalogue();
  const category = categories.find((row) => row.slug === slug);
  if (!category) notFound();
  const categoryTemplates = templates.filter(
    (template) => template.category_id === category.id,
  );
  const Icon = categoryIcons[category.slug] ?? Sparkles;
  const animations = Array.from(
    new Set(
      categoryTemplates.flatMap((template) =>
        template.animation_config?.type ? [template.animation_config.type] : [],
      ),
    ),
  );

  return (
    <>
      <section className="relative overflow-hidden py-12 sm:py-16">
        <AmbientBackground variant="hero" />
        <div className="container-page">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href="/categories">
              <ArrowLeft /> All categories
            </Link>
          </Button>
          <div className="mt-6 grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal>
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-rose/20 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose">
                  <Icon className="size-3.5" />
                  {categoryTemplates.length}{" "}
                  {categoryTemplates.length === 1 ? "design" : "designs"}
                </p>
                <h1 className="mt-4 text-balance text-4xl leading-tight text-plum sm:text-5xl">
                  {category.name}
                </h1>
                <p className="mt-4 text-pretty text-lg leading-relaxed text-ink-soft">
                  {category.description}
                </p>
                {animations.length ? (
                  <div className="mt-5 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-medium text-ink-soft">
                      Motion:
                    </span>
                    {animations.slice(0, 6).map((type) => (
                      <span
                        key={type}
                        className="rounded-full bg-blush/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-plum"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="relative mx-auto w-full max-w-md">
                <div className="absolute -inset-4 rounded-[2.25rem] bg-gradient-to-br from-rose/20 via-blush/40 to-peach/30 blur-2xl" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/60 p-2 shadow-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      category.thumbnail_url ??
                      categoryTemplates[0]?.preview_url ??
                      "/api/template-art/birthday-blush"
                    }
                    alt=""
                    className="aspect-[4/3] w-full rounded-[1.6rem] object-cover"
                  />
                  <div className="absolute inset-x-5 bottom-5 flex items-center justify-between rounded-2xl border border-white/40 bg-plum/65 px-4 py-3 text-white backdrop-blur">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] opacity-75">
                        Collection
                      </p>
                      <p className="font-display text-lg leading-tight">
                        {category.name}
                      </p>
                    </div>
                    <Sparkles className="size-5 text-peach" />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden pb-20">
        <AmbientBackground variant="soft" />
        <div className="container-page">
          {categoryTemplates.length ? (
            <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categoryTemplates.map((template) => (
                <RevealItem key={template.id}>
                  <TemplateCard
                    template={template}
                    categories={categories}
                  />
                </RevealItem>
              ))}
            </RevealGroup>
          ) : (
            <div className="rounded-3xl border border-line bg-white/60 px-6 py-14 text-center">
              <Sparkles className="mx-auto size-7 text-rose" />
              <p className="mt-3 font-display text-xl text-plum">
                Make this collection your own.
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
                Start with a blank keepsake and add your own words, photos, and
                colours. Your page will still open with the same beautiful motion.
              </p>
              <Button asChild className="mt-6">
                <Link href="/create">
                  Start a keepsake <ArrowRight />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
