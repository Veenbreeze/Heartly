"use client";

import { Heart, Sparkles, Star } from "lucide-react";
import type { AnimationType } from "@/lib/gift/schema";

interface AnimationLayerProps {
  type: AnimationType;
  intensity: "low" | "medium" | "high";
  accent: string;
}

function countFor(intensity: "low" | "medium" | "high") {
  if (intensity === "high") return 22;
  if (intensity === "medium") return 13;
  return 7;
}

function pseudo(index: number, salt: number) {
  return ((index * 9301 + salt * 49297) % 233280) / 233280;
}

export function AnimationLayer({ type, intensity, accent }: AnimationLayerProps) {
  if (type === "none") return null;
  const count = countFor(intensity);
  const items = Array.from({ length: count }, (_, index) => index);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {type === "hearts"
        ? items.map((index) => (
            <Heart
              key={index}
              className="absolute fill-current opacity-0"
              style={{
                left: `${pseudo(index, 1) * 100}%`,
                bottom: "-10%",
                color: accent,
                width: `${10 + pseudo(index, 2) * 18}px`,
                animation: `rise ${9 + pseudo(index, 3) * 10}s linear ${pseudo(index, 4) * 9}s infinite`,
              }}
            />
          ))
        : null}

      {type === "petals"
        ? items.map((index) => (
            <span
              key={index}
              className="absolute rounded-[60%_40%_55%_45%] opacity-0"
              style={{
                left: `${pseudo(index, 5) * 100}%`,
                top: "-10%",
                width: `${8 + pseudo(index, 6) * 12}px`,
                height: `${6 + pseudo(index, 7) * 8}px`,
                background: accent,
                animation: `drift ${10 + pseudo(index, 8) * 10}s linear ${pseudo(index, 9) * 10}s infinite`,
              }}
            />
          ))
        : null}

      {type === "stars"
        ? items.map((index) => (
            <Star
              key={index}
              className="absolute fill-current"
              style={{
                left: `${pseudo(index, 10) * 100}%`,
                top: `${pseudo(index, 11) * 100}%`,
                color: accent,
                width: `${4 + pseudo(index, 12) * 8}px`,
                animation: `twinkle ${2.5 + pseudo(index, 13) * 4}s ease-in-out ${pseudo(index, 14) * 4}s infinite`,
              }}
            />
          ))
        : null}

      {type === "sparkles"
        ? items.map((index) => (
            <Sparkles
              key={index}
              className="absolute"
              style={{
                left: `${pseudo(index, 15) * 100}%`,
                top: `${pseudo(index, 16) * 100}%`,
                color: accent,
                width: `${10 + pseudo(index, 17) * 14}px`,
                opacity: 0.4,
                animation: `twinkle ${3 + pseudo(index, 18) * 3}s ease-in-out ${pseudo(index, 19) * 3}s infinite`,
              }}
            />
          ))
        : null}

      {type === "butterflies"
        ? items.map((index) => (
            <Heart
              key={index}
              className="absolute fill-current opacity-0"
              style={{
                left: `${pseudo(index, 35) * 100}%`,
                top: "-10%",
                color: accent,
                width: `${10 + pseudo(index, 36) * 14}px`,
                animation: `flutter ${9 + pseudo(index, 37) * 9}s linear ${pseudo(index, 38) * 8}s infinite`,
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
                left: `${pseudo(index, 39) * 100}%`,
                bottom: "-10%",
                width: `${10 + pseudo(index, 40) * 26}px`,
                height: `${10 + pseudo(index, 40) * 26}px`,
                borderColor: accent,
                background: `${accent}22`,
                animation: `bubble ${9 + pseudo(index, 41) * 9}s linear ${pseudo(index, 42) * 8}s infinite`,
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
                left: `${pseudo(index, 43) * 100}%`,
                top: "-8%",
                width: `${4 + pseudo(index, 44) * 7}px`,
                height: `${4 + pseudo(index, 44) * 7}px`,
                animation: `snowfall ${8 + pseudo(index, 45) * 8}s linear ${pseudo(index, 46) * 8}s infinite`,
              }}
            />
          ))
        : null}

      {type === "confetti"
        ? items.map((index) => (
            <span
              key={index}
              className="absolute top-0"
              style={{
                left: `${pseudo(index, 20) * 100}%`,
                width: `${5 + pseudo(index, 21) * 6}px`,
                height: `${8 + pseudo(index, 22) * 8}px`,
                borderRadius: index % 2 ? "50%" : "2px",
                background: index % 3 === 0 ? accent : "#F3C6D3",
                animation: `fall ${5 + pseudo(index, 23) * 6}s linear ${pseudo(index, 24) * 6}s infinite`,
              }}
            />
          ))
        : null}

      {type === "float" ? (
        <div className="absolute inset-0">
          {items.slice(0, 5).map((index) => (
            <span
              key={index}
              className="absolute rounded-full opacity-30 blur-2xl"
              style={{
                left: `${10 + pseudo(index, 25) * 80}%`,
                top: `${10 + pseudo(index, 26) * 70}%`,
                width: `${80 + pseudo(index, 27) * 120}px`,
                height: `${80 + pseudo(index, 27) * 120}px`,
                background: accent,
                animation: `float ${7 + pseudo(index, 28) * 6}s ease-in-out ${pseudo(index, 29) * 3}s infinite`,
              }}
            />
          ))}
        </div>
      ) : null}

      {type === "waves" ? (
        <div className="absolute inset-x-0 bottom-0 h-40 opacity-30">
          <svg
            className="absolute bottom-0 h-40 w-[200%]"
            style={{ animation: "wave 14s linear infinite" }}
            viewBox="0 0 1440 200"
            preserveAspectRatio="none"
          >
            <path
              d="M0 100 C 240 40 480 160 720 100 C 960 40 1200 160 1440 100 L1440 200 L0 200 Z"
              fill={accent}
            />
          </svg>
        </div>
      ) : null}

      {type === "candles" ? (
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-around px-8 pb-4">
          {items.slice(0, 8).map((index) => (
            <span key={index} className="flex flex-col items-center">
              <span
                className="mb-0.5 block size-2 rounded-full"
                style={{
                  background: accent,
                  boxShadow: `0 0 16px 6px ${accent}66`,
                  animation: `flicker ${1.4 + pseudo(index, 30)}s ease-in-out infinite`,
                }}
              />
              <span className="block h-9 w-2 rounded-sm bg-white/40" />
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
