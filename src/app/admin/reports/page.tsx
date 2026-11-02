import Link from "next/link";
import { Check, Flag } from "lucide-react";
import {
  AdminPageHeader,
  AdminStat,
  GiftStatusBadge,
  ReportStatusBadge,
} from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminUpdateReportAction } from "@/lib/actions/admin";
import { listAdminReports } from "@/lib/admin/data";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Reports · Admin · Heartly" };
export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const reports = await listAdminReports();
  const open = reports.filter((report) => report.status === "open").length;
  const reviewing = reports.filter((report) => report.status === "reviewing").length;
  const closed = reports.filter(
    (report) => report.status === "resolved" || report.status === "dismissed",
  ).length;

  return (
    <div>
      <AdminPageHeader
        title="Reports"
        description="Review abuse and safety reports, add notes and close the loop."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <AdminStat label="Open" value={open} icon={Flag} tone="warning" />
        <AdminStat label="Reviewing" value={reviewing} icon={Flag} tone="rose" />
        <AdminStat label="Closed" value={closed} icon={Check} tone="success" />
      </div>

      <div className="space-y-3">
        {reports.length ? (
          reports.map((report) => (
            <article
              key={report.id}
              className="rounded-3xl border border-line bg-white/70 p-5 shadow-soft"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <ReportStatusBadge status={report.status} />
                    <Badge variant="outline">
                      {report.reason.replaceAll("_", " ")}
                    </Badge>
                    <span className="text-[11px] text-ink-soft">
                      {formatDateTime(report.created_at)}
                    </span>
                  </div>
                  <p className="mt-3 font-semibold text-plum">
                    {report.gifts ? (
                      <Link
                        href={`/g/${report.gifts.slug}`}
                        target="_blank"
                        className="hover:text-rose"
                      >
                        {report.gifts.title}
                      </Link>
                    ) : (
                      "Gift no longer exists"
                    )}
                  </p>
                  {report.gifts ? (
                    <div className="mt-2 flex gap-2">
                      <GiftStatusBadge status={report.gifts.status} />
                    </div>
                  ) : null}
                </div>
                <p className="text-xs text-ink-soft">
                  Reporter {report.reporter_id?.slice(0, 8) ?? "guest"}
                </p>
              </div>

              {report.details ? (
                <p className="mt-4 rounded-2xl bg-cream/70 px-4 py-3 text-sm leading-relaxed text-ink-soft">
                  {report.details}
                </p>
              ) : null}

              {report.resolution_notes ? (
                <p className="mt-3 text-xs text-ink-soft">
                  <span className="font-semibold text-plum">Resolution:</span>{" "}
                  {report.resolution_notes}
                </p>
              ) : null}

              <form
                action={adminUpdateReportAction}
                className="mt-4 flex flex-wrap items-end gap-2 border-t border-line/70 pt-4"
              >
                <input type="hidden" name="reportId" value={report.id} />
                <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
                  Status
                  <select
                    name="status"
                    defaultValue={report.status}
                    className="mt-1 block h-9 rounded-lg border border-line bg-white px-2 text-xs font-normal normal-case tracking-normal outline-none focus:border-rose/40"
                  >
                    <option value="open">Open</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </label>
                <label className="min-w-52 flex-1 text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
                  Notes
                  <input
                    name="notes"
                    defaultValue={report.resolution_notes ?? ""}
                    placeholder="What action was taken?"
                    className="mt-1 h-9 w-full rounded-lg border border-line bg-white px-2 text-xs font-normal normal-case tracking-normal outline-none focus:border-rose/40"
                  />
                </label>
                <Button type="submit" size="sm" variant="outline">
                  Save
                </Button>
              </form>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-line bg-white/60 px-6 py-12 text-center text-sm text-ink-soft">
            No reports have been submitted.
          </div>
        )}
      </div>
    </div>
  );
}
