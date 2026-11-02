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
      <h1 className="text-balance text-3xl leading-tight text-plum sm:text-4xl">
        Welcome back.
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Pick up where you left off. Your gifts are waiting.
      </p>
      {params.error ? (
        <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          We could not complete that sign in. Please try again.
        </p>
      ) : null}
      <div className="mt-7">
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
