import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  Gift,
  MessageCircleHeart,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { DashboardGiftCard } from "@/components/dashboard/gift-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser, getCurrentProfile, getEntitlements } from "@/lib/auth";
import { getDashboardStats, listGiftsForUser } from "@/lib/gift/data";

export const metadata: Metadata = {
  title: "Dashboard · Heartly",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const user = await requireUser();
  const [profile, entitlements, stats, gifts] = await Promise.all([
    getCurrentProfile(),
    getEntitlements(user.id),
    getDashboardStats(user.id),
    listGiftsForUser(user.id, { limit: 4 }),
  ]);

  const firstName = (profile?.full_name || user.email || "there").split(" ")[0];
  const statCards = [
    { label: "Gifts made", value: stats.total, icon: Gift },
    { label: "Live gifts", value: stats.published, icon: Sparkles },
    { label: "Total views", value: stats.views, icon: Eye },
    { label: "Replies", value: stats.responses, icon: MessageCircleHeart },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose">
            Your space
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-plum sm:text-5xl">
            Hello, {firstName}.
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Every gift you make starts with a small, brave moment.
          </p>
        </div>
        <Button asChild>
          <Link href="/create">
            <Plus /> Make a gift
          </Link>
        </Button>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-line bg-white/70 p-5 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-soft">{stat.label}</span>
              <stat.icon className="size-4 text-rose" />
            </div>
            <p className="mt-3 font-display text-3xl text-plum">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="relative overflow-hidden rounded-[2rem] border border-plum/10 bg-plum p-7 text-white shadow-lift sm:p-9">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-16 size-56 rounded-full bg-rose/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 left-10 size-44 rounded-full bg-petal/20 blur-3xl"
          />
          <div className="relative max-w-md">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/80">
              <TrendingUp className="size-3" /> A little nudge
            </span>
            <h2 className="mt-4 font-display text-3xl leading-tight sm:text-4xl">
              {stats.drafts > 0
                ? `${stats.drafts} ${stats.drafts === 1 ? "gift is" : "gifts are"} waiting for your words.`
                : "Someone is worth a whole page."}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              {stats.drafts > 0
                ? "Finish a draft and turn it into something they can open."
                : "Start with a template, add a photo and a few honest lines. Heartly does the rest."}
            </p>
            <Button asChild variant="secondary" className="mt-6 bg-white text-plum hover:bg-blush">
              <Link href={stats.drafts > 0 ? "/dashboard/gifts?status=draft" : "/create"}>
                {stats.drafts > 0 ? "Finish a draft" : "Start a gift"} <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-line bg-white/70 p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">
            Your plan
          </p>
          <h2 className="mt-2 font-display text-2xl text-plum">
            {entitlements.planName || (entitlements.tier === "premium" ? "Premium" : "Free")}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            {entitlements.tier === "premium"
              ? "All templates, music, scheduled delivery and QR codes are unlocked."
              : `Free gifts include ${entitlements.maxMedia} photos, basic animations and ${entitlements.maxActiveGifts} live gifts.`}
          </p>
          <div className="mt-5 space-y-2">
            {[
              entitlements.tier === "premium" ? "All premium templates" : "Free templates",
              `${entitlements.maxMedia} photos per gift`,
              `${entitlements.maxActiveGifts} live gifts`,
              entitlements.can("music") ? "Background music" : "Music with Premium",
            ].map((item) => (
              <p key={item} className="flex items-center gap-2 text-xs text-ink-soft">
                <span className="size-1.5 rounded-full bg-rose" /> {item}
              </p>
            ))}
          </div>
          {entitlements.tier !== "premium" ? (
            <Button asChild variant="outline" size="sm" className="mt-5 w-full">
              <Link href="/pricing">
                See Premium <ArrowRight />
              </Link>
            </Button>
          ) : null}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-plum">Recent gifts</h2>
            <p className="text-xs text-ink-soft">Pick up where you left off.</p>
          </div>
          {gifts.length ? (
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/gifts">
                View all <ArrowRight />
              </Link>
            </Button>
          ) : null}
        </div>

        {gifts.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {gifts.map((gift) => (
              <DashboardGiftCard
                key={gift.id}
                gift={{
                  id: gift.id,
                  slug: gift.slug,
                  title: gift.title,
                  recipientName: gift.recipient_name,
                  templateName: gift.templates?.name ?? "Heartly template",
                  templateArtUrl: `/api/template-art/${gift.templates?.slug ?? "love-letter-classic"}`,
                  status: gift.status,
                  viewCount: gift.view_count,
                  updatedAt: gift.updated_at,
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Gift}
            title="No gifts yet"
            description="The first one is always the hardest. Choose a template and write from the heart."
            action={
              <Button asChild>
                <Link href="/create">
                  <Plus /> Make your first gift
                </Link>
              </Button>
            }
          />
        )}
      </section>
    </div>
  );
}
