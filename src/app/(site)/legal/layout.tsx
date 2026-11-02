import Link from "next/link";

const links = [
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/cookies", label: "Cookies" },
  { href: "/legal/refunds", label: "Refunds" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-14">
        <aside>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">
            Legal
          </p>
          <nav aria-label="Legal pages" className="mt-4 flex gap-1 overflow-x-auto lg:flex-col [scrollbar-width:none]">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="shrink-0 rounded-full px-3.5 py-2 text-sm text-ink-soft transition hover:bg-blush/70 hover:text-plum lg:rounded-xl"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="mt-6 hidden max-w-[13rem] text-xs leading-relaxed text-ink-soft lg:block">
            Questions about these policies?{" "}
            <Link href="/contact" className="font-medium text-rose hover:underline">
              Contact us
            </Link>
            .
          </p>
        </aside>
        <article className="min-w-0 max-w-3xl rounded-[2rem] border border-line bg-white/65 p-6 shadow-soft sm:p-9">
          {children}
        </article>
      </div>
    </div>
  );
}
