"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  Music2,
  Pause,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AnimationLayer } from "@/components/gift/animation-layer";
import { ReportGift } from "@/components/gift/report-gift";
import { ShareGiftCard } from "@/components/gift/share-gift-card";
import { useAmbientMusic } from "@/components/gift/use-ambient-music";
import type { GiftContent, TemplateType } from "@/lib/gift/schema";
import { cn } from "@/lib/utils";

const fontMap: Record<string, string> = {
  playfair: "var(--font-playfair), Georgia, serif",
  inter: "var(--font-inter), system-ui, sans-serif",
  cormorant: "var(--font-cormorant), Georgia, serif",
  lora: "var(--font-lora), Georgia, serif",
};

interface GiftExperienceProps {
  content: GiftContent;
  templateType: TemplateType;
  preview?: boolean;
  slug?: string;
  canReport?: boolean;
}

export function GiftExperience({
  content,
  templateType,
  preview = false,
  slug,
  canReport = false,
}: GiftExperienceProps) {
  const [opened, setOpened] = useState(preview);
  const [playing, setPlaying] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const theme = content.theme;
  const hasMusic = content.music.enabled && content.music.track !== "none";
  const headingFont = fontMap[theme.headingFont] ?? fontMap.playfair;
  const bodyFont = fontMap[theme.bodyFont] ?? fontMap.inter;
  const hasDate = Boolean(
    content.date && (content.date.date || content.date.venue),
  );
  const hasQuestions = Boolean(content.questions?.length);

  useAmbientMusic({
    enabled: hasMusic,
    track: content.music.track,
    playing: playing && opened,
  });

  useEffect(() => {
    if (preview || !slug) return;
    const timer = window.setTimeout(() => {
      void fetch(`/api/gifts/${slug}/view`, { method: "POST" }).catch(
        () => undefined,
      );
    }, 900);
    return () => window.clearTimeout(timer);
  }, [preview, slug]);

  const media = useMemo(() => content.media ?? [], [content.media]);

  function openGift() {
    setOpened(true);
    if (hasMusic) setPlaying(true);
  }

  async function respond(responseType: string) {
    if (preview || !slug) return;
    setSending(true);
    setError(null);
    try {
      const response = await fetch(`/api/gifts/${slug}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responseType,
          responseData: answers,
          message: message.trim() || undefined,
          respondentName: name.trim() || undefined,
        }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Could not send your reply.");
      }
      setSent(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not send your reply.");
    } finally {
      setSending(false);
    }
  }

  const style = {
    backgroundColor: theme.background,
    color: theme.text,
    fontFamily: bodyFont,
    "--gift-accent": theme.accent,
    "--gift-secondary": theme.secondary,
  } as React.CSSProperties;

  return (
    <div className={cn("relative overflow-hidden", preview ? "min-h-full" : "min-h-screen")} style={style}>
      <AnimationLayer
        type={content.animation.type}
        intensity={content.animation.intensity}
        accent={theme.accent}
      />

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div
            key="gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45 }}
            className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-16 text-center"
          >
            {!preview ? (
              <Link href="/" className="absolute inset-x-5 top-5 mx-auto flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white/65 px-4 py-2 text-sm font-semibold backdrop-blur" aria-label="Heartly home">
                <Heart className="size-4" style={{ color: theme.accent }} fill="currentColor" fillOpacity={0.2} />
                Heartly
              </Link>
            ) : null}
            <motion.div
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="w-full max-w-md"
            >
              <span
                className="mx-auto mb-7 flex size-16 items-center justify-center rounded-3xl"
                style={{ backgroundColor: `${theme.accent}1f`, color: theme.accent }}
              >
                <Heart className="size-7" fill="currentColor" fillOpacity={0.15} />
              </span>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.28em]"
                style={{ color: theme.accent }}
              >
                A little something for
              </p>
              <h1
                className="mt-3 text-balance text-4xl leading-tight sm:text-5xl"
                style={{ fontFamily: headingFont }}
              >
                {content.recipientName || "You"}
              </h1>
              {content.senderName ? (
                <p className="mt-4 text-sm opacity-65">from {content.senderName}</p>
              ) : null}
              <button
                type="button"
                onClick={openGift}
                className="group mt-9 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white shadow-lg transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4"
                style={{
                  backgroundColor: theme.accent,
                  boxShadow: `0 18px 40px -18px ${theme.accent}`,
                }}
              >
                Open your gift
                <ChevronRight className="size-4 transition group-hover:translate-x-0.5" />
              </button>
              <p className="mt-5 text-[11px] uppercase tracking-[0.2em] opacity-40">
                Made with Heartly
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.main
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55 }}
            className={cn("relative z-10 mx-auto flex w-full max-w-3xl flex-col px-5 py-12 sm:px-8 sm:py-16", preview ? "min-h-full" : "min-h-screen")}
          >
            {!preview ? (
              <div className="-mx-5 mb-8 flex items-center justify-between border-b border-black/10 px-5 pb-4 sm:mx-0 sm:px-0">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold" aria-label="Heartly home">
                  <span className="flex size-9 items-center justify-center rounded-full" style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}>
                    <Heart className="size-4" fill="currentColor" fillOpacity={0.2} />
                  </span>
                  Heartly
                </Link>
                <span className="text-xs opacity-60">A keepsake for {content.recipientName || "you"}</span>
              </div>
            ) : null}
            <div className="flex flex-1 flex-col justify-center">
              <motion.header
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center"
              >
                {content.recipientName ? (
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.28em]"
                    style={{ color: theme.accent }}
                  >
                    For {content.recipientName}
                  </p>
                ) : null}
                <h1
                  className="mt-3 text-balance text-4xl leading-[1.1] sm:text-6xl"
                  style={{ fontFamily: headingFont }}
                >
                  {content.title || "A little something for you"}
                </h1>
                {content.message ? (
                  <p className="mx-auto mt-6 max-w-xl whitespace-pre-line text-pretty text-base leading-relaxed opacity-80 sm:text-lg">
                    {content.message}
                  </p>
                ) : null}
                {content.senderName ? (
                  <p
                    className="mt-6 text-sm opacity-60"
                    style={{ fontFamily: headingFont }}
                  >
                    — {content.senderName}
                  </p>
                ) : null}
              </motion.header>

              {media.length ? (
                <motion.section
                  initial={{ y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.22 }}
                  className="mt-11"
                  aria-label="Photos"
                >
                  <div
                    className={cn(
                      "grid gap-3",
                      media.length === 1
                        ? "grid-cols-1"
                        : media.length === 2
                          ? "grid-cols-2"
                          : "grid-cols-2 sm:grid-cols-3",
                    )}
                  >
                    {media.map((item, index) => (
                      <figure
                        key={`${item.url}-${index}`}
                        className={cn(
                          "overflow-hidden rounded-2xl border border-black/5 bg-white/40",
                          media.length === 1 ? "aspect-[4/3]" : "aspect-square",
                          media.length === 3 && index === 0 && "col-span-2 sm:col-span-1",
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={item.alt || `A photo in this gift, ${index + 1}`}
                          className="size-full object-cover"
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                        />
                      </figure>
                    ))}
                  </div>
                </motion.section>
              ) : null}

              {hasDate ? (
                <motion.section
                  initial={{ y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mx-auto mt-11 w-full max-w-md rounded-3xl border border-black/5 bg-white/55 p-6 backdrop-blur"
                >
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: theme.accent }}
                  >
                    {templateType === "question" ? "The moment" : "Save the date"}
                  </p>
                  <div className="mt-4 space-y-3 text-sm">
                    {content.date?.date ? (
                      <p className="flex items-center gap-2.5">
                        <CalendarDays className="size-4 shrink-0" style={{ color: theme.accent }} />
                        {content.date.date}
                      </p>
                    ) : null}
                    {content.date?.time ? (
                      <p className="flex items-center gap-2.5">
                        <Clock className="size-4 shrink-0" style={{ color: theme.accent }} />
                        {content.date.time}
                      </p>
                    ) : null}
                    {content.date?.venue || content.date?.address ? (
                      <p className="flex items-start gap-2.5">
                        <MapPin className="mt-0.5 size-4 shrink-0" style={{ color: theme.accent }} />
                        <span>
                          {content.date?.venue}
                          {content.date?.venue && content.date?.address ? (
                            <span className="block opacity-60">{content.date.address}</span>
                          ) : (
                            content.date?.address
                          )}
                        </span>
                      </p>
                    ) : null}
                  </div>
                </motion.section>
              ) : null}

              {hasQuestions ? (
                <motion.section
                  initial={{ y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.36 }}
                  className="mx-auto mt-11 w-full max-w-xl space-y-5"
                  aria-label="Questions"
                >
                  {content.questions?.map((question, questionIndex) => (
                    <div
                      key={question.id}
                      className="rounded-3xl border border-black/5 bg-white/55 p-5 backdrop-blur"
                    >
                      <p
                        className="text-lg leading-snug"
                        style={{ fontFamily: headingFont }}
                      >
                        {question.question}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {question.options.map((option) => {
                          const active = answers[question.id] === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              disabled={preview || sent}
                              onClick={() =>
                                setAnswers((current) => ({
                                  ...current,
                                  [question.id]: option,
                                }))
                              }
                              className={cn(
                                "rounded-full border px-3.5 py-1.5 text-sm transition disabled:opacity-60",
                                active
                                  ? "border-transparent text-white"
                                  : "border-black/10 bg-white/60 hover:border-current",
                              )}
                              style={
                                active ? { backgroundColor: theme.accent } : undefined
                              }
                              aria-pressed={active}
                              aria-label={`Answer ${questionIndex + 1}: ${option}`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </motion.section>
              ) : null}

              {content.reveal?.message || content.reveal?.title ? (
                <motion.section
                  initial={{ y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mx-auto mt-11 w-full max-w-xl text-center"
                >
                  {revealed ? (
                    <motion.div
                      initial={{ scale: 0.96, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="rounded-3xl border p-7"
                      style={{
                        borderColor: `${theme.accent}40`,
                        backgroundColor: `${theme.accent}0d`,
                      }}
                    >
                      {content.reveal?.title ? (
                        <h2
                          className="text-2xl"
                          style={{ fontFamily: headingFont }}
                        >
                          {content.reveal.title}
                        </h2>
                      ) : null}
                      {content.reveal?.message ? (
                        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed opacity-80">
                          {content.reveal.message}
                        </p>
                      ) : null}
                    </motion.div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRevealed(true)}
                      className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition hover:-translate-y-0.5"
                      style={{ borderColor: `${theme.accent}55`, color: theme.accent }}
                    >
                      <Sparkles className="size-4" /> One more thing
                    </button>
                  )}
                </motion.section>
              ) : null}

              {!preview && slug ? (
                <motion.section
                  initial={{ y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="mx-auto mt-12 w-full max-w-xl rounded-3xl border border-black/5 bg-white/60 p-6 backdrop-blur"
                  aria-label="Reply to this gift"
                >
                  {sent ? (
                    <div className="py-4 text-center">
                      <span
                        className="mx-auto flex size-12 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${theme.accent}1f`, color: theme.accent }}
                      >
                        <Check className="size-5" />
                      </span>
                      <h2
                        className="mt-4 text-2xl"
                        style={{ fontFamily: headingFont }}
                      >
                        Your reply is on its way.
                      </h2>
                      <p className="mt-2 text-sm opacity-60">
                        Thank you for taking a moment to send something back.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Heart className="size-4" style={{ color: theme.accent }} />
                        <h2
                          className="text-xl"
                          style={{ fontFamily: headingFont }}
                        >
                          {hasDate && templateType !== "question"
                            ? "Will you be there?"
                            : hasQuestions
                              ? "Send your answers"
                              : "Send a little something back"}
                        </h2>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <input
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          placeholder="Your name (optional)"
                          maxLength={120}
                          className="h-11 rounded-xl border border-black/10 bg-white/70 px-4 text-sm outline-none placeholder:opacity-50 focus:border-current sm:col-span-2"
                          style={{ color: theme.text }}
                          aria-label="Your name"
                        />
                      </div>
                      <textarea
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder="Leave a note…"
                        rows={3}
                        maxLength={2000}
                        className="mt-3 w-full rounded-xl border border-black/10 bg-white/70 px-4 py-3 text-sm outline-none placeholder:opacity-50 focus:border-current"
                        style={{ color: theme.text }}
                        aria-label="Your message"
                      />
                      {hasDate && templateType !== "question" ? (
                        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                          <button
                            type="button"
                            disabled={sending}
                            onClick={() => respond("accept")}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 disabled:opacity-60"
                            style={{ backgroundColor: theme.accent }}
                          >
                            <Check className="size-4" /> I&apos;ll be there
                          </button>
                          <button
                            type="button"
                            disabled={sending}
                            onClick={() => respond("decline")}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm transition hover:-translate-y-0.5 disabled:opacity-60"
                            style={{ borderColor: `${theme.text}30` }}
                          >
                            Can&apos;t make it
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={sending || (!message.trim() && !Object.keys(answers).length)}
                          onClick={() => respond(hasQuestions ? "answer" : "message")}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ backgroundColor: theme.accent }}
                        >
                          <Send className="size-4" />
                          {sending ? "Sending…" : "Send reply"}
                        </button>
                      )}
                      {error ? (
                        <p className="mt-3 text-xs text-red-600" role="alert">
                          {error}
                        </p>
                      ) : null}
                    </>
                  )}
                </motion.section>
              ) : null}

              {!preview && (content.title || content.message) ? (
                <ShareGiftCard
                  title={content.title || "A little something for you"}
                  message={content.message || "A thoughtful moment, made just for you."}
                  senderName={content.senderName}
                  background={theme.background}
                  accent={theme.accent}
                  text={theme.text}
                />
              ) : null}

              <footer className="mt-14 text-center">
                {content.branding?.remove ? (
                  <p className="text-[10px] uppercase tracking-[0.24em] opacity-35">
                    Made with love
                  </p>
                ) : (
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.24em] opacity-40 transition hover:opacity-70"
                  >
                    Made with <Heart className="size-3 fill-current" /> Heartly
                  </Link>
                )}
                {canReport && slug && !preview ? (
                  <div className="mt-4">
                    <ReportGift
                      slug={slug}
                      className="text-[10px] uppercase tracking-[0.24em] opacity-35 transition hover:opacity-70"
                    />
                  </div>
                ) : null}
              </footer>
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      {hasMusic && opened ? (
        <button
          type="button"
          onClick={() => setPlaying((value) => !value)}
          className="fixed bottom-5 right-5 z-20 flex size-11 items-center justify-center rounded-full border border-black/10 bg-white/80 shadow-lg backdrop-blur transition hover:scale-105"
          style={{ color: theme.text }}
          aria-label={playing ? "Pause music" : "Play music"}
        >
          {playing ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          <span
            className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: theme.accent }}
          >
            {playing ? (
              <Pause className="size-2" />
            ) : (
              <Music2 className="size-2" />
            )}
          </span>
        </button>
      ) : null}
    </div>
  );
}
