"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { TemplateCard } from "@/components/templates/template-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Category, Template } from "@/lib/types";

interface TemplateGalleryProps {
  categories: Category[];
  templates: Template[];
  initialCategory?: string;
}

export function TemplateGallery({
  categories,
  templates,
  initialCategory,
}: TemplateGalleryProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory ?? "all");
  const [tier, setTier] = useState<"all" | "free" | "premium">("all");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return templates.filter((template) => {
      if (category !== "all") {
        const categoryRow = categories.find((row) => row.slug === category);
        if (!categoryRow || template.category_id !== categoryRow.id) return false;
      }
      if (tier === "free" && template.is_premium) return false;
      if (tier === "premium" && !template.is_premium) return false;
      if (!needle) return true;
      const categoryName =
        categories.find((row) => row.id === template.category_id)?.name ?? "";
      return `${template.name} ${template.description} ${template.template_type} ${categoryName}`
        .toLowerCase()
        .includes(needle);
    });
  }, [categories, category, query, templates, tier]);

  const hasFilters = query !== "" || category !== "all" || tier !== "all";

  function reset() {
    setQuery("");
    setCategory("all");
    setTier("all");
  }

  return (
    <div>
      <div className="rounded-3xl border border-line bg-white/70 p-4 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-soft/60" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by feeling, occasion, or template"
              className="pl-10"
              aria-label="Search templates"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-ink-soft hover:bg-blush"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="hidden size-4 text-ink-soft sm:block" />
            <div className="flex rounded-full bg-blush/70 p-1">
              {(["all", "free", "premium"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTier(value)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition",
                    tier === value
                      ? "bg-white text-plum shadow-sm"
                      : "text-ink-soft hover:text-plum",
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={cn(
              "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
              category === "all"
                ? "border-plum bg-plum text-white"
                : "border-line bg-white text-ink-soft hover:border-rose/40 hover:text-plum",
            )}
          >
            All categories
          </button>
          {categories.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setCategory(row.slug)}
              className={cn(
                "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                category === row.slug
                  ? "border-plum bg-plum text-white"
                  : "border-line bg-white text-ink-soft hover:border-rose/40 hover:text-plum",
              )}
            >
              {row.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-ink-soft">
          {filtered.length} {filtered.length === 1 ? "template" : "templates"}
        </p>
        {hasFilters ? (
          <Button variant="ghost" size="sm" onClick={reset}>
            Clear filters <X />
          </Button>
        ) : null}
      </div>

      {filtered.length ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              categories={categories}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-3xl border border-dashed border-petal bg-white/50 px-6 py-16 text-center">
          <p className="font-display text-xl text-plum">No templates match that yet.</p>
          <p className="mt-2 text-sm text-ink-soft">
            Try another word, or start from a blank keepsake.
          </p>
          <Button className="mt-6" variant="outline" onClick={reset}>
            Show every template
          </Button>
        </div>
      )}
    </div>
  );
}
