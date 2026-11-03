import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { ResendVerificationForm } from "@/components/auth/resend-verification-form";
import { VerifySignupForm } from "@/components/auth/verify-signup-form";

export const metadata: Metadata = {
  title: "Check your email",
  robots: { index: false, follow: false },
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; next?: string }>;
}) {
  const { email, next } = await searchParams;

  return (
    <div className="text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-blush text-rose">
        <MailCheck className="size-7" />
      </span>
      <h1 className="mt-6 text-balance text-3xl leading-tight text-plum sm:text-4xl">
        One quick check.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        We sent a six digit confirmation code to{" "}
        {email ? <span className="font-medium text-plum">{email}</span> : "your email"}.
        Enter it below to confirm your Heartly account.
      </p>
      <VerifySignupForm email={email} next={next} />
      <div className="mt-6 border-t border-line pt-5">
        <p className="text-xs text-ink-soft">Need another code?</p>
        <ResendVerificationForm email={email} />
      </div>
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
