import Link from "next/link";
import { ExternalLink, Search, Trash2, Undo2 } from "lucide-react";
import {
  AdminPageHeader,
  GiftStatusBadge,
  VisibilityBadge,
} from "@/components/admin/admin-ui";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  adminDeleteGiftAction,
  adminUnpublishGiftAction,
} from "@/lib/actions/admin";
import { listAdminGifts } from "@/lib/admin/data";
import { cn, formatDate } from "@/lib/utils";

export const metadata = { title: "Gifts · Admin · Heartly" };
export const dynamic = "force-dynamic";

const filters = [
  { value: "all", label: "All" },
  { value: "published", label: "Live" },
  { value: "draft", label: "Drafts" },
  { value: "unpublished", label: "Unpublished" },
  { value: "expired", label: "Expired" },
];

export default async function AdminGiftsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status = "all" } = await searchParams;
  const gifts = await listAdminGifts({ query: q, status });

  return (
    <div>
      <AdminPageHeader
        title="Gifts"
        description="Inspect every gift, remove harmful content, or unpublish a live link."
      >
        <Badge variant="outline">{gifts.length} shown</Badge>
      </AdminPageHeader>

      <form className="mb-4 flex flex-wrap items-center gap-2">
        <input type="hidden" name="status" value={status} />
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search title, recipient, slug or template"
            className="h-11 w-full rounded-full border border-line bg-white/80 pl-9 pr-4 text-sm outline-none transition placeholder:text-ink-soft/70 focus:border-rose/40 focus:ring-4 focus:ring-rose/10"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {filters.map((filter) => (
          <Link
            key={filter.value}
            href={`/admin/gifts?status=${filter.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              status === filter.value
                ? "border-plum bg-plum text-white"
                : "border-line bg-white/60 text-ink-soft hover:border-rose/30",
            )}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border border-line bg-white/70 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="border-b border-line bg-cream/60 text-[11px] uppercase tracking-wider text-ink-soft">
              <tr>
                <th className="px-5 py-3 font-semibold">Gift</th>
                <th className="px-4 py-3 font-semibold">Template</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Views</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-5 py-3 text-right font-semibold">Moderate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {gifts.length ? (
                gifts.map((gift) => (
                  <tr key={gift.id} className="align-top">
                    <td className="px-5 py-4">
                      <Link
                        href={`/g/${gift.slug}`}
                        target="_blank"
                        className="font-semibold text-plum hover:text-rose"
                      >
                        {gift.title}
                      </Link>
                      <p className="mt-1 text-xs text-ink-soft">
                        For {gift.recipient_name} · /g/{gift.slug}
                      </p>
                      <div className="mt-2">
                        <VisibilityBadge visibility={gift.visibility} />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-ink-soft">
                      {gift.templates?.name ?? "Unknown"}
                    </td>
                    <td className="px-4 py-4">
                      <GiftStatusBadge status={gift.status} />
                    </td>
                    <td className="px-4 py-4 text-xs text-ink-soft">
                      {gift.view_count}
                    </td>
                    <td className="px-4 py-4 text-xs text-ink-soft">
                      {formatDate(gift.created_at)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <details className="relative inline-block text-left">
                        <summary className="cursor-pointer list-none rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-rose/30 hover:text-rose">
                          Actions
                        </summary>
                        <div className="mt-2 w-64 space-y-3 rounded-2xl border border-line bg-white p-3 text-left shadow-soft">
                          <Link
                            href={`/g/${gift.slug}`}
                            target="_blank"
                            className="flex items-center gap-2 text-xs font-medium text-ink-soft hover:text-plum"
                          >
                            <ExternalLink className="size-3.5" /> Open public page
                          </Link>
                          {gift.status === "published" ? (
                            <form action={adminUnpublishGiftAction} className="space-y-2">
                              <input type="hidden" name="giftId" value={gift.id} />
                              <input
                                name="reason"
                                placeholder="Reason (optional)"
                                className="h-8 w-full rounded-lg border border-line px-2 text-xs outline-none focus:border-rose/40"
                              />
                              <Button
                                type="submit"
                                size="sm"
                                variant="outline"
                                className="w-full"
                              >
                                <Undo2 /> Unpublish
                              </Button>
                            </form>
                          ) : null}
                          <form action={adminDeleteGiftAction}>
                            <input type="hidden" name="giftId" value={gift.id} />
                            <ConfirmSubmitButton
                              type="submit"
                              size="sm"
                              variant="destructive"
                              className="w-full"
                              message={`Permanently delete “${gift.title}”? This cannot be undone.`}
                            >
                              <Trash2 /> Delete gift
                            </ConfirmSubmitButton>
                          </form>
                        </div>
                      </details>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-ink-soft">
                    No gifts match this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
