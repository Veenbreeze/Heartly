"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-5 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-600">
        <TriangleAlert className="size-7" />
      </span>
      <p className="mt-7 text-xs font-semibold uppercase tracking-[0.24em] text-rose">
        Something went wrong
      </p>
      <h1 className="mt-3 max-w-xl font-display text-4xl leading-tight text-plum sm:text-5xl">
        We hit an unexpected snag.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft sm:text-base">
        Your work is safe. Try again, and if the problem continues, contact
        support.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>
          <RefreshCcw /> Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/help">Get help</Link>
        </Button>
      </div>
      {error.digest ? (
        <p className="mt-6 font-mono text-[10px] text-ink-soft">
          Reference: {error.digest}
        </p>
      ) : null}
    </main>
  );
}
