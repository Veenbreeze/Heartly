"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

const links = [
  { href: "/explore", label: "Explore gifts" },
  { href: "/categories", label: "Categories" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
];

interface MobileNavProps {
  signedIn: boolean;
}

export function MobileNav({ signedIn }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex size-10 items-center justify-center rounded-full border border-line bg-white/70 text-plum"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open ? (
        <div className="fixed inset-x-0 top-[73px] z-40 border-b border-line bg-cream/98 px-5 pb-8 pt-4 shadow-soft backdrop-blur-xl">
          <nav className="flex flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-line/70 py-4 text-base text-ink transition hover:text-rose"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            <Button asChild size="lg" onClick={() => setOpen(false)}>
              <Link href={signedIn ? "/dashboard" : "/register"}>
                {signedIn ? "Go to dashboard" : "Create a free gift"}
              </Link>
            </Button>
            {!signedIn ? (
              <Button asChild variant="outline" size="lg">
                <Link href="/login" onClick={() => setOpen(false)}>
                  Log in
                </Link>
              </Button>
            ) : null}
          </div>
          <div className="mt-8 flex justify-center opacity-60">
            <Logo size="sm" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
