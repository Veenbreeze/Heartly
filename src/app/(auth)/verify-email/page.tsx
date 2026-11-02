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
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-blush text-rose">
        <MailCheck className="size-7" />
      </span>
      <h1 className="mt-6 text-balance text-3xl leading-tight text-plum sm:text-4xl">
        One quick check.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        We sent a confirmation link to{" "}
        {email ? <span className="font-medium text-plum">{email}</span> : "your email"}.
        Open it to finish setting up your Heartly account, then come back and make
        something lovely.
      </p>
      <ResendVerificationForm email={email} />
      <p className="mt-6 text-xs text-ink-soft">
        Did not get it? Check spam, or{" "}
        <Link href="/login" className="underline hover:text-rose">
          try logging in
        </Link>
        .
      </p>
    </div>
  );
}
