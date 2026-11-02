import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  Flag,
  Gift,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminStat,
  GiftStatusBadge,
  ReportStatusBadge,
} from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdminOverview } from "@/lib/admin/data";
import { formatMoney, timeAgo } from "@/lib/utils";

export const metadata = { title: "Admin overview · Heartly" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const data = await getAdminOverview();

  if (!data) {
    return (
      <div>
        <AdminPageHeader
          title="Overview"
          description="Platform health, recent activity and moderation queue."
        />
        <div className="rounded-3xl border border-dashed border-line bg-white/60 p-10 text-center">
          <ShieldCheck className="mx-auto size-10 text-plum" />
          <h2 className="mt-4 font-display text-2xl text-plum">
            Supabase is not configured.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            Add `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to
            enable administration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Overview"
        description="Platform health, recent activity and moderation queue."
      >
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/gifts">
            Manage gifts <ArrowRight />
          </Link>
        </Button>
      </AdminPageHeader>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStat
          label="Users"
          value={data.users}
          hint={`${data.admins} administrator${data.admins === 1 ? "" : "s"}`}
          icon={Users}
        />
        <AdminStat
          label="Gifts"
          value={data.gifts}
          hint={`${data.published} live · ${data.responses} responses`}
          icon={Gift}
          tone="rose"
        />
        <AdminStat
          label="Premium subscribers"
          value={data.activeSubscriptions}
          hint="Active subscriptions"
          icon={Sparkles}
          tone="success"
        />
        <AdminStat
          label="Open reports"
          value={data.openReports}
          hint="Awaiting review"
          icon={Flag}
          tone={data.openReports ? "warning" : "default"}
        />
        <AdminStat
          label="Revenue (TZS)"
          value={formatMoney(data.revenueTzs, "TZS", { compact: true })}
          hint="Successful payments"
          icon={Wallet}
          tone="success"
        />
        <AdminStat
          label="Revenue (USD)"
          value={formatMoney(data.revenueUsd, "USD", { compact: true })}
          hint="Successful payments"
          icon={CreditCard}
        />
        <AdminStat
          label="Responses"
          value={data.responses}
          hint="Messages received on gifts"
          icon={MessageSquare}
        />
        <AdminStat
          label="Live share"
          value={
            data.gifts ? `${Math.round((data.published / data.gifts) * 100)}%` : "0%"
          }
          hint="Published versus all gifts"
          icon={Gift}
          tone="rose"
        />
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="overflow-hidden rounded-3xl border border-line bg-white/70 shadow-soft">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h2 className="font-display text-xl text-plum">Recent gifts</h2>
              <p className="text-xs text-ink-soft">Newest creations across the platform</p>
            </div>
            <Link
              href="/admin/gifts"
              className="text-xs font-semibold text-rose hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-line/70">
            {data.recentGifts.length ? (
              data.recentGifts.map((gift) => (
                <div
                  key={gift.id}
                  className="flex flex-wrap items-center gap-3 px-5 py-3.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-plum">
                        {gift.title}
                      </p>
                      <GiftStatusBadge status={gift.status} />
                    </div>
                    <p className="mt-1 truncate text-xs text-ink-soft">
                      For {gift.recipient_name} · {gift.templates?.name ?? "Template"} ·{" "}
                      {timeAgo(gift.created_at)}
                    </p>
                  </div>
                  <Link
                    href={`/g/${gift.slug}`}
                    target="_blank"
                    className="text-xs font-medium text-rose hover:underline"
                  >
                    Open
                  </Link>
                </div>
              ))
            ) : (
              <p className="px-5 py-8 text-center text-sm text-ink-soft">
                No gifts yet.
              </p>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-line bg-white/70 shadow-soft">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h2 className="font-display text-xl text-plum">Moderation queue</h2>
              <p className="text-xs text-ink-soft">Reports needing attention</p>
            </div>
            <Badge variant={data.openReports ? "danger" : "success"}>
              {data.openReports} open
            </Badge>
          </div>
          <div className="divide-y divide-line/70">
            {data.recentReports.length ? (
              data.recentReports.map((report) => (
                <Link
                  key={report.id}
                  href="/admin/reports"
                  className="block px-5 py-3.5 transition hover:bg-blush/30"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-plum">
                      {report.reason.replaceAll("_", " ")}
                    </p>
                    <ReportStatusBadge status={report.status} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-soft">
                    {report.gifts?.title ?? "Gift removed"} · {timeAgo(report.created_at)}
                  </p>
                </Link>
              ))
            ) : (
              <p className="px-5 py-8 text-center text-sm text-ink-soft">
                The queue is clear.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
