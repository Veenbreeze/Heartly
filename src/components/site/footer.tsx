import Link from "next/link";
import { Heart } from "lucide-react";
import { Logo } from "@/components/brand/logo";

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
    <footer className="border-t border-line/80 bg-white/50">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_2fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              Thoughtful digital gifts for the people who matter. Create a
              keepsake, add your own words, and send a little joy in a link.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 text-xs text-ink-soft">
              Made with <Heart className="size-3.5 fill-rose text-rose" /> in Tanzania
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
                        className="text-sm text-ink-soft transition hover:text-rose"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-line/70 pt-6 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Heartly. All rights reserved.</p>
          <p>Digital gifts, real feelings.</p>
        </div>
      </div>
    </footer>
  );
}
