import type { Metadata } from "next";
import Link from "next/link";
import { SITE_SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refund policy",
  description: "When and how Heartly can refund a Premium payment.",
};

const supportEmail = SITE_SUPPORT_EMAIL;

export default function RefundsPage() {
  return (
    <div className="space-y-8 text-sm leading-relaxed text-ink-soft">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">
          Refunds
        </p>
        <h1 className="mt-3 font-display text-4xl text-plum">
          When something is not right.
        </h1>
        <p className="mt-3">Last updated: 31 October 2026</p>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">Our approach</h2>
        <p>
          Heartly Premium is a digital service that unlocks immediately after
          payment. Because access begins straight away, refunds for a change of mind are
          not automatic. We will always review genuine problems fairly.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">We will refund when</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>you were charged twice for the same purchase;</li>
          <li>you were charged after cancelling, for a period you did not receive;</li>
          <li>Premium did not activate and we cannot fix it; or</li>
          <li>the payment was unauthorised and you reported it promptly.</li>
        </ul>
        <p>
          We may also offer a refund where required by applicable consumer law or
          where we decide it is the right thing to do.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">What we may not refund</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>a change of mind after Premium has been used;</li>
          <li>a gift that was not opened by the recipient;</li>
          <li>temporary interruptions outside our reasonable control; or</li>
          <li>accounts suspended for breaking our terms.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">How to request a refund</h2>
        <p>
          Email{" "}
          <a href={`mailto:${supportEmail}?subject=Heartly%20refund%20request`} className="font-medium text-rose hover:underline">
            {supportEmail}
          </a>{" "}
          within 14 days of the charge. Include the email on your account and the
          payment reference from your{" "}
          <Link href="/dashboard/billing" className="font-medium text-rose hover:underline">
            billing page
          </Link>
          . We may ask for a receipt or additional information to locate the
          payment.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">How refunds are paid</h2>
        <p>
          Approved refunds are returned through the original payment method where
          possible. Timing depends on ClickPesa and your mobile money or card
          provider, and may take several business days. We will tell you when the
          refund has been submitted.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">Cancelling Premium</h2>
        <p>
          Cancelling stops future renewals. It does not automatically refund the
          current paid period, and your Premium features remain available until
          that period ends. You can manage your plan from the billing page.
        </p>
      </section>
    </div>
  );
}
