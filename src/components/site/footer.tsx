import Link from "next/link";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

const columns = [
  {
    title: "Create",
    links: [
      { href: "/create", label: "Start a gift" },
      { href: "/categories", label: "Browse categories" },
      { href: "/explore", label: "Explore gifts" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/about", label: "About Heartly" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/privacy", label: "Privacy" },
      { href: "/legal/terms", label: "Terms" },
      { href: "/legal/cookies", label: "Cookies" },
      { href: "/legal/refunds", label: "Refunds" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-line/70 bg-petal-tile">
      <div className="absolute inset-0 bg-gradient-to-b from-cream/80 via-cream/92 to-cream" />
      <div className="container-page relative py-14">
        <div className="mb-12 overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br from-plum via-[#4a3340] to-rose/80 px-6 py-8 text-white shadow-lift sm:px-10 sm:py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-lg">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-peach">
                <Sparkles className="size-3.5" /> A little joy, in a link
              </p>
              <h2 className="mt-3 font-display text-2xl leading-tight sm:text-3xl">
                Make someone&apos;s ordinary day feel remembered.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Start free, customise every word, and send something they can
                keep.
              </p>
            </div>
            <Button asChild size="lg" variant="secondary" className="shrink-0">
              <Link href="/create">
                Start a free gift <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-[1.4fr_2fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              Thoughtful digital gifts for the people who matter. Create a
              keepsake, add your own words, and send a little joy in a link.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-white/60 px-3 py-1.5 text-xs text-ink-soft">
              Made with{" "}
              <Heart className="size-3.5 fill-rose text-rose animate-pulse-soft" />{" "}
              in Tanzania
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-plum">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1 text-sm text-ink-soft transition hover:text-rose"
                      >
                        {link.label}
                        <ArrowRight className="size-3 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-line/70 pt-6 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Heartly.</p>
          <p className="inline-flex items-center gap-1.5">
            Digital gifts, real feelings.
            <Heart className="size-3 fill-rose/40 text-rose" />
          </p>
        </div>
      </div>
    </footer>
  );
}
