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
          <div className="w-full max-w-md rounded-[2rem] border border-[#efe5de] bg-white p-5 shadow-[0_28px_80px_-42px_rgba(54,36,42,0.35)] sm:p-8 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            {children}
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
