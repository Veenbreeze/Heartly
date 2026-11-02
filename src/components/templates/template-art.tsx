import {
  Cake,
  Calendar,
  Gift,
  Heart,
  HelpCircle,
  Palette,
  PartyPopper,
  Sparkles,
  Star,
  Users,
  Utensils,
  Waves,
  type LucideIcon,
} from "lucide-react";
import type { Template } from "@/lib/types";
import { templateArtPalette } from "@/lib/templates/catalog";
import { cn } from "@/lib/utils";

export const categoryIcons: Record<string, LucideIcon> = {
  "birthday-cards": Cake,
  "love-letters": Heart,
  anniversary: Calendar,
  "dinner-date-invitations": Utensils,
  "beach-date-invitations": Waves,
  "friendship-cards": Users,
  "appreciation-cards": Sparkles,
  "valentines-day": Heart,
  "special-questions": HelpCircle,
  "interactive-surprises": Gift,
  "celebration-cards": PartyPopper,
  "custom-experiences": Palette,
};

interface TemplateArtProps {
  template: Template;
  className?: string;
  categorySlug?: string;
  compact?: boolean;
}

export function TemplateArt({
  template,
  className,
  categorySlug,
  compact,
}: TemplateArtProps) {
  const palette = templateArtPalette(template);
  const Icon = categoryIcons[categorySlug ?? ""] ?? Star;
  const content = template.default_content as { title?: string };

  return (
    <div
      className={cn(
        "relative isolate flex size-full flex-col justify-between overflow-hidden p-5",
        className,
      )}
      style={{
        background: `linear-gradient(145deg, ${palette.background} 0%, ${palette.secondary} 55%, ${palette.background} 100%)`,
        color: palette.text,
      }}
    >
      <div
        className="absolute -right-10 -top-10 size-36 rounded-full opacity-40 blur-2xl"
        style={{ background: palette.accent }}
      />
      <div
        className="absolute -bottom-12 -left-8 size-32 rounded-full opacity-30 blur-2xl"
        style={{ background: palette.accent }}
      />
      <div className="relative flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/65 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] backdrop-blur">
          <Icon className="size-3" style={{ color: palette.accent }} />
          {template.template_type.replaceAll("_", " ")}
        </span>
        <Heart
          className="size-4 fill-current opacity-70"
          style={{ color: palette.accent }}
        />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center py-4 text-center">
        <span
          className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-white/70 shadow-sm backdrop-blur"
          style={{ color: palette.accent }}
        >
          <Icon className={compact ? "size-5" : "size-6"} strokeWidth={1.6} />
        </span>
        <p
          className={cn(
            "font-display leading-tight",
            compact ? "text-base" : "text-xl",
          )}
        >
          {content.title ?? template.name}
        </p>
        {!compact ? (
          <p className="mt-1.5 line-clamp-2 max-w-[16rem] text-[11px] leading-relaxed opacity-70">
            {template.description}
          </p>
        ) : null}
      </div>

      <div className="relative flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.18em] opacity-60">
        <span>Heartly</span>
        <span className="flex gap-1">
          <span className="size-1.5 rounded-full bg-current" />
          <span className="size-1.5 rounded-full bg-current opacity-60" />
          <span className="size-1.5 rounded-full bg-current opacity-30" />
        </span>
      </div>
    </div>
  );
}
