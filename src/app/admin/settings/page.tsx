import { Settings } from "lucide-react";
import { AdminPageHeader, AdminStat } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { adminUpdateSettingAction } from "@/lib/actions/admin";
import { listPlatformSettings } from "@/lib/admin/data";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Settings · Admin · Heartly" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await listPlatformSettings();

  return (
    <div>
      <AdminPageHeader
        title="Platform settings"
        description="Configuration values are stored as JSON and applied across the product."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <AdminStat label="Settings" value={settings.length} icon={Settings} />
        <AdminStat
          label="Last updated"
          value={
            settings.length
              ? formatDateTime(
                  settings
                    .map((setting) => setting.updated_at)
                    .sort()
                    .at(-1),
                )
              : "Never"
          }
          icon={Settings}
          tone="rose"
        />
        <AdminStat
          label="Maintenance"
          value={
            String(
              settings.find((setting) => setting.key === "maintenance_mode")?.value ??
                false,
            ) === "true"
              ? "On"
              : "Off"
          }
          icon={Settings}
          tone="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {settings.length ? (
          settings.map((setting) => (
            <form
              key={setting.key}
              action={adminUpdateSettingAction}
              className="rounded-3xl border border-line bg-white/70 p-5 shadow-soft"
            >
              <input type="hidden" name="key" value={setting.key} />
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs font-semibold text-plum">
                    {setting.key}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {setting.description || "No description"}
                  </p>
                </div>
                <p className="text-[10px] text-ink-soft">
                  {formatDateTime(setting.updated_at)}
                </p>
              </div>
              <textarea
                name="value"
                defaultValue={JSON.stringify(setting.value, null, 2)}
                rows={4}
                spellCheck={false}
                className="mt-3 w-full rounded-2xl border border-line bg-cream/60 p-3 font-mono text-xs outline-none transition focus:border-rose/40 focus:ring-4 focus:ring-rose/10"
              />
              <input
                name="description"
                defaultValue={setting.description ?? ""}
                placeholder="Description"
                className="mt-2 h-9 w-full rounded-xl border border-line bg-white px-3 text-xs outline-none focus:border-rose/40"
              />
              <div className="mt-3 flex justify-end">
                <Button type="submit" size="sm" variant="outline">
                  Save setting
                </Button>
              </div>
            </form>
          ))
        ) : (
          <p className="rounded-3xl border border-dashed border-line bg-white/60 px-6 py-12 text-center text-sm text-ink-soft lg:col-span-2">
            No platform settings found. Run the seed migration to add defaults.
          </p>
        )}
      </div>
    </div>
  );
}
