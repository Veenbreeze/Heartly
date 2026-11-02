import Link from "next/link";
import { Crown, Lock } from "lucide-react";
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
  return (
    <Link
      href={`/create?template=${template.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl border border-line bg-white/80 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <TemplateArt
          template={template}
          categorySlug={category?.slug}
          className="transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute right-3 top-3 flex gap-1.5">
          {template.is_premium ? (
            <Badge variant="premium">
              <Crown /> Premium
            </Badge>
          ) : null}
          {locked ? (
            <span className="flex size-6 items-center justify-center rounded-full bg-white/80 text-plum">
              <Lock className="size-3" />
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate font-medium text-plum">{template.name}</p>
          <p className="truncate text-xs text-ink-soft">
            {category?.name ?? "Digital gift"}
          </p>
        </div>
        <span className="text-xs font-medium text-rose transition group-hover:translate-x-0.5">
          Use
        </span>
      </div>
    </Link>
  );
}
