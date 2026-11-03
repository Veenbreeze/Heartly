import type { Metadata } from "next";
import Link from "next/link";
import { SITE_SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The rules for using Heartly to create, share and receive digital gifts.",
};

const supportEmail = SITE_SUPPORT_EMAIL;

export default function TermsPage() {
  return (
    <div className="space-y-8 text-sm leading-relaxed text-ink-soft">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">
          Terms
        </p>
        <h1 className="mt-3 font-display text-4xl text-plum">
          The agreement between us.
        </h1>
        <p className="mt-3">Last updated: 31 October 2026</p>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">Using Heartly</h2>
        <p>
          By using Heartly, you agree to these terms. You must be at least 16
          years old, or have permission from a parent or guardian, and you must
          use the service lawfully. If you do not agree, please do not use
          Heartly.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">Your account</h2>
        <p>
          You are responsible for the activity on your account and for keeping
          your password secure. Give us accurate information and tell us promptly
          if you believe your account has been compromised. Guest gifts are tied
          to the browser that created them and may not be recoverable on another
          device.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">Your content</h2>
        <p>
          You keep ownership of the messages, photos and other content you add to
          a gift. You give us a limited licence to host, process, display and
          share that content as needed to operate the service. You confirm that
          you have the rights needed to use everything you upload, including
          photos of other people.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">Acceptable use</h2>
        <p>You must not use Heartly to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>harass, threaten, impersonate or deceive anyone;</li>
          <li>share illegal, explicit, hateful or abusive content;</li>
          <li>infringe copyright, privacy or other rights;</li>
          <li>send spam or bulk unsolicited messages;</li>
          <li>probe, overload, scrape or interfere with the service; or</li>
          <li>circumvent payment, access or security controls.</li>
        </ul>
        <p>
          We may remove content, unpublish a gift, suspend an account or report
          unlawful activity when we believe it is necessary to protect users or
          the service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">Premium and payments</h2>
        <p>
          Premium features are billed at the price shown at checkout. Payments are
          processed by ClickPesa. Premium activates when the payment is confirmed
          and remains active for the period purchased. You can cancel from your
          billing page; cancellation stops future renewals but does not
          automatically refund the current period. See our{" "}
          <Link href="/legal/refunds" className="font-medium text-rose hover:underline">
            refund policy
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">Availability</h2>
        <p>
          We work to keep Heartly available, but we do not guarantee uninterrupted
          access. We may change, pause or discontinue features, and we may perform
          maintenance. Keep your own copies of important content; we are not a
          permanent archive.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">Disclaimers</h2>
        <p>
        Heartly is provided as it is and as available. To the extent
          permitted by law, we exclude implied warranties and are not liable for
          indirect or consequential loss. Nothing in these terms limits rights
          that cannot legally be excluded.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">Ending use</h2>
        <p>
          You may stop using Heartly at any time and ask us to delete your
          account. We may suspend or end access if these terms are broken or if
          the service is discontinued. Provisions that by their nature should
          survive, including content licences for gifts already shared and
          liability terms, will survive.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">Governing law</h2>
        <p>
          These terms are governed by the laws of Tanzania. Disputes will be
          handled by the courts of Tanzania unless applicable consumer law gives
          you another forum.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">Contact</h2>
        <p>
          Questions about these terms:{" "}
          <a href={`mailto:${supportEmail}`} className="font-medium text-rose hover:underline">
            {supportEmail}
          </a>
          .
        </p>
      </section>
    </div>
  );
}
