import Link from "next/link";
import { AuthShowcase } from "@/components/auth/auth-showcase";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-[#fcf8f4] lg:grid-cols-[1.04fr_0.96fr]">
      <AuthShowcase />
      <main id="main" className="flex min-h-0 flex-col px-5 py-5 sm:px-10 sm:py-9 lg:min-h-screen lg:px-12 xl:px-20">
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <Link href="/" className="rounded-full px-3 py-2 text-sm text-ink-soft transition hover:bg-white hover:text-plum">
            Back home
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-5 sm:py-12 lg:py-8">
          <div className="relative w-full max-w-md overflow-hidden rounded-[3rem_3rem_3rem_1rem] border border-[#efe5de] bg-white p-5 shadow-[0_28px_80px_-42px_rgba(54,36,42,0.35)] before:pointer-events-none before:absolute before:-right-16 before:-top-20 before:size-48 before:rounded-full before:bg-blush/70 before:content-[''] after:pointer-events-none after:absolute after:-bottom-24 after:-left-16 after:size-44 after:rounded-full after:bg-[#f8eee9] after:content-[''] sm:p-8 lg:rounded-[3.5rem_3.5rem_3.5rem_1rem] lg:border-[#efe5de] lg:bg-white/65 lg:p-8 lg:shadow-[0_28px_80px_-42px_rgba(54,36,42,0.35)]">
            <div className="relative z-10">{children}</div>
          </div>
        </div>
        <p className="mx-auto max-w-md text-center text-[11px] leading-relaxed text-ink-soft/80">
          By continuing, you agree to our{" "}
          <Link href="/legal/terms" className="font-medium text-plum underline underline-offset-2 hover:text-rose">Terms</Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="font-medium text-plum underline underline-offset-2 hover:text-rose">Privacy Policy</Link>.
        </p>
      </main>
    </div>
  );
}
