import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create a free Heartly account and start making personal digital gifts in minutes.",
  robots: { index: false, follow: false },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-rose">Start with a feeling</p>
      <h1 className="text-balance font-display text-4xl leading-[1.08] tracking-tight text-plum sm:text-5xl">
        Make a little moment of your own.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
        Create your free account and turn a message, a memory, or a big question into a gift they can open anywhere.
      </p>
      <div className="mt-8">
        <RegisterForm next={params.next} />
      </div>
      <p className="mt-7 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-rose hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
