"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ImageIcon, MessageCircleHeart, Play, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DemoSlide {
  title: string;
  message: string;
  from: string;
  image: string;
  accent: string;
  background: string;
}

const stages = ["open", "message", "gallery", "reply"] as const;
type Stage = (typeof stages)[number];

interface GiftDemoProps {
  slides: DemoSlide[];
  className?: string;
}

export function GiftDemo({ slides, className }: GiftDemoProps) {
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<Stage>("open");

  const slide = slides[index % Math.max(1, slides.length)];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setStage((current) => {
        const next = stages[(stages.indexOf(current) + 1) % stages.length];
        if (next === "open") setIndex((value) => value + 1);
        return next;
      });
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  if (!slide) return null;

  return (
    <div className={cn("relative mx-auto w-full max-w-[22rem]", className)}>
      <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-blush via-white to-petal/70 blur-2xl" />
      <div className="relative overflow-hidden rounded-[2.6rem] border border-white/80 bg-white/60 p-2.5 shadow-lift backdrop-blur">
        <div className="relative overflow-hidden rounded-[2.1rem] border border-line/60 bg-cream">
          <div className="flex items-center justify-between px-5 pb-1 pt-3 text-[10px] font-medium text-ink-soft/70">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span className="size-1 rounded-full bg-current" />
              <span className="size-1 rounded-full bg-current opacity-70" />
              <span className="size-1 rounded-full bg-current opacity-40" />
            </span>
          </div>

          <div
            className="relative min-h-[27rem] overflow-hidden px-6 pb-6 pt-4"
            style={{
              background: `linear-gradient(160deg, ${slide.background}, ${slide.accent}22 70%, ${slide.background})`,
              color: "#29212A",
            }}
          >
            <div
              className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full opacity-30 blur-2xl"
              style={{ background: slide.accent }}
            />
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em]">
              <span className="rounded-full bg-white/70 px-2.5 py-1 backdrop-blur">
                {stage === "reply" ? "Delivered" : "Heartly"}
              </span>
              <span className="flex items-center gap-1 text-ink-soft/70">
                <Play className="size-3" /> Live preview
              </span>
            </div>

            <AnimatePresence mode="wait">
              {stage === "open" ? (
                <motion.div
                  key={`open-${index}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45 }}
                  className="flex min-h-[21rem] flex-col items-center justify-center text-center"
                >
                  <span
                    className="flex size-14 items-center justify-center rounded-2xl bg-white/70 shadow-sm"
                    style={{ color: slide.accent }}
                  >
                    <Heart className="size-6" fill="currentColor" fillOpacity={0.18} />
                  </span>
                  <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.26em] text-ink-soft">
                    A little something for you
                  </p>
                  <h3 className="mt-3 font-display text-3xl leading-tight text-plum">
                    {slide.from} sent you a gift
                  </h3>
                  <span
                    className="mt-7 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-medium text-white shadow-md"
                    style={{ background: slide.accent }}
                  >
                    <Sparkles className="size-3.5" /> Tap to open
                  </span>
                </motion.div>
              ) : null}

              {stage === "message" ? (
                <motion.div
                  key={`message-${index}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45 }}
                  className="pt-8 text-center"
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.24em]"
                    style={{ color: slide.accent }}
                  >
                    For you
                  </p>
                  <h3 className="mt-3 font-display text-3xl leading-tight text-plum">
                    {slide.title}
                  </h3>
                  <p className="mx-auto mt-4 max-w-[15rem] text-xs leading-relaxed text-ink-soft">
                    {slide.message}
                  </p>
                  <div className="mt-6 overflow-hidden rounded-2xl border border-white/70 bg-white/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.image}
                      alt=""
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                  <p className="mt-4 text-xs italic text-ink-soft">— {slide.from}</p>
                </motion.div>
              ) : null}

              {stage === "gallery" ? (
                <motion.div
                  key={`gallery-${index}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45 }}
                  className="pt-8"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-soft">
                      The memories
                    </p>
                    <ImageIcon className="size-4" style={{ color: slide.accent }} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className={cn(
                          "overflow-hidden rounded-2xl border border-white/70 bg-white/40",
                          item === 0 && "col-span-2",
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={slide.image}
                          alt=""
                          className={cn(
                            "w-full object-cover",
                            item === 0 ? "aspect-[16/9]" : "aspect-square",
                          )}
                          style={{
                            objectPosition: `${25 + item * 16}% center`,
                            filter: item === 0 ? undefined : `hue-rotate(${item * 14}deg)`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-center text-[11px] text-ink-soft">
                    Scroll through every photo they chose for you.
                  </p>
                </motion.div>
              ) : null}

              {stage === "reply" ? (
                <motion.div
                  key={`reply-${index}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45 }}
                  className="flex min-h-[21rem] flex-col items-center justify-center text-center"
                >
                  <span
                    className="flex size-14 items-center justify-center rounded-full"
                    style={{ background: `${slide.accent}1f`, color: slide.accent }}
                  >
                    <MessageCircleHeart className="size-6" />
                  </span>
                  <h3 className="mt-6 font-display text-3xl leading-tight text-plum">
                    They wrote back
                  </h3>
                  <div className="mt-5 w-full rounded-2xl border border-white/70 bg-white/60 p-4 text-left text-xs leading-relaxed text-ink-soft">
                    <p className="font-medium text-plum">That was the sweetest thing.</p>
                    <p className="mt-1.5">
                      I opened it twice. I am keeping this link forever.
                    </p>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                    <Heart className="size-3" style={{ color: slide.accent }} /> Reply sent
                  </span>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-1.5">
        {stages.map((item) => (
          <span
            key={item}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              stage === item ? "w-6 bg-rose" : "w-1.5 bg-petal",
            )}
          />
        ))}
      </div>
    </div>
  );
}
