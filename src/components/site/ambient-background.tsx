import { cn } from "@/lib/utils";

interface AmbientBackgroundProps {
  variant?: "hero" | "soft" | "petals" | "night" | "celebration" | "love";
  className?: string;
}

export function AmbientBackground({
  variant = "soft",
  className,
}: AmbientBackgroundProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      {variant === "hero" ? (
        <>
          <div className="absolute inset-0 bg-hero-aurora opacity-90" />
          <div className="absolute -left-32 top-0 size-[28rem] animate-float rounded-full bg-blush/70 blur-[120px]" />
          <div className="absolute -right-24 top-20 size-[32rem] animate-pulse-soft rounded-full bg-petal/60 blur-[140px]" />
          <div className="absolute left-1/2 top-40 size-[22rem] -translate-x-1/2 animate-zoom-in-out rounded-full bg-rose/15 blur-[100px]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose/25 to-transparent" />
          <div className="absolute inset-0 bg-grain opacity-40" />
        </>
      ) : null}

      {variant === "soft" ? (
        <>
          <div className="absolute inset-0 bg-petal-tile opacity-45" />
          <div className="absolute -left-32 top-0 size-[26rem] rounded-full bg-blush/70 blur-[110px]" />
          <div className="absolute -right-28 bottom-0 size-[30rem] rounded-full bg-petal/50 blur-[120px]" />
          <div className="absolute left-1/3 top-1/4 size-[18rem] animate-float rounded-full bg-rose/10 blur-[90px]" />
        </>
      ) : null}

      {variant === "petals" ? (
        <>
          <div className="absolute inset-0 bg-petal-tile opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-b from-cream/40 via-transparent to-cream" />
          <span className="absolute left-[12%] top-16 size-2 rounded-full bg-rose/40 animate-float" />
          <span className="absolute left-[68%] top-24 size-3 rounded-full bg-plum/25 animate-float [animation-delay:1s]" />
          <span className="absolute left-[42%] top-10 size-2.5 rounded-full bg-rose/35 animate-float [animation-delay:2s]" />
          <span className="absolute left-[24%] top-40 size-2 rounded-full bg-petal/60 animate-float [animation-delay:0.8s]" />
          <span className="absolute left-[78%] top-32 size-2.5 rounded-full bg-rose/25 animate-float [animation-delay:1.6s]" />
        </>
      ) : null}

      {variant === "night" ? (
        <>
          <div className="absolute inset-0 bg-starlight opacity-95" />
          <div className="absolute -left-24 top-10 size-80 animate-pulse-soft rounded-full bg-rose/25 blur-[110px]" />
          <div className="absolute -right-16 bottom-10 size-72 animate-pulse-soft rounded-full bg-peach/20 blur-[100px] [animation-delay:2s]" />
          <span className="absolute left-[18%] top-28 size-1 rounded-full bg-white/70 animate-pulse-soft" />
          <span className="absolute left-[62%] top-16 size-1 rounded-full bg-white/60 animate-pulse-soft [animation-delay:1s]" />
          <span className="absolute left-[36%] top-44 size-1 rounded-full bg-white/80 animate-pulse-soft [animation-delay:1.8s]" />
        </>
      ) : null}

      {variant === "celebration" ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-cream via-blush/40 to-petal/30" />
          <div className="absolute -left-28 top-0 size-[30rem] rounded-full bg-rose/20 blur-[130px] animate-float" />
          <div className="absolute -right-24 bottom-0 size-[28rem] rounded-full bg-gold/10 blur-[120px] animate-pulse-soft" />
          <span className="absolute left-[10%] top-20 h-2 w-2 rounded-full bg-rose/50 animate-bounce" />
          <span className="absolute left-[85%] top-16 h-1.5 w-1.5 rounded-full bg-plum/40 animate-bounce [animation-delay:0.4s]" />
          <span className="absolute left-[60%] top-36 h-2 w-2 rounded-full bg-peach/60 animate-bounce [animation-delay:0.8s]" />
          <div className="absolute inset-0 bg-grain opacity-30" />
        </>
      ) : null}

      {variant === "love" ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-cream via-rose/10 to-blush/30" />
          <div className="absolute -left-24 top-10 size-[26rem] rounded-full bg-rose/25 blur-[110px] animate-float" />
          <div className="absolute -right-20 bottom-10 size-[28rem] rounded-full bg-petal/40 blur-[120px] animate-pulse-soft" />
          <span className="absolute left-[16%] top-32 size-1.5 rounded-full bg-rose/40 animate-pulse-soft" />
          <span className="absolute left-[72%] top-24 size-2 rounded-full bg-rose/30 animate-pulse-soft [animation-delay:1.2s]" />
          <span className="absolute left-[48%] top-12 size-1.5 rounded-full bg-plum/25 animate-pulse-soft [animation-delay:2s]" />
        </>
      ) : null}
    </div>
  );
}
