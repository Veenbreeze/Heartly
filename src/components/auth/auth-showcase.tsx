"use client";

import Link from "next/link";
import { ArrowUpRight, Heart, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

const signUpPhoto = "/images/editorial/letter-flower.jpg";
const signInPhoto = "/images/editorial/couple-sunset.jpg";

export function AuthShowcase() {
  const isRegister = usePathname()?.includes("/register") ?? false;
  const image = isRegister ? signUpPhoto : signInPhoto;
  const photoCredit = isRegister ? "Photo by Diana Light" : "Photo by Alexander Mass";
  const photoPage = isRegister
    ? "https://unsplash.com/photos/a-close-up-of-a-letter-and-a-flower-on-a-table-X6t0EmzKjm4"
    : "https://unsplash.com/photos/a-couple-holding-hands-looking-at-each-other-during-sunset-sT1xHuKfMQA";
  return (
    <aside
      aria-label="Heartly keepsake inspiration"
      className="auth-photo relative isolate min-h-[220px] overflow-hidden bg-cover bg-center bg-plum text-white sm:min-h-[360px] lg:sticky lg:top-0 lg:h-screen lg:min-h-screen"
      style={{ backgroundImage: `url('${image}')` }}
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#241923]/95 via-[#241923]/35 to-[#241923]/10" />
      <div className="relative flex h-full min-h-[220px] flex-col justify-between p-5 sm:min-h-[360px] sm:p-10 lg:min-h-screen lg:p-14">
        <Link href="/" className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-black/15 px-3.5 py-2 text-sm font-semibold tracking-wide text-white backdrop-blur-md transition hover:bg-black/30">
          <Heart className="size-4 fill-white/30" /> Heartly
          <span className="ml-1 text-white/55">/</span>
          <span className="font-normal text-white/75">made personal</span>
        </Link>

        <div className="max-w-xl py-4 sm:py-8 lg:pb-10">
          <div className="mb-2 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/85 sm:mb-4 sm:text-xs">
            <Sparkles className="size-4 text-[#ffd8b4]" /> A little more meaningful
          </div>
          <h2 className="max-w-lg font-display text-2xl leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="sm:hidden">{isRegister ? "Make a moment personal." : "Your moments, right here."}</span>
            <span className="hidden sm:inline">{isRegister ? "Turn a feeling into something they can keep." : "Your next thoughtful moment starts here."}</span>
          </h2>
          <p className="mt-3 hidden max-w-md text-sm leading-relaxed text-white/80 sm:block sm:text-base">
            {isRegister
              ? "Choose a design, add your words and photos, then send one beautiful link."
              : "Your drafts, memories and messages are ready whenever inspiration finds you."}
          </p>
          <div className="mt-6 hidden flex-wrap gap-2 sm:flex">
            {["Your words", "Your photos", "One lovely link"].map((label) => (
              <span key={label} className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white/90 backdrop-blur">{label}</span>
            ))}
          </div>
          <Link href="/explore" className="mt-7 hidden items-center gap-2 text-sm font-semibold text-white transition hover:text-[#ffd8b4] sm:inline-flex">
            See what you can make <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <a
          href={photoPage}
          target="_blank"
          rel="noreferrer"
          className="hidden w-fit text-[10px] text-white/65 underline-offset-2 hover:underline sm:inline"
        >
          {photoCredit} on Unsplash
        </a>
      </div>
    </aside>
  );
}
