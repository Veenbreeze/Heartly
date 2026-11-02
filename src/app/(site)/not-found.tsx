import Link from "next/link";
import { Compass, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SiteNotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-3xl bg-blush text-rose">
        <Search className="size-7" />
      </span>
      <p className="mt-7 text-xs font-semibold uppercase tracking-[0.24em] text-rose">
        Page not found
      </p>
      <h1 className="mt-3 max-w-2xl text-balance text-4xl leading-tight text-plum sm:text-5xl">
        We could not find that page.
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-soft sm:text-base">
        Try the template gallery, or return home and start a new gift from
        there.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/explore">
            <Compass /> Browse templates
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}
