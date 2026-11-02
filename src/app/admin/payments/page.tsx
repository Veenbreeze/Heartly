import { CreditCard, Wallet } from "lucide-react";
import { AdminPageHeader, AdminStat } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { listAdminPayments } from "@/lib/admin/data";
import { formatDateTime, formatMoney } from "@/lib/utils";

export const metadata = { title: "Payments · Admin · Heartly" };
export const dynamic = "force-dynamic";

const statusVariant = {
  succeeded: "success",
  pending: "warning",
  failed: "danger",
  refunded: "outline",
} as const;

export default async function AdminPaymentsPage() {
  const payments = await listAdminPayments();
  const succeeded = payments.filter((payment) => payment.status === "succeeded");
  const revenueTzs = succeeded
    .filter((payment) => payment.currency === "TZS")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const revenueUsd = succeeded
    .filter((payment) => payment.currency === "USD")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pending = payments.filter((payment) => payment.status === "pending").length;

  return (
    <div>
      <AdminPageHeader
        title="Payments"
        description="Successful revenue, pending checkouts and provider references."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <AdminStat
          label="Revenue (TZS)"
          value={formatMoney(revenueTzs, "TZS")}
          hint={`${succeeded.length} successful payments`}
          icon={Wallet}
          tone="success"
        />
        <AdminStat
          label="Revenue (USD)"
          value={formatMoney(revenueUsd, "USD")}
          hint="Successful payments"
          icon={CreditCard}
        />
        <AdminStat
          label="Pending"
          value={pending}
          hint="Awaiting provider confirmation"
          icon={CreditCard}
          tone={pending ? "warning" : "default"}
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-line bg-white/70 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b border-line bg-cream/60 text-[11px] uppercase tracking-wider text-ink-soft">
              <tr>
                <th className="px-5 py-3 font-semibold">Reference</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {payments.length ? (
                payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs font-semibold text-plum">
                        {payment.provider_reference}
                      </p>
                      <p className="mt-1 text-[11px] uppercase text-ink-soft">
                        {payment.provider}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <p className="font-medium text-plum">
                        {payment.profiles?.full_name || payment.profiles?.email || "Unknown"}
                      </p>
                      <p className="text-ink-soft">
                        {payment.user_id?.slice(0, 8) || "No account"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-xs text-ink-soft">
                      {payment.plans?.name ?? "Premium"}
                    </td>
                    <td className="px-4 py-4 text-xs font-semibold text-plum">
                      {formatMoney(payment.amount, payment.currency)}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariant[payment.status] ?? "outline"}>
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-xs text-ink-soft">
                      {formatDateTime(payment.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-ink-soft">
                    No payments yet.
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
