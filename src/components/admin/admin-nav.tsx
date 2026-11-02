"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Flag,
  Gift,
  LayoutDashboard,
  ScrollText,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/gifts", label: "Gifts", icon: Gift },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/audit", label: "Audit log", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === "/admin" ? pathname === href : pathname.startsWith(href);
  }

  if (compact) {
    return (
      <nav
        aria-label="Admin"
        className="flex gap-1 overflow-x-auto px-4 pb-2 [scrollbar-width:none]"
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition",
              isActive(link.href)
                ? "bg-plum text-white"
                : "bg-white/60 text-ink-soft",
            )}
          >
            <link.icon className="size-3.5" />
            {link.label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav aria-label="Admin" className="space-y-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
            isActive(link.href)
              ? "bg-plum text-white shadow-sm"
              : "text-ink-soft hover:bg-blush/70 hover:text-plum",
          )}
        >
          <link.icon className="size-4" />
          <span className="flex-1">{link.label}</span>
        </Link>
      ))}
      <Link
        href="/dashboard"
        className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-white/60 px-3 py-2.5 text-xs font-medium text-ink-soft transition hover:border-rose/30 hover:text-plum"
      >
        <ArrowLeft className="size-4" /> Back to dashboard
      </Link>
    </nav>
  );
}
