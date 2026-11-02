import Link from "next/link";
import { Bell, Plus } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/site/mobile-nav";
import { UserMenu } from "@/components/site/user-menu";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const links = [
  { href: "/explore", label: "Explore gifts" },
  { href: "/categories", label: "Categories" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
];

async function unreadCount(userId: string | undefined): Promise<number> {
  if (!userId) return 0;
  const supabase = await getSupabaseServerClient();
  if (!supabase) return 0;
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);
  return count ?? 0;
}

export async function SiteHeader() {
  const user = await getCurrentUser();
  const profile = user ? await getCurrentProfile() : null;
  const unread = await unreadCount(user?.id);
  const displayName = profile?.full_name ?? user?.email?.split("@")[0] ?? "Friend";

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/85 backdrop-blur-xl">
      <div className="container-page flex h-[73px] items-center justify-between gap-6">
        <Logo size="sm" />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm text-ink-soft transition hover:bg-blush/70 hover:text-plum"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard/notifications"
                className="relative hidden size-10 items-center justify-center rounded-full border border-line bg-white/70 text-ink-soft transition hover:border-rose/40 hover:text-plum sm:flex"
                aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
              >
                <Bell className="size-4" />
                {unread > 0 ? (
                  <span className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[10px] font-semibold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                ) : null}
              </Link>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/create">
                  <Plus /> New gift
                </Link>
              </Button>
              <UserMenu
                name={displayName}
                email={user.email ?? ""}
                avatarUrl={profile?.avatar_url}
                isAdmin={profile?.role === "admin"}
                unread={unread}
              />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/register">Create a free gift</Link>
              </Button>
            </>
          )}
          <MobileNav signedIn={Boolean(user)} />
        </div>
      </div>
    </header>
  );
}
