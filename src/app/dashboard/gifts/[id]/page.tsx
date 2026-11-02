import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  ExternalLink,
  MessageCircleHeart,
  Pencil,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getGiftAccess } from "@/lib/gift/access";
import { getGiftAnalytics } from "@/lib/gift/data";
import { safeGiftContent } from "@/lib/gift/schema";
import { formatDateTime, timeAgo } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Gift details · Heartly",
  robots: { index: false, follow: false },
};

const responseLabels: Record<string, string> = {
  accept: "Said yes",
  decline: "Could not make it",
  answer: "Answered",
  message: "Sent a message",
  reaction: "Reacted",
};

export default async function GiftDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const access = await getGiftAccess(id);
  if (!access || access.via !== "owner") notFound();

  const gift = access.gift;
  const analytics = await getGiftAnalytics(id);
  const content = safeGiftContent(gift.templates?.default_content, gift.content_data);

  const dailyMap = new Map(analytics.daily.map((day) => [day.date, day.views]));
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - (13 - index));
    const key = date.toISOString().slice(0, 10);
    return { key, label: date.toLocaleDateString("en", { day: "numeric" }), views: dailyMap.get(key) ?? 0 };
  });
  const peak = Math.max(1, ...days.map((day) => day.views));

  const responseCount = analytics.responses.length;
  const responseRate = analytics.totalViews
    ? Math.round((responseCount / analytics.totalViews) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/dashboard/gifts">
            <ArrowLeft /> My gifts
          </Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-4xl leading-tight text-plum">
                {gift.title || "Untitled gift"}
              </h1>
              <Badge variant={gift.status === "published" ? "success" : "outline"}>
                {gift.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-ink-soft">
              For {gift.recipient_name || "someone lovely"} ·{" "}
              {gift.templates?.name ?? "Heartly template"} · edited{" "}
              {timeAgo(gift.updated_at)}
            </p>
          </div>
          <div className="flex gap-2">
            {gift.status === "published" ? (
              <Button asChild variant="outline">
                <Link href={`/g/${gift.slug}`} target="_blank">
                  <ExternalLink /> Open
                </Link>
              </Button>
            ) : null}
            <Button asChild>
              <Link href={`/studio/${gift.id}`}>
                <Pencil /> Edit gift
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Views", value: analytics.totalViews, icon: Eye },
          { label: "Unique visitors", value: analytics.uniqueVisitors, icon: Users },
          { label: "Replies", value: responseCount, icon: MessageCircleHeart },
          { label: "Reply rate", value: `${responseRate}%`, icon: Sparkles },
        ].map((stat) => (
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
      </div>

      <section className="rounded-3xl border border-line bg-white/70 p-5 shadow-soft sm:p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-plum">Last 14 days</h2>
            <p className="text-xs text-ink-soft">Each visit is counted once per person per day.</p>
          </div>
          <p className="text-[11px] text-ink-soft">
            {analytics.lastViewedAt
              ? `Last opened ${timeAgo(analytics.lastViewedAt)}`
              : "Not opened yet"}
          </p>
        </div>
        <div className="mt-6 flex h-36 items-end gap-1.5">
          {days.map((day) => (
            <div key={day.key} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <span className="text-[9px] text-ink-soft opacity-0 transition group-hover:opacity-100">
                {day.views}
              </span>
              <div
                className="w-full rounded-t-md bg-rose/25 transition group-hover:bg-rose"
                style={{
                  height: `${Math.max(day.views ? 6 : 2, (day.views / peak) * 100)}%`,
                }}
              />
              <span className="text-[9px] text-ink-soft/70">{day.label}</span>
            </div>
          ))}
        </div>
        {analytics.totalViews === 0 ? (
          <p className="mt-3 text-center text-xs text-ink-soft">
            {gift.status === "published"
              ? "Share the link and the first visit will appear here."
              : "Publish this gift to start collecting views."}
          </p>
        ) : null}
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl text-plum">Replies</h2>
            <p className="text-xs text-ink-soft">
              What they sent back, in their own words.
            </p>
          </div>
          {responseCount ? <Badge variant="outline">{responseCount} total</Badge> : null}
        </div>

        {responseCount ? (
          <div className="space-y-3">
            {analytics.responses.map((response) => {
              const answers = Object.entries(response.response_data ?? {});
              return (
                <article
                  key={response.id}
                  className="rounded-3xl border border-line bg-white/70 p-5 shadow-soft"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-full bg-blush text-xs font-semibold text-plum">
                        {(response.respondent_name || "A").slice(0, 1).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-plum">
                          {response.respondent_name || "Anonymous"}
                        </p>
                        <p className="text-[10px] text-ink-soft">
                          {responseLabels[response.response_type] ?? "Replied"} ·{" "}
                          {timeAgo(response.created_at)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        response.response_type === "accept"
                          ? "success"
                          : response.response_type === "decline"
                            ? "danger"
                            : "outline"
                      }
                    >
                      {responseLabels[response.response_type] ?? "Reply"}
                    </Badge>
                  </div>
                  {response.message ? (
                    <p className="mt-4 whitespace-pre-line rounded-2xl bg-cream/70 px-4 py-3 text-sm leading-relaxed text-ink">
                      {response.message}
                    </p>
                  ) : null}
                  {answers.length ? (
                    <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                      {answers.map(([questionId, answer]) => {
                        const question = content.questions?.find(
                          (item) => item.id === questionId,
                        );
                        return (
                          <div
                            key={questionId}
                            className="rounded-xl border border-line bg-white/60 px-3 py-2"
                          >
                            <dt className="text-[10px] text-ink-soft">
                              {question?.question ?? "Answer"}
                            </dt>
                            <dd className="mt-0.5 font-medium text-plum">{answer}</dd>
                          </div>
                        );
                      })}
                    </dl>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={MessageCircleHeart}
            title="No replies yet"
            description={
              gift.status === "published"
                ? "When someone opens the gift and sends something back, it will appear here."
                : "Publish and share this gift to start receiving replies."
            }
          />
        )}
      </section>

      <p className="text-center text-[11px] text-ink-soft">
        {analytics.firstViewedAt
          ? `First opened ${formatDateTime(analytics.firstViewedAt)}`
          : "This gift has not been opened yet."}
      </p>
    </div>
  );
}
