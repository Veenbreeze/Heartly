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
import type { AnimationType } from "@/lib/gift/schema";
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

function pseudo(index: number, salt: number) {
  return ((index * 9301 + salt * 49297) % 233280) / 233280;
}

function TemplateMotion({
  type,
  accent,
}: {
  type: AnimationType | undefined;
  accent: string;
}) {
  if (!type || type === "none" || type === "fade") return null;
  const count = type === "waves" || type === "candles" ? 9 : 11;
  const items = Array.from({ length: count }, (_, index) => index);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {type === "hearts" || type === "butterflies"
        ? items.map((index) => (
            <Heart
              key={index}
              className="absolute fill-current opacity-0"
              style={{
                left: `${pseudo(index, 1) * 92}%`,
                bottom: "-8%",
                color: accent,
                width: `${6 + pseudo(index, 2) * 10}px`,
                transform: `rotate(${pseudo(index, 3) * 60 - 30}deg)`,
                animation:
                  type === "butterflies"
                    ? `flutter ${8 + pseudo(index, 4) * 8}s linear ${pseudo(index, 5) * 7}s infinite`
                    : `rise ${8 + pseudo(index, 4) * 8}s linear ${pseudo(index, 5) * 7}s infinite`,
              }}
            />
          ))
        : null}

      {type === "petals"
        ? items.map((index) => (
            <span
              key={index}
              className="absolute opacity-0"
              style={{
                left: `${pseudo(index, 6) * 94}%`,
                top: "-10%",
                width: `${6 + pseudo(index, 7) * 9}px`,
                height: `${4 + pseudo(index, 8) * 6}px`,
                borderRadius: "60% 40% 55% 45%",
                background: accent,
                animation: `drift ${9 + pseudo(index, 9) * 8}s linear ${pseudo(index, 10) * 8}s infinite`,
              }}
            />
          ))
        : null}

      {type === "stars" || type === "sparkles"
        ? items.map((index) => {
            const Icon = type === "stars" ? Star : Sparkles;
            return (
              <Icon
                key={index}
                className="absolute"
                style={{
                  left: `${pseudo(index, 11) * 92}%`,
                  top: `${pseudo(index, 12) * 82}%`,
                  color: accent,
                  width: `${5 + pseudo(index, 13) * 9}px`,
                  opacity: 0.55,
                  animation: `twinkle ${2.4 + pseudo(index, 14) * 3}s ease-in-out ${pseudo(index, 15) * 3}s infinite`,
                }}
              />
            );
          })
        : null}

      {type === "confetti"
        ? items.map((index) => (
            <span
              key={index}
              className="absolute top-0"
              style={{
                left: `${pseudo(index, 16) * 94}%`,
                width: `${3 + pseudo(index, 17) * 4}px`,
                height: `${5 + pseudo(index, 18) * 5}px`,
                borderRadius: index % 2 ? "50%" : "1px",
                background: index % 3 === 0 ? accent : "#fff",
                opacity: 0.8,
                animation: `fall ${4.5 + pseudo(index, 19) * 5}s linear ${pseudo(index, 20) * 5}s infinite`,
              }}
            />
          ))
        : null}

      {type === "bubbles"
        ? items.map((index) => (
            <span
              key={index}
              className="absolute rounded-full border opacity-0"
              style={{
                left: `${pseudo(index, 21) * 92}%`,
                bottom: "-10%",
                width: `${8 + pseudo(index, 22) * 16}px`,
                height: `${8 + pseudo(index, 22) * 16}px`,
                borderColor: accent,
                background: `${accent}22`,
                animation: `bubble ${8 + pseudo(index, 23) * 8}s linear ${pseudo(index, 24) * 8}s infinite`,
              }}
            />
          ))
        : null}

      {type === "snow"
        ? items.map((index) => (
            <span
              key={index}
              className="absolute rounded-full bg-white opacity-0"
              style={{
                left: `${pseudo(index, 25) * 94}%`,
                top: "-8%",
                width: `${3 + pseudo(index, 26) * 5}px`,
                height: `${3 + pseudo(index, 26) * 5}px`,
                animation: `snowfall ${7 + pseudo(index, 27) * 7}s linear ${pseudo(index, 28) * 7}s infinite`,
              }}
            />
          ))
        : null}

      {type === "float"
        ? items.slice(0, 4).map((index) => (
            <span
              key={index}
              className="absolute rounded-full opacity-25 blur-xl"
              style={{
                left: `${12 + pseudo(index, 29) * 76}%`,
                top: `${12 + pseudo(index, 30) * 66}%`,
                width: `${38 + pseudo(index, 31) * 54}px`,
                height: `${38 + pseudo(index, 31) * 54}px`,
                background: accent,
                animation: `float ${6 + pseudo(index, 32) * 4}s ease-in-out ${pseudo(index, 33) * 3}s infinite`,
              }}
            />
          ))
        : null}

      {type === "waves" ? (
        <svg
          className="absolute inset-x-0 bottom-0 h-16 w-[200%] opacity-35"
          style={{ animation: "wave 12s linear infinite" }}
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60 C 240 16 480 104 720 60 C 960 16 1200 104 1440 60 L1440 120 L0 120 Z"
            fill={accent}
          />
        </svg>
      ) : null}

      {type === "candles"
        ? items.slice(0, 7).map((index) => (
            <span
              key={index}
              className="absolute bottom-2 flex flex-col items-center"
              style={{ left: `${8 + index * 12}%` }}
            >
              <span
                className="mb-0.5 block size-1.5 rounded-full"
                style={{
                  background: accent,
                  boxShadow: `0 0 10px 4px ${accent}66`,
                  animation: `flicker ${1.3 + pseudo(index, 34) * 1.2}s ease-in-out infinite`,
                }}
              />
              <span className="block h-5 w-1 rounded-sm bg-white/50" />
            </span>
          ))
        : null}
    </div>
  );
}

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
  const animation = template.animation_config?.type as AnimationType | undefined;
  const imageGroup = categorySlug === "birthday-cards" || categorySlug === "celebration-cards"
    ? "celebration"
    : categorySlug === "friendship-cards"
      ? "friends"
      : categorySlug === "dinner-date-invitations"
        ? "dinner"
        : categorySlug === "beach-date-invitations" || categorySlug === "anniversary"
          ? "sunset"
          : categorySlug === "love-letters" || categorySlug === "valentines-day"
            ? "floral"
            : "keepsake";
  const photoImages: Record<string, string> = {
    celebration: "/images/editorial/birthday-cake.jpg",
    friends: "/images/editorial/friends-celebrating.jpg",
    dinner: "/images/editorial/candlelit-dinner.jpg",
    sunset: "/images/editorial/couple-sunset.jpg",
    floral: "/images/editorial/letter-flower.jpg",
    keepsake: "/images/editorial/letter-flower.jpg",
  };

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
        aria-hidden
        className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url('${photoImages[imageGroup]}')` }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-soft-light"
        style={{ backgroundImage: `url('/backgrounds/templates/${imageGroup === "friends" || imageGroup === "dinner" ? "keepsake" : imageGroup}.svg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-white/30" />
      <div
        className="absolute -right-10 -top-10 size-36 rounded-full opacity-40 blur-2xl"
        style={{ background: palette.accent }}
      />
      <div
        className="absolute -bottom-12 -left-8 size-32 rounded-full opacity-30 blur-2xl"
        style={{ background: palette.accent }}
      />
      <div
        className="absolute inset-4 rounded-[1.35rem] border opacity-20"
        style={{ borderColor: palette.accent }}
      />
      <TemplateMotion type={animation} accent={palette.accent} />
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
        <span className="flex items-center gap-1.5 rounded-full bg-white/55 px-2 py-0.5 backdrop-blur">
          <Sparkles className="size-2.5" style={{ color: palette.accent }} />
          {animation && animation !== "none" ? animation : "still"}
        </span>
      </div>
    </div>
  );
}
