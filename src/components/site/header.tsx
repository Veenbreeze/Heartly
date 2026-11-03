import Link from "next/link";
import { Bell, Plus } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/site/mobile-nav";
import { MainNav } from "@/components/site/main-nav";
import { UserMenu } from "@/components/site/user-menu";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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
    <header className="sticky top-0 z-40 border-b border-[#ece2dc] bg-[#fffdfa]/95 backdrop-blur-xl">
      <div className="container-page flex h-[82px] items-center justify-between gap-3 lg:gap-6">
        <Logo size="default" className="shrink-0" />
        <MainNav />
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
              <div className="flex items-center gap-1.5 sm:hidden">
                <Button asChild variant="ghost" size="sm" className="h-9 px-2.5 text-xs">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild size="sm" className="h-9 rounded-xl px-3 text-xs">
                  <Link href="/create">
                    <Plus className="size-3.5" /> Start
                  </Link>
                </Button>
              </div>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/register">Create a free gift</Link>
              </Button>
            </>
          )}
          <MobileNav signedIn={Boolean(user)} isAdmin={profile?.role === "admin"} />
        </div>
      </div>
      <span className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-[#dba5a0]/55 to-transparent" />
    </header>
  );
}
