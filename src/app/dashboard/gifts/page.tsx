import type { Metadata } from "next";
import Link from "next/link";
import { Gift, Plus, Search } from "lucide-react";
import { DashboardGiftCard } from "@/components/dashboard/gift-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { requireUser } from "@/lib/auth";
import { listGiftsForUser } from "@/lib/gift/data";
import { cn } from "@/lib/utils";
import type { GiftStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "My gifts · Heartly",
  robots: { index: false, follow: false },
};

const filters: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Live" },
  { value: "draft", label: "Drafts" },
  { value: "unpublished", label: "Unpublished" },
  { value: "expired", label: "Expired" },
];

export default async function DashboardGiftsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const user = await requireUser();
  const { status = "all", q = "" } = await searchParams;
  const gifts = await listGiftsForUser(user.id, { limit: 200 });
  const counts = new Map<string, number>();
  for (const gift of gifts) {
    counts.set(gift.status, (counts.get(gift.status) ?? 0) + 1);
  }

  const query = q.trim().toLowerCase();
  const filtered = gifts.filter((gift) => {
    if (status !== "all" && gift.status !== status) return false;
    if (!query) return true;
    return [gift.title, gift.recipient_name, gift.templates?.name ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-plum">My gifts</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {gifts.length} {gifts.length === 1 ? "gift" : "gifts"} made with Heartly.
          </p>
        </div>
        <Button asChild>
          <Link href="/create">
            <Plus /> New gift
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-line bg-white/60 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
          {filters.map((filter) => {
            const count =
              filter.value === "all" ? gifts.length : (counts.get(filter.value) ?? 0);
            return (
              <Link
                key={filter.value}
                href={`/dashboard/gifts?status=${filter.value}${query ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition",
                  status === filter.value
                    ? "bg-plum text-white"
                    : "text-ink-soft hover:bg-blush hover:text-plum",
                )}
              >
                {filter.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[10px]",
                    status === filter.value ? "bg-white/15" : "bg-blush",
                  )}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>

        <form className="relative sm:w-64" action="/dashboard/gifts" method="get">
          {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft/60" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search gifts…"
            className="h-10 bg-white pl-9"
            aria-label="Search gifts"
          />
        </form>
      </div>

      {filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((gift) => (
            <DashboardGiftCard
              key={gift.id}
              gift={{
                id: gift.id,
                slug: gift.slug,
                title: gift.title,
                recipientName: gift.recipient_name,
                templateName: gift.templates?.name ?? "Heartly template",
                templateArtUrl: `/api/template-art/${gift.templates?.slug ?? "love-letter-classic"}`,
                status: gift.status as GiftStatus,
                viewCount: gift.view_count,
                updatedAt: gift.updated_at,
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Gift}
          title={gifts.length ? "Nothing matches that yet" : "Your first gift starts here"}
          description={
            gifts.length
              ? "Try another search or switch the filter."
              : "Choose a design, write a few words, and send something they can keep."
          }
          action={
            gifts.length ? (
              <Button asChild variant="outline">
                <Link href="/dashboard/gifts">Clear filters</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/create">
                  <Plus /> Make a gift
                </Link>
              </Button>
            )
          }
        />
      )}
    </div>
  );
}
