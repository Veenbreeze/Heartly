import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { TemplateCard } from "@/components/templates/template-card";
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

  return (
    <div className="container-page py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/categories">
          <ArrowLeft /> All categories
        </Link>
      </Button>
      <div className="mt-6 max-w-2xl">
        <h1 className="text-balance text-4xl leading-tight text-plum sm:text-5xl">
          {category.name}
        </h1>
        <p className="mt-4 text-pretty text-lg leading-relaxed text-ink-soft">
          {category.description}
        </p>
      </div>

      {categoryTemplates.length ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categoryTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              categories={categories}
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-3xl border border-dashed border-petal bg-white/50 px-6 py-16 text-center">
          <p className="font-display text-xl text-plum">
            New templates are on the way.
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            In the meantime, a blank keepsake gives you a completely open canvas.
          </p>
          <Button asChild className="mt-6">
            <Link href="/create">
              Start from scratch <ArrowRight />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
