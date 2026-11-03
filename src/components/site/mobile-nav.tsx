"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, BookOpenText, CalendarHeart, CircleHelp, Compass, Menu, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/explore", label: "Discover designs", note: "Find a look that feels like you", icon: Compass },
  { href: "/categories", label: "Choose an occasion", note: "Birthdays, love, thank yous and more", icon: CalendarHeart },
  { href: "/how-it-works", label: "How it works", note: "From your idea to their inbox", icon: BookOpenText },
  { href: "/pricing", label: "Plans & pricing", note: "See what you can make for free", icon: CircleHelp },
];

export function MobileNav({ signedIn, isAdmin = false }: { signedIn: boolean; isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex size-11 items-center justify-center rounded-2xl border border-[#e9ded8] bg-white text-plum shadow-sm transition hover:border-rose/40 hover:text-rose"
        aria-expanded={open}
        aria-controls="mobile-feature-menu"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open ? (
        <div id="mobile-feature-menu" className="fixed inset-x-0 bottom-0 top-[82px] z-40 overflow-y-auto border-t border-[#ece2dc] bg-[#fcf8f4] shadow-2xl">
          <div className="container-page pb-8 pt-4">
            <div className="relative isolate flex min-h-[170px] flex-col justify-end overflow-hidden rounded-[1.6rem] bg-cover bg-center p-5 text-white sm:min-h-[205px] sm:p-7" style={{ backgroundImage: "linear-gradient(0deg,rgba(34,24,34,.88),rgba(34,24,34,.12)),url('/images/editorial/letter-flower.jpg')" }}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75">A small idea can mean a lot</p>
              <h2 className="mt-2 max-w-sm font-display text-2xl leading-tight sm:text-3xl">Where would you like to begin?</h2>
            </div>

            <nav aria-label="Explore Heartly" className="mt-5 divide-y divide-[#eee4dd] rounded-[1.5rem] border border-[#eee4dd] bg-white px-4">
              {links.map((link, index) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link key={link.href} href={link.href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined} className="group flex items-center gap-3.5 py-4">
                    <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl", active ? "bg-plum text-white" : "bg-[#f8eeeb] text-rose")}>
                      <link.icon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-sm font-semibold text-plum"><span className="text-[10px] font-medium text-ink-soft/55">0{index + 1}</span>{link.label}</span>
                      <span className="mt-0.5 block text-xs text-ink-soft">{link.note}</span>
                    </span>
                    <ArrowRight className="size-4 text-ink-soft/45 transition group-hover:translate-x-1 group-hover:text-rose" />
                  </Link>
                );
              })}
            </nav>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button asChild size="lg" className="h-12 rounded-2xl">
                <Link href="/create" onClick={() => setOpen(false)}>
                  {signedIn ? "Create a new gift" : "Create your first gift"}<ArrowRight />
                </Link>
              </Button>
              {!signedIn ? (
                <Button asChild size="lg" variant="outline" className="h-12 rounded-2xl border-[#e9ded8] bg-white">
                  <Link href="/login" onClick={() => setOpen(false)}>I already have an account</Link>
                </Button>
              ) : (
                <Button asChild size="lg" variant="outline" className="h-12 rounded-2xl border-[#e9ded8] bg-white">
                  <Link href="/dashboard" onClick={() => setOpen(false)}>Go to my gifts</Link>
                </Button>
              )}
            </div>
            {isAdmin ? (
              <Link href="/admin" onClick={() => setOpen(false)} className="mt-4 inline-flex items-center gap-2 px-1 text-sm font-semibold text-plum">
                <Shield className="size-4 text-rose" /> Open administration
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
