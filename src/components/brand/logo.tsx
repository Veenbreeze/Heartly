import Link from "next/link";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "default" | "lg";
}

const sizes = {
  sm: { mark: "size-8", icon: "size-4", text: "text-lg" },
  default: { mark: "size-10", icon: "size-5", text: "text-xl" },
  lg: { mark: "size-12", icon: "size-6", text: "text-2xl" },
};

export function Logo({
  href = "/",
  className,
  showWordmark = true,
  size = "default",
}: LogoProps) {
  const style = sizes[size];
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose to-plum text-white shadow-[0_10px_24px_-12px_rgba(232,93,117,0.9)]",
          style.mark,
        )}
      >
        <Heart className={cn("fill-white/20", style.icon)} strokeWidth={2.2} />
        <span className="absolute -right-1 -top-1 size-2 rounded-full bg-petal ring-2 ring-cream" />
      </span>
      {showWordmark ? (
        <span
          className={cn(
            "font-display font-semibold tracking-tight text-plum",
            style.text,
          )}
        >
          Heartly
        </span>
      ) : null}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} aria-label="Heartly home" className="inline-flex">
      {content}
    </Link>
  );
}
