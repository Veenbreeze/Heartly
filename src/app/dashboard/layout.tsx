import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { UserMenu } from "@/components/site/user-menu";
import { Badge } from "@/components/ui/badge";
import { requireUser, getCurrentProfile, getEntitlements } from "@/lib/auth";
import { getDashboardStats } from "@/lib/gift/data";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const [profile, entitlements, stats] = await Promise.all([
    getCurrentProfile(),
    getEntitlements(user.id),
    getDashboardStats(user.id),
  ]);
  const name = profile?.full_name || user.email?.split("@")[0] || "There";
  const email = profile?.email || user.email || "";
  const isAdmin = profile?.role === "admin";

  return (
    <div className="min-h-screen bg-cream">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-white/70 px-4 py-5 backdrop-blur-xl lg:flex">
        <div className="px-2">
          <Logo />
        </div>
        <div className="mt-8 flex-1">
          <DashboardNav isAdmin={isAdmin} unread={stats.unread} />
        </div>
        <div className="mt-4 rounded-2xl border border-line bg-cream/80 p-3">
          <div className="flex items-center gap-2.5">
            <UserMenu
              name={name}
              email={email}
              avatarUrl={profile?.avatar_url}
              isAdmin={isAdmin}
              unread={stats.unread}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-plum">{name}</p>
              <p className="truncate text-[10px] text-ink-soft">{email}</p>
            </div>
            <Badge variant={entitlements.tier === "premium" ? "premium" : "outline"}>
              {entitlements.tier === "premium" ? "Premium" : "Free"}
            </Badge>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-line bg-cream/90 backdrop-blur-xl lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Logo size="sm" />
            <UserMenu
              name={name}
              email={email}
              avatarUrl={profile?.avatar_url}
              isAdmin={isAdmin}
              unread={stats.unread}
            />
          </div>
          <DashboardNav isAdmin={isAdmin} unread={stats.unread} compact />
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-9">
          {children}
        </main>

        <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 pb-8 text-[11px] text-ink-soft sm:px-6">
          <p>© {new Date().getFullYear()} Heartly</p>
          <div className="flex gap-4">
            <Link href="/legal/privacy" className="hover:text-plum">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:text-plum">
              Terms
            </Link>
            <Link href="/help" className="hover:text-plum">
              Help
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
