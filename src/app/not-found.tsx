import Link from "next/link";
import { Compass, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-5 py-16 text-center">
      <div className="relative">
        <span className="absolute -inset-8 rounded-full bg-blush/70 blur-2xl" />
        <span className="relative flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-rose to-plum text-white shadow-lift">
          <Heart className="size-9 fill-white/20" />
        </span>
      </div>
      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-rose">
        404 · Not found
      </p>
      <h1 className="mt-3 max-w-xl font-display text-4xl leading-tight text-plum sm:text-5xl">
        This page slipped away.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft sm:text-base">
        The link may be broken, the gift may have expired, or the page may have
        moved somewhere new.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">
            <Heart /> Back home
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/explore">
            <Compass /> Explore gifts
          </Link>
        </Button>
      </div>
    </main>
  );
}
