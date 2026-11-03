"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, Search, SlidersHorizontal, X } from "lucide-react";
import { TemplateCard } from "@/components/templates/template-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Category, Template } from "@/lib/types";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">The collection</p>
          <h2 className="mt-2 font-display text-3xl text-plum sm:text-4xl">A lovely place to start.</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">Choose a design, then add the little details that make it yours.</p>
        </div>
        <p className="hidden rounded-2xl border border-line/70 bg-white/75 px-4 py-3 text-sm text-ink-soft shadow-sm sm:block">Every design is made to be personalised <span className="ml-1 text-rose">✦</span></p>
      </div>

      <div className="rounded-[1.75rem] border border-line/80 bg-white/80 p-4 shadow-soft backdrop-blur sm:p-5">
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
                  aria-pressed={tier === value}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium capitalize transition",
                    tier === value
                      ? "bg-white text-plum shadow-sm ring-1 ring-line/70"
                      : "text-ink-soft hover:text-plum",
                  )}
                >
                  {value === "premium" ? <Crown className="size-3 text-amber-600" /> : null}
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
            aria-pressed={category === "all"}
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
              aria-pressed={category === row.slug}
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
          Showing <span className="font-semibold text-plum">{filtered.length}</span> {filtered.length === 1 ? "design" : "designs"}
        </p>
        {hasFilters ? (
          <Button variant="ghost" size="sm" onClick={reset}>
            Clear filters <X />
          </Button>
        ) : null}
      </div>

      {filtered.length ? (
        <motion.div
          layout
          className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((template) => (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <TemplateCard
                  template={template}
                  categories={categories}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
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
