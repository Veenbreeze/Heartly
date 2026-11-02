import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
    <div className="container-page py-14">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose">
          Browse by moment
        </p>
        <h1 className="mt-3 text-balance text-4xl leading-tight text-plum sm:text-5xl">
          What are you celebrating?
        </h1>
        <p className="mt-4 text-pretty text-lg leading-relaxed text-ink-soft">
          Choose the occasion, and we will show you designs that already know
          what to say.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = categoryIcons[category.slug] ?? ArrowRight;
          const count = templates.filter(
            (template) => template.category_id === category.id,
          ).length;
          return (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative overflow-hidden rounded-3xl border border-line bg-white/70 p-6 transition hover:-translate-y-1 hover:border-rose/30 hover:shadow-soft"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-blush text-rose transition group-hover:bg-rose group-hover:text-white">
                  <Icon className="size-5" />
                </span>
                {category.is_premium ? <Badge variant="premium">Premium</Badge> : null}
              </div>
              <h2 className="mt-5 font-display text-2xl text-plum">{category.name}</h2>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                {category.description}
              </p>
              <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-rose">
                {count} {count === 1 ? "template" : "templates"}
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
