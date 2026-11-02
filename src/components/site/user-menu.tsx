"use client";

import Link from "next/link";
import {
  BarChart3,
  Gift,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/lib/actions/auth";
import { initials } from "@/lib/utils";

interface UserMenuProps {
  name: string;
  email: string;
  avatarUrl?: string | null;
  isAdmin?: boolean;
  unread?: number;
}

export function UserMenu({ name, email, avatarUrl, isAdmin, unread = 0 }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex size-10 items-center justify-center overflow-hidden rounded-full border border-line bg-blush text-sm font-semibold text-plum transition hover:border-rose/50"
          aria-label="Open account menu"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            initials(name || email)
          )}
          {unread > 0 ? (
            <span className="absolute right-0 top-0 size-2.5 rounded-full bg-rose ring-2 ring-cream" />
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="normal-case tracking-normal">
          <span className="block truncate text-sm font-semibold text-plum">{name}</span>
          <span className="block truncate text-xs font-normal text-ink-soft">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <LayoutDashboard /> Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/gifts">
            <Gift /> My gifts
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/analytics">
            <BarChart3 /> Analytics
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <Settings /> Settings
          </Link>
        </DropdownMenuItem>
        {isAdmin ? (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <Shield /> Admin
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-blush hover:text-plum"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
