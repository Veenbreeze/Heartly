import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { AmbientBackground } from "@/components/site/ambient-background";
import { Reveal, RevealGroup, RevealItem } from "@/components/site/reveal";
import { categoryIcons } from "@/components/templates/template-art";
import { Badge } from "@/components/ui/badge";
import { getCatalogue } from "@/lib/templates/data";

export const metadata: Metadata = {
  title: "Gift categories",
  description:
    "Browse digital gift categories on Heartly: birthdays, love, friendship, gratitude, date invitations, surprises, and custom keepsakes.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const { categories, templates } = await getCatalogue();

  return (
    <>
      <section className="relative overflow-hidden py-16 sm:py-20">
        <AmbientBackground variant="hero" />
        <div className="container-page">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose">
                Browse by moment
              </p>
              <h1 className="mt-3 text-balance text-4xl leading-tight text-plum sm:text-5xl">
                What are you celebrating?
              </h1>
              <p className="mt-4 text-pretty text-lg leading-relaxed text-ink-soft">
                Choose the occasion, and we will show you designs that already
                know what to say. Every collection has its own colours, motion,
                and mood.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden pb-20">
        <AmbientBackground variant="soft" />
        <div className="container-page">
          <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => {
              const Icon = categoryIcons[category.slug] ?? Sparkles;
              const categoryTemplates = templates.filter(
                (template) => template.category_id === category.id,
              );
              const count = categoryTemplates.length;
              const lead = categoryTemplates[0];
              return (
                <RevealItem key={category.id}>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-line bg-white/70 p-1.5 transition hover:-translate-y-1 hover:border-rose/30 hover:shadow-soft"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden rounded-[1.35rem]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          category.thumbnail_url ??
                          lead?.preview_url ??
                          "/api/template-art/birthday-blush"
                        }
                        alt=""
                        className="size-full object-cover transition duration-700 group-hover:scale-105"
                        loading={index < 3 ? "eager" : "lazy"}
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-plum/45 via-plum/5 to-transparent" />
                      <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 text-white">
                        <div>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] backdrop-blur">
                            <Icon className="size-3" /> {count}{" "}
                            {count === 1 ? "design" : "designs"}
                          </span>
                          <h2 className="mt-2 font-display text-2xl leading-tight drop-shadow-sm">
                            {category.name}
                          </h2>
                        </div>
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/85 text-rose transition group-hover:bg-rose group-hover:text-white">
                          <ArrowRight className="size-4" />
                        </span>
                      </div>
                      {category.is_premium ? (
                        <Badge
                          variant="premium"
                          className="absolute right-3 top-3 border-white/20 bg-plum/75 backdrop-blur"
                        >
                          Premium
                        </Badge>
                      ) : null}
                    </div>
                    <div className="px-3 pb-2 pt-3">
                      <p className="line-clamp-2 text-sm leading-relaxed text-ink-soft">
                        {category.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {Array.from(
                          new Set(
                            categoryTemplates.flatMap((template) =>
                              template.animation_config?.type
                                ? [template.animation_config.type]
                                : [],
                            ),
                          ),
                        )
                          .slice(0, 3)
                          .map((type) => (
                            <span
                              key={type}
                              className="rounded-full bg-blush/70 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-plum"
                            >
                              {type}
                            </span>
                          ))}
                      </div>
                    </div>
                  </Link>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </section>
    </>
  );
}
