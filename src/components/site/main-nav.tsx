"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, CalendarHeart, CircleHelp, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/explore", label: "Discover", detail: "Browse designs", icon: Compass },
  { href: "/categories", label: "Occasions", detail: "Find your moment", icon: CalendarHeart },
  { href: "/how-it-works", label: "How it works", detail: "Three easy steps", icon: BookOpenText },
  { href: "/pricing", label: "Pricing", detail: "Free to begin", icon: CircleHelp },
];

export function MainNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden items-center gap-1 rounded-[1.25rem] border border-[#ece2dc] bg-[#f7f2ee] p-1.5 lg:flex">
      {links.map((link, index) => {
        const active = link.href === "/explore"
          ? pathname === "/explore"
          : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition duration-200",
              active ? "bg-white text-plum shadow-sm ring-1 ring-[#eee5df]" : "text-ink-soft hover:bg-white/70 hover:text-plum",
            )}
          >
            <span className={cn("flex size-8 items-center justify-center rounded-lg transition", active ? "bg-[#f9e6e7] text-rose" : "bg-white/65 text-ink-soft group-hover:text-rose")}>
              <link.icon className="size-4" />
            </span>
            <span className="text-left">
              <span className="block text-xs font-semibold">{link.label}</span>
              <span className="block text-[10px] text-ink-soft/75">0{index + 1} · {link.detail}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
