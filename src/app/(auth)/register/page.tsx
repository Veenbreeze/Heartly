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
      <h1 className="text-balance text-3xl leading-tight text-plum sm:text-4xl">
        Create something they will keep.
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Free to start. No card required. Your first gift can be live in minutes.
      </p>
      <div className="mt-7">
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
