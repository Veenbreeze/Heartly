import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie policy",
  description: "The cookies Heartly uses and how you can control them.",
};

export default function CookiesPage() {
  return (
    <div className="space-y-8 text-sm leading-relaxed text-ink-soft">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">
          Cookies
        </p>
        <h1 className="mt-3 font-display text-4xl text-plum">
          Small files, clear purpose.
        </h1>
        <p className="mt-3">Last updated: 31 October 2026</p>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">What cookies are</h2>
        <p>
          Cookies are small files stored by your browser. Heartly uses them to
          keep you signed in, remember guest gifts and allow access to
          gifts protected by a password. We do not use advertising or tracking
          cookies across sites.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl text-plum">Cookies we use</h2>
        <div className="overflow-hidden rounded-2xl border border-line">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-cream/60 text-[10px] uppercase tracking-wider text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-medium">Purpose</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Lifetime</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-line/70">
                <td className="px-4 py-3 text-plum">Sign in session</td>
                <td className="px-4 py-3">Essential</td>
                <td className="px-4 py-3">Session or refresh period</td>
              </tr>
              <tr className="border-b border-line/70">
                <td className="px-4 py-3 text-plum">Guest gift ownership</td>
                <td className="px-4 py-3">Essential</td>
                <td className="px-4 py-3">Up to 1 year</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-plum">Access to gifts protected by a password</td>
                <td className="px-4 py-3">Essential</td>
                <td className="px-4 py-3">6 hours</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">Services from other providers</h2>
        <p>
          Our authentication and database provider, Supabase, sets cookies needed
          to keep you signed in. Payment provider ClickPesa may set cookies during
          its own checkout process. Their use of cookies is governed by their own
          policies.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">Managing cookies</h2>
        <p>
          You can block or delete cookies in your browser settings. Blocking
          essential cookies will prevent sign in, guest gift access and
          gifts protected by a password from working. Because we do not use optional
          advertising cookies, there is no marketing consent banner.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">More information</h2>
        <p>
          For how we handle personal information, see our{" "}
          <Link href="/legal/privacy" className="font-medium text-rose hover:underline">
            privacy policy
          </Link>
          . If you have a question, visit the{" "}
          <Link href="/contact" className="font-medium text-rose hover:underline">
            contact page
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
