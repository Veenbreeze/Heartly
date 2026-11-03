import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to create, manage, and send your Heartly digital gifts.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; setup?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-rose">Your Heartly space</p>
      <h1 className="text-balance font-display text-4xl leading-[1.08] tracking-tight text-plum sm:text-5xl">
        Welcome back to what matters.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
        Sign in to continue creating, sharing, and keeping the moments you have made.
      </p>
      {params.error ? (
        <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          We could not complete that sign in. Please try again.
        </p>
      ) : null}
      <div className="mt-8">
        <LoginForm next={params.next} setup={params.setup === "1"} />
      </div>
      <p className="mt-7 text-center text-sm text-ink-soft">
        New to Heartly?{" "}
        <Link href="/register" className="font-medium text-rose hover:underline">
          Create a free account
        </Link>
      </p>
    </div>
  );
}
