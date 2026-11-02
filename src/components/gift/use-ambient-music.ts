"use client";

import { useEffect, useRef } from "react";
import type { AnimationType } from "@/lib/gift/schema";

const patterns: Record<string, number[]> = {
  dreamy: [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 293.66, 349.23],
  romantic: [220.0, 261.63, 329.63, 440.0, 329.63, 261.63, 246.94, 293.66],
  playful: [392.0, 523.25, 659.25, 523.25, 440.0, 587.33, 659.25, 783.99],
};

export const musicTrackLabels: Record<string, string> = {
  none: "No music",
  dreamy: "Dreamy",
  romantic: "Romantic",
  playful: "Playful",
};

export function useAmbientMusic({
  enabled,
  track,
  playing,
}: {
  enabled: boolean;
  track: string;
  playing: boolean;
}) {
  const contextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled || !playing || track === "none" || !patterns[track]) {
      return;
    }
    if (typeof window === "undefined") return;

    const AudioContextClass =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    contextRef.current = context;
    void context.resume();
    const notes = patterns[track];
    let index = 0;

    function playNote() {
      if (!contextRef.current || contextRef.current.state === "closed") return;
      const ctx = contextRef.current;
      const now = ctx.currentTime;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = notes[index % notes.length];
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now);
      oscillator.stop(now + 1.7);
      index += 1;
    }

    playNote();
    timerRef.current = setInterval(playNote, 620);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      void context.close().catch(() => undefined);
      contextRef.current = null;
    };
  }, [enabled, playing, track]);
}

export type { AnimationType };
