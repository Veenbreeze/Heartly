import type { Metadata } from "next";
import Link from "next/link";
import { Shield } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAdmin();

  return (
    <div className="min-h-screen bg-cream">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-white/70 px-4 py-5 backdrop-blur-xl lg:flex">
        <div className="flex items-center justify-between px-2">
          <Logo />
          <Badge variant="premium">
            <Shield /> Admin
          </Badge>
        </div>
        <div className="mt-8 flex-1">
          <AdminNav />
        </div>
        <div className="rounded-2xl border border-line bg-cream/80 p-3">
          <p className="truncate text-xs font-semibold text-plum">
            {profile.full_name || profile.email || "Administrator"}
          </p>
          <p className="truncate text-[10px] text-ink-soft">{profile.email}</p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-line bg-cream/90 backdrop-blur-xl lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Logo size="sm" />
            <Badge variant="premium">
              <Shield /> Admin
            </Badge>
          </div>
          <AdminNav compact />
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-9">
          {children}
        </main>

        <footer className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 pb-8 text-[11px] text-ink-soft sm:px-6">
          <p>Heartly administration · actions are recorded in the audit log</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-plum">
              View site
            </Link>
            <Link href="/dashboard" className="hover:text-plum">
              Dashboard
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
