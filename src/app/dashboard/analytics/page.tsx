import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Eye, MessageCircleHeart, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser, getEntitlements } from "@/lib/auth";
import { getDashboardStats, listGiftsForUser } from "@/lib/gift/data";

export const metadata: Metadata = {
  title: "Analytics · Heartly",
  robots: { index: false, follow: false },
};

export default async function AnalyticsPage() {
  const user = await requireUser();
  const [stats, gifts, entitlements] = await Promise.all([
    getDashboardStats(user.id),
    listGiftsForUser(user.id, { limit: 100 }),
    getEntitlements(user.id),
  ]);

  const published = gifts.filter((gift) => gift.status === "published");
  const ranked = [...gifts].sort((a, b) => b.view_count - a.view_count);
  const peak = Math.max(1, ...ranked.map((gift) => gift.view_count));
  const average = published.length
    ? Math.round(published.reduce((sum, gift) => sum + gift.view_count, 0) / published.length)
    : 0;

  const summary = [
    { label: "Total views", value: stats.views, icon: Eye },
    { label: "Replies", value: stats.responses, icon: MessageCircleHeart },
    { label: "Average per live gift", value: average, icon: Sparkles },
    { label: "Live gifts", value: stats.published, icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-plum">Analytics</h1>
        <p className="mt-1 text-sm text-ink-soft">
          A quiet look at who opened your gifts and what they sent back.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-line bg-white/70 p-5 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-soft">{item.label}</span>
              <item.icon className="size-4 text-rose" />
            </div>
            <p className="mt-3 font-display text-3xl text-plum">{item.value}</p>
          </div>
        ))}
      </div>

      {ranked.length ? (
        <section className="rounded-3xl border border-line bg-white/70 p-5 shadow-soft sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-display text-2xl text-plum">Gifts by views</h2>
              <p className="text-xs text-ink-soft">
                Open a gift for 14-day trends, unique visitors and replies.
              </p>
            </div>
            {entitlements.tier !== "premium" ? (
              <Badge variant="premium">Premium adds deeper history</Badge>
            ) : null}
          </div>

          <div className="mt-6 space-y-4">
            {ranked.map((gift) => (
              <div key={gift.id}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                  <Link
                    href={`/dashboard/gifts/${gift.id}`}
                    className="truncate font-medium text-plum hover:text-rose"
                  >
                    {gift.title || "Untitled gift"}
                    <span className="ml-2 font-normal text-ink-soft">
                      for {gift.recipient_name || "someone"}
                    </span>
                  </Link>
                  <span className="shrink-0 text-ink-soft">
                    {gift.view_count} {gift.view_count === 1 ? "view" : "views"}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-blush">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose to-plum transition-all"
                    style={{
                      width: `${Math.max(gift.view_count ? 4 : 0, (gift.view_count / peak) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          icon={BarChart3}
          title="Your story starts with one gift"
          description="Make and publish a gift, then come back to see how it lands."
          action={
            <Button asChild>
              <Link href="/create">
                Make a gift <ArrowRight />
              </Link>
            </Button>
          }
        />
      )}

      <div className="rounded-2xl border border-line bg-cream/60 px-5 py-4 text-xs leading-relaxed text-ink-soft">
        Views are counted once per visitor per day. We never show the identity of
        a recipient, and we do not use invasive tracking pixels.
      </div>
    </div>
  );
}
