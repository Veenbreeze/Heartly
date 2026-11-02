import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
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

  return (
    <div className="container-page py-14">
      <div className="max-w-2xl">
        <Badge variant="outline" className="mb-4 border-petal bg-white/70">
          <Sparkles className="text-rose" /> The template gallery
        </Badge>
        <h1 className="text-balance text-4xl leading-tight text-plum sm:text-5xl">
          Find the right way to say it.
        </h1>
        <p className="mt-4 text-pretty text-lg leading-relaxed text-ink-soft">
          Every template is fully editable. Pick one that feels close, then make
          it completely yours.
        </p>
      </div>
      <div className="mt-10">
        <TemplateGallery
          categories={categories}
          templates={templates}
          initialCategory={initialCategory}
        />
      </div>
    </div>
  );
}
