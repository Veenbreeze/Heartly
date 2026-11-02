import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ForgotForm } from "@/components/auth/forgot-form";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div>
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition hover:text-rose"
      >
        <ArrowLeft className="size-4" /> Back to log in
      </Link>
      <h1 className="mt-6 text-balance text-3xl leading-tight text-plum sm:text-4xl">
        Let&apos;s get you back in.
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Enter the email on your account and we will send a secure link to choose
        a new password.
      </p>
      <div className="mt-7">
        <ForgotForm />
      </div>
    </div>
  );
}
