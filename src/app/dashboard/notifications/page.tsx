import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Gift,
  MessageCircleHeart,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  deleteNotificationAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/actions/notifications";
import type { Notification } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Notifications · Heartly",
  robots: { index: false, follow: false },
};

function notificationLink(notification: Notification) {
  const slug = notification.metadata?.giftSlug ?? notification.metadata?.slug;
  if (typeof slug === "string" && slug) return `/g/${slug}`;
  return null;
}

function NotificationIcon({ type }: { type: string }) {
  if (type.includes("response") || type.includes("reply")) {
    return <MessageCircleHeart className="size-4" />;
  }
  return <Gift className="size-4" />;
}

export default async function NotificationsPage() {
  const user = await requireUser();
  const supabase = await getSupabaseServerClient();
  const { data } = supabase
    ? await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };
  const notifications = (data ?? []) as Notification[];
  const unread = notifications.filter((item) => !item.read_at).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-plum">Notifications</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {unread
              ? `${unread} ${unread === 1 ? "thing" : "things"} you have not seen yet.`
              : "You are all caught up."}
          </p>
        </div>
        {unread ? (
          <form action={markAllNotificationsReadAction}>
            <Button type="submit" variant="outline">
              <CheckCheck /> Mark all read
            </Button>
          </form>
        ) : null}
      </div>

      {notifications.length ? (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const link = notificationLink(notification);
            return (
              <article
                key={notification.id}
                className={
                  notification.read_at
                    ? "rounded-3xl border border-line bg-white/50 p-4"
                    : "rounded-3xl border border-rose/20 bg-white/80 p-4 shadow-soft"
                }
              >
                <div className="flex items-start gap-3">
                  <span
                    className={
                      notification.read_at
                        ? "flex size-10 shrink-0 items-center justify-center rounded-2xl bg-cream text-ink-soft"
                        : "flex size-10 shrink-0 items-center justify-center rounded-2xl bg-blush text-rose"
                    }
                  >
                    <NotificationIcon type={notification.type} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold text-plum">
                        {notification.title}
                      </h2>
                      {!notification.read_at ? (
                        <Badge variant="rose">New</Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      {notification.body}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-ink-soft">
                      <span>{timeAgo(notification.created_at)}</span>
                      {link ? (
                        <Link href={link} className="font-medium text-rose hover:underline">
                          Open gift
                        </Link>
                      ) : null}
                      {!notification.read_at ? (
                        <form action={markNotificationReadAction}>
                          <input type="hidden" name="id" value={notification.id} />
                          <button
                            type="submit"
                            className="font-medium text-plum hover:underline"
                          >
                            Mark read
                          </button>
                        </form>
                      ) : null}
                      <form action={deleteNotificationAction}>
                        <input type="hidden" name="id" value={notification.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 text-red-500 hover:underline"
                          aria-label="Delete notification"
                        >
                          <Trash2 className="size-3" /> Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="Nothing here yet"
          description="When someone opens your gift or sends a reply, we will let you know."
          action={
            <Button asChild variant="outline">
              <Link href="/dashboard/gifts">See my gifts</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
