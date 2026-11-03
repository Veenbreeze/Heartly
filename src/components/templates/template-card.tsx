import Link from "next/link";
import { Crown, Lock, Sparkles, Zap } from "lucide-react";
import { TemplateArt } from "@/components/templates/template-art";
import { Badge } from "@/components/ui/badge";
import { findCategory } from "@/lib/templates/catalog";
import type { Category, Template } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  template: Template;
  categories: Category[];
  className?: string;
  locked?: boolean;
}

export function TemplateCard({
  template,
  categories,
  className,
  locked,
}: TemplateCardProps) {
  const category = findCategory(categories, template.category_id);
  const animation = template.animation_config?.type;
  const isAnimated = animation && animation !== "none";
  return (
    <Link
      href={`/create?template=${template.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-line/80 bg-white shadow-[0_12px_36px_-26px_rgba(65,39,58,0.48)] transition-all duration-500 hover:-translate-y-1.5 hover:border-rose/40 hover:shadow-lift",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-blush/40">
        <TemplateArt
          template={template}
          categorySlug={category?.slug}
          className="transition duration-700 group-hover:scale-[1.06] group-hover:rotate-[0.5deg]"
        />
        <span className="pointer-events-none absolute inset-0 -translate-x-[130%] bg-gradient-to-r from-transparent via-white/40 to-transparent transition duration-1000 group-hover:translate-x-[130%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-plum/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute right-3 top-3 flex gap-1.5">
          {template.is_premium ? (
            <Badge variant="premium" className="shadow-md backdrop-blur-sm">
              <Crown /> Premium
            </Badge>
          ) : null}
          {isAnimated ? (
            <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-rose shadow-sm backdrop-blur-sm">
              <Zap className="size-2.5" /> Animated
            </span>
          ) : null}
          {locked ? (
            <span className="flex size-7 items-center justify-center rounded-full bg-white/90 text-plum shadow-sm backdrop-blur-sm">
              <Lock className="size-3" />
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-line/50 px-4 py-4">
        <div className="min-w-0">
          <p className="truncate font-semibold text-plum transition-colors group-hover:text-rose">{template.name}</p>
          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-ink-soft">
            <Sparkles className="size-3 shrink-0 text-rose" />
            {category?.name ?? "Digital gift"}
            {animation && animation !== "none" ? ` • ${animation}` : ""}
          </p>
        </div>
        <span className="shrink-0 flex items-center gap-1 text-xs font-medium text-rose transition-all group-hover:translate-x-1">
          Make it yours
        </span>
      </div>
    </Link>
  );
}
