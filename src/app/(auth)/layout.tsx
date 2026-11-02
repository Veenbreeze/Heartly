import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-cream lg:grid-cols-[1.1fr_1fr]">
      <main id="main" className="flex min-h-screen flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <Link href="/" className="text-sm text-ink-soft transition hover:text-rose">
            Back home
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <p className="text-center text-xs text-ink-soft">
          By continuing you agree to our{" "}
          <Link href="/legal/terms" className="underline hover:text-rose">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="underline hover:text-rose">
            Privacy Policy
          </Link>
          .
        </p>
      </main>
      <aside className="relative hidden overflow-hidden bg-plum lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(232,93,117,0.45),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(243,198,211,0.3),transparent_50%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs">
            <Sparkles className="size-3.5 text-petal" /> Digital gifts, made personal
          </span>
          <div>
            <Heart className="size-8 fill-petal/30 text-petal" />
            <blockquote className="mt-6 max-w-md font-display text-4xl leading-tight">
              &ldquo;The best gifts do not need wrapping. They just need to feel
              like you.&rdquo;
            </blockquote>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/65">
              Create a keepsake with your words, photos, music, and a little
              animation. Then send it as one simple link.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span className="size-1.5 rounded-full bg-petal" />
            Heartly — made with care
          </div>
        </div>
      </aside>
    </div>
  );
}
