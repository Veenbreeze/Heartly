import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { ResendVerificationForm } from "@/components/auth/resend-verification-form";

export const metadata: Metadata = {
  title: "Check your email",
  robots: { index: false, follow: false },
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; next?: string; notice?: string }>;
}) {
  const { email, next, notice } = await searchParams;

  return (
    <div className="text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-blush text-rose">
        <MailCheck className="size-7" />
      </span>
      <h1 className="mt-6 text-balance text-3xl leading-tight text-plum sm:text-4xl">
        One quick check.
      </h1>
      {notice === "unconfirmed" ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
          Your email is not confirmed yet. Open the confirmation link we sent you,
          or resend it below.
        </div>
      ) : null}
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        We sent a confirmation link to{" "}
        {email ? <span className="font-medium text-plum">{email}</span> : "your email"}.
        Open it to activate your Heartly account.
      </p>
      <div className="mt-7 rounded-2xl border border-line bg-[#fbf8f5] px-5 py-5 text-left">
        <p className="text-sm font-medium text-plum">Check your inbox</p>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
          The link expires in 1 hour. If it is not there, check your spam folder,
          or send a fresh one.
        </p>
        <div className="mt-4 border-t border-line pt-4">
          <ResendVerificationForm email={email} next={next} />
        </div>
      </div>
      <p className="mt-6 text-xs text-ink-soft">
        Already confirmed?{" "}
        <Link href="/login" className="underline hover:text-rose">
          Log in
        </Link>
        .
      </p>
    </div>
  );
}
