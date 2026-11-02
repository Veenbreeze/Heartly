import { ShieldCheck, UserRound, Users } from "lucide-react";
import { AdminPageHeader, AdminStat } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminUpdateUserRoleAction } from "@/lib/actions/admin";
import { listAdminUsers } from "@/lib/admin/data";
import { formatDate, initials } from "@/lib/utils";

export const metadata = { title: "Users · Admin · Heartly" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  const { error, updated } = await searchParams;
  const users = await listAdminUsers();
  const admins = users.filter((user) => user.role === "admin").length;
  const onboarded = users.filter((user) => user.onboarded_at).length;

  return (
    <div>
      <AdminPageHeader
        title="Users"
        description="Browse accounts and manage administrator access."
      />

      {error ? (
        <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {updated ? (
        <p className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Role updated.
        </p>
      ) : null}

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <AdminStat label="Accounts" value={users.length} icon={Users} />
        <AdminStat label="Administrators" value={admins} icon={ShieldCheck} tone="rose" />
        <AdminStat label="Onboarded" value={onboarded} icon={UserRound} tone="success" />
      </div>

      <div className="overflow-hidden rounded-3xl border border-line bg-white/70 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="border-b border-line bg-cream/60 text-[11px] uppercase tracking-wider text-ink-soft">
              <tr>
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Locale</th>
                <th className="px-4 py-3 font-semibold">Currency</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-5 py-3 text-right font-semibold">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {users.length ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-full bg-blush font-display text-sm text-plum">
                          {initials(user.full_name, user.email)}
                        </span>
                        <div>
                          <p className="font-semibold text-plum">
                            {user.full_name || "Unnamed user"}
                          </p>
                          <p className="text-xs text-ink-soft">
                            {user.email || "No email"} · {user.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs uppercase text-ink-soft">
                      {user.locale}
                    </td>
                    <td className="px-4 py-4 text-xs text-ink-soft">{user.currency}</td>
                    <td className="px-4 py-4 text-xs text-ink-soft">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Badge variant={user.role === "admin" ? "premium" : "outline"}>
                          {user.role}
                        </Badge>
                        <form action={adminUpdateUserRoleAction} className="flex gap-1.5">
                          <input type="hidden" name="userId" value={user.id} />
                          <select
                            name="role"
                            defaultValue={user.role}
                            className="h-8 rounded-lg border border-line bg-white px-2 text-xs outline-none focus:border-rose/40"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                          <Button type="submit" size="icon-sm" variant="outline" title="Save role">
                            <ShieldCheck />
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-ink-soft">
                    No users yet.
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
