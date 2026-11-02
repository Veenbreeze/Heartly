import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "@/components/auth/reset-form";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="text-balance text-3xl leading-tight text-plum sm:text-4xl">
        Choose a new password.
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Use at least 8 characters. A mix of words and numbers is easier to
        remember than something clever.
      </p>
      <div className="mt-7">
        <ResetForm />
      </div>
      <p className="mt-7 text-center text-sm text-ink-soft">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-rose hover:underline">
          Log in instead
        </Link>
      </p>
    </div>
  );
}
