"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  CreditCard,
  Gift,
  LayoutDashboard,
  Plus,
  Settings,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/gifts", label: "My gifts", icon: Gift },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardNav({
  isAdmin,
  unread = 0,
  compact = false,
}: {
  isAdmin?: boolean;
  unread?: number;
  compact?: boolean;
}) {
  const pathname = usePathname();

  if (compact) {
    return (
      <nav
        aria-label="Dashboard"
        className="flex gap-1 overflow-x-auto px-4 pb-2 [scrollbar-width:none]"
      >
        {links.map((link) => {
          const active =
            link.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition",
                active ? "bg-plum text-white" : "bg-white/60 text-ink-soft",
              )}
            >
              <link.icon className="size-3.5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav aria-label="Dashboard" className="space-y-1">
      {links.map((link) => {
        const active =
          link.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
              active
                ? "bg-plum text-white shadow-sm"
                : "text-ink-soft hover:bg-blush/70 hover:text-plum",
            )}
          >
            <link.icon className="size-4" />
            <span className="flex-1">{link.label}</span>
            {link.href === "/dashboard/notifications" && unread > 0 ? (
              <span
                className={cn(
                  "flex min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                  active ? "bg-white/20 text-white" : "bg-rose text-white",
                )}
              >
                {unread > 9 ? "9+" : unread}
              </span>
            ) : null}
          </Link>
        );
      })}
      {isAdmin ? (
        <Link
          href="/admin"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
            pathname.startsWith("/admin")
              ? "bg-plum text-white shadow-sm"
              : "text-ink-soft hover:bg-blush/70 hover:text-plum",
          )}
        >
          <Shield className="size-4" />
          Admin
        </Link>
      ) : null}
      <Link
        href="/create"
        className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-petal bg-blush/60 px-3 py-2.5 text-sm font-medium text-plum transition hover:border-rose/40 hover:bg-blush"
      >
        <Plus className="size-4" /> New gift
      </Link>
    </nav>
  );
}
