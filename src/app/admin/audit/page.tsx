import { ScrollText } from "lucide-react";
import { AdminPageHeader, AdminStat } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { listAuditLogs } from "@/lib/admin/data";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Audit log · Admin · Heartly" };
export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const logs = await listAuditLogs();

  return (
    <div>
      <AdminPageHeader
        title="Audit log"
        description="A record of sensitive administrative and account actions."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <AdminStat label="Events" value={logs.length} icon={ScrollText} />
        <AdminStat
          label="Entities"
          value={new Set(logs.map((log) => log.entity_type)).size}
          icon={ScrollText}
          tone="rose"
        />
        <AdminStat
          label="Actors"
          value={new Set(logs.map((log) => log.actor_id).filter(Boolean)).size}
          icon={ScrollText}
          tone="success"
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-line bg-white/70 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-line bg-cream/60 text-[11px] uppercase tracking-wider text-ink-soft">
              <tr>
                <th className="px-5 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">Entity</th>
                <th className="px-4 py-3 font-semibold">Actor</th>
                <th className="px-5 py-3 font-semibold">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {logs.length ? (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs font-semibold text-plum">
                        {log.action}
                      </p>
                      {Object.keys(log.metadata ?? {}).length ? (
                        <p className="mt-1 max-w-md truncate text-[11px] text-ink-soft">
                          {JSON.stringify(log.metadata)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="outline">{log.entity_type}</Badge>
                      {log.entity_id ? (
                        <p className="mt-1 max-w-40 truncate font-mono text-[10px] text-ink-soft">
                          {log.entity_id}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 font-mono text-[11px] text-ink-soft">
                      {log.actor_id?.slice(0, 8) ?? "system"}
                    </td>
                    <td className="px-5 py-4 text-xs text-ink-soft">
                      {formatDateTime(log.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm text-ink-soft">
                    No audit events recorded yet.
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
