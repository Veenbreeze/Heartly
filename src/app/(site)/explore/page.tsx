import type { Metadata } from "next";
import { ArrowDown, Layers, Sparkles, Wand2 } from "lucide-react";
import { AmbientBackground } from "@/components/site/ambient-background";
import { Reveal } from "@/components/site/reveal";
import { TemplateGallery } from "@/components/templates/template-gallery";
import { Badge } from "@/components/ui/badge";
import { getCatalogue } from "@/lib/templates/data";

export const metadata: Metadata = {
  title: "Explore digital gift templates",
  description:
    "Browse Heartly templates for birthdays, love letters, anniversaries, date invitations, questions, surprises, and more.",
  alternates: { canonical: "/explore" },
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [{ categories, templates }, params] = await Promise.all([
    getCatalogue(),
    searchParams,
  ]);
  const initialCategory = params.category
    ? categories.find((category) => category.slug === params.category)?.slug
    : undefined;
  const animated = templates.filter(
    (template) =>
      template.animation_config?.type && template.animation_config.type !== "none",
  ).length;

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line/60 bg-[#281d2a] py-16 text-white sm:py-24">
        <div aria-hidden className="absolute inset-0 -z-10 bg-cover bg-center opacity-80" style={{ backgroundImage: "url('/images/editorial/letter-flower.jpg')" }} />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-[#211923] via-[#2a1c2a]/80 to-[#382537]/35" />
        <div className="container-page">
          <Reveal>
            <div className="max-w-3xl">
              <Badge variant="outline" className="mb-5 border-white/20 bg-white/10 text-white backdrop-blur">
                <Sparkles className="text-petal" /> Made for your kind of moment
              </Badge>
              <h1 className="max-w-2xl text-balance text-5xl leading-[1.04] tracking-tight text-white sm:text-6xl">
                Find the words.<br /><span className="text-[#f2b6bf]">Make it a moment.</span>
              </h1>
              <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/75 sm:text-lg">
                Thoughtful, ready to personalise gifts for the people who make life feel like more.
              </p>
              <div className="mt-7 flex flex-wrap gap-2 text-sm text-white/85">
                {[
                  { icon: Layers, label: `${templates.length} designs` },
                  { icon: Wand2, label: `${animated} with motion` },
                  { icon: Sparkles, label: `${categories.length} occasions` },
                ].map((item) => <span key={item.label} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 backdrop-blur"><item.icon className="size-4 text-[#f2b6bf]" />{item.label}</span>)}
              </div>
              <a href="#gallery" className="mt-9 inline-flex items-center gap-2 text-sm font-medium text-white transition hover:text-[#f2b6bf]">
                Explore the collection <ArrowDown className="size-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden pb-20">
        <AmbientBackground variant="soft" />
        <div id="gallery" className="container-page scroll-mt-28">
          <TemplateGallery
            categories={categories}
            templates={templates}
            initialCategory={initialCategory}
          />
        </div>
      </section>
    </>
  );
}
