import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, MailCheck, ShieldCheck, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { requireUser, getCurrentProfile } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Settings · Heartly",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await getCurrentProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-plum">Settings</h1>
        <p className="mt-1 text-sm text-ink-soft">
          The small details that make Heartly feel like yours.
        </p>
      </div>

      <section className="rounded-3xl border border-line bg-white/70 shadow-soft">
        <div className="flex items-center gap-3 border-b border-line px-5 py-4 sm:px-6">
          <span className="flex size-9 items-center justify-center rounded-xl bg-blush text-rose">
            <UserRound className="size-4" />
          </span>
          <div>
            <h2 className="font-display text-xl text-plum">Profile</h2>
            <p className="text-xs text-ink-soft">How you appear inside Heartly.</p>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <SettingsForm
            fullName={profile?.full_name ?? ""}
            bio={profile?.bio ?? ""}
            locale={profile?.locale ?? "en"}
            currency={profile?.currency ?? "TZS"}
          />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border border-line bg-white/70 p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl text-plum">Email address</h2>
              <p className="mt-1 break-all text-sm text-ink-soft">{user.email}</p>
            </div>
            <Badge variant={user.email_confirmed_at ? "success" : "warning"}>
              {user.email_confirmed_at ? "Verified" : "Unverified"}
            </Badge>
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink-soft">
            {user.email_confirmed_at ? (
              <>
                <MailCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                Confirmed on {formatDate(user.email_confirmed_at)}. Replies and gift
                updates are sent here.
              </>
            ) : (
              <>
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber-600" />
                Check your inbox for a verification link. Publishing still works,
                but confirming your email helps us keep your account safe.
              </>
            )}
          </p>
        </section>

        <section className="rounded-3xl border border-line bg-white/70 p-5 shadow-soft sm:p-6">
          <h2 className="font-display text-xl text-plum">Password</h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            Use a password you do not use anywhere else. You can change it whenever
            you like.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/reset-password">
              <KeyRound /> Change password
            </Link>
          </Button>
        </section>
      </div>

      <section className="rounded-3xl border border-line bg-white/70 p-5 shadow-soft sm:p-6">
        <h2 className="font-display text-xl text-plum">Your data</h2>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-ink-soft">
          Heartly stores the gifts you create, the replies you receive and basic
          view counts. We do not sell data or track recipients across other sites.
          To export or delete your account, contact support from the email address
          on this account.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <Link href="/legal/privacy" className="font-medium text-rose hover:underline">
            Privacy policy
          </Link>
          <Link href="/legal/terms" className="font-medium text-rose hover:underline">
            Terms of service
          </Link>
          <Link href="/help" className="font-medium text-rose hover:underline">
            Help centre
          </Link>
        </div>
      </section>
    </div>
  );
}
