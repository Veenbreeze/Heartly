import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, Crown, Sparkles } from "lucide-react";
import { TemplateArt } from "@/components/templates/template-art";
import { TemplateCard } from "@/components/templates/template-card";
import { CreateGiftForm } from "@/components/studio/create-gift-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { findCategory, findTemplate } from "@/lib/templates/catalog";
import { getCatalogue } from "@/lib/templates/data";
import { isSupabaseAdminConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Create a digital gift",
  description:
    "Choose a Heartly template and create a personal digital gift with photos, music, and your own words.",
  alternates: { canonical: "/create" },
};

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const [{ categories, templates }, params] = await Promise.all([
    getCatalogue(),
    searchParams,
  ]);
  const selected = params.template
    ? findTemplate(templates, params.template)
    : undefined;
  const configured = isSupabaseAdminConfigured();

  if (selected) {
    const category = findCategory(categories, selected.category_id);
    return (
      <div className="container-page py-10">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/create">
            <ArrowLeft /> All templates
          </Link>
        </Button>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-lift">
            <div className="aspect-[4/5] max-h-[560px]">
              <TemplateArt template={selected} categorySlug={category?.slug} />
            </div>
          </div>
          <div className="lg:sticky lg:top-28">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{category?.name ?? "Digital gift"}</Badge>
              {selected.is_premium ? (
                <Badge variant="premium">
                  <Crown /> Premium
                </Badge>
              ) : (
                <Badge variant="success">Free template</Badge>
              )}
            </div>
            <h1 className="mt-4 text-balance text-4xl leading-tight text-plum sm:text-5xl">
              {selected.name}
            </h1>
            <p className="mt-3 text-pretty leading-relaxed text-ink-soft">
              {selected.description}
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-ink">
              {[
                "Fully editable words, colours, and photos",
                "Preview it exactly as they will see it",
                "Share one private link when you are ready",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-rose" />
                  {item}
                </li>
              ))}
            </ul>
            {!configured ? (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
                The studio needs Supabase to save drafts. You can still explore
                templates; add your project keys to enable creating.
              </div>
            ) : null}
            <div className="mt-7 rounded-3xl border border-line bg-white/70 p-5">
              <CreateGiftForm
                templateSlug={selected.slug}
                disabled={!configured}
              />
            </div>
            <p className="mt-4 text-center text-xs text-ink-soft">
              Want something else?{" "}
              <Link href="/create" className="underline hover:text-rose">
                Browse all templates
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-14">
      <div className="max-w-2xl">
        <Badge variant="outline" className="mb-4 border-petal bg-white/70">
          <Sparkles className="text-rose" /> Start a gift
        </Badge>
        <h1 className="text-balance text-4xl leading-tight text-plum sm:text-5xl">
          Pick a starting point.
        </h1>
        <p className="mt-4 text-pretty text-lg leading-relaxed text-ink-soft">
          Every design is a canvas. Choose one that feels close to the moment,
          then make it unmistakably yours.
        </p>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            categories={categories}
          />
        ))}
      </div>
    </div>
  );
}
