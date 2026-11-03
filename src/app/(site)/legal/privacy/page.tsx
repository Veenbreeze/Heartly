import type { Metadata } from "next";
import Link from "next/link";
import { SITE_SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Heartly collects, uses, stores and protects your personal information.",
};

const supportEmail = SITE_SUPPORT_EMAIL;

export default function PrivacyPage() {
  return (
    <div className="space-y-8 text-sm leading-relaxed text-ink-soft">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">
          Privacy
        </p>
        <h1 className="mt-3 font-display text-4xl text-plum">
          Your information, handled with care.
        </h1>
        <p className="mt-3">Last updated: 31 October 2026</p>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">Who we are</h2>
        <p>
          Heartly is a digital gift service operated from Tanzania. This policy
          explains what we collect when you use Heartly, why we collect it and
          the choices you have. It applies to our website, gift studio and public
          gift pages.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">What we collect</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-plum">Account details.</strong> Your name,
            email address, password (stored in hashed form by our authentication
            provider), locale and preferred currency.
          </li>
          <li>
            <strong className="text-plum">Gift content.</strong> The names,
            messages, photos, music choices, colours and settings you add to a
            gift.
          </li>
          <li>
            <strong className="text-plum">Activity.</strong> View counts, replies
            sent through a gift, timestamps and basic technical information used
            to keep the service secure.
          </li>
          <li>
            <strong className="text-plum">Payments.</strong> Plan, amount,
            currency, status and provider reference. Payment providers process
            your payment details; Heartly does not store mobile money PINs or
            full card numbers.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">Why we use it</h2>
        <p>
          We use your information to create and operate your account, build and
          publish gifts, take payments, send service notifications, provide
          support, prevent abuse and improve the product. We rely on your
          consent, the performance of our contract with you, and our legitimate
          interest in running a safe service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">Who we share it with</h2>
        <p>
          We share only what is needed with service providers that help us run
          Heartly, including Supabase for authentication, database and file
          storage; ClickPesa for payment processing; and an email provider for
          transactional messages. We may disclose information if required by law
          or to protect the safety and rights of our users.
        </p>
        <p>
          We do not sell personal information or use gift content for
          advertising.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">Gift visibility</h2>
        <p>
          Public gifts may be visible on our explore pages. Unlisted and
          gifts protected by a password are not indexed by search engines and are only
          served after our access checks. Anyone with an unlisted link can open
          that gift, so share links carefully.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">How long we keep it</h2>
        <p>
          We keep account and gift information while your account is active and
          for a reasonable period afterwards to meet legal, tax and security
          obligations. You can ask us to delete your account and associated
          content, subject to records we must retain.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">Your choices</h2>
        <p>
          You may access, correct or delete your profile information, change your
          gift visibility, or ask us for a copy of your data. To make a request,
          email{" "}
          <a href={`mailto:${supportEmail}`} className="font-medium text-rose hover:underline">
            {supportEmail}
          </a>
          . We may need to verify that the request comes from the account owner.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">Security</h2>
        <p>
          We use access controls, encrypted connections and checks on our servers to
          protect your information. No service can promise perfect security, but
          we work to limit access to personal data and to respond quickly to
          issues.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">Cookies</h2>
        <p>
          We use cookies for sign in sessions, guest gift ownership and
          access to gifts protected by a password. See our{" "}
          <Link href="/legal/cookies" className="font-medium text-rose hover:underline">
            cookie policy
          </Link>{" "}
          for details.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl text-plum">Changes and contact</h2>
        <p>
          We may update this policy as the service changes. We will post the new
          version here and update the date above. Questions can be sent to{" "}
          <a href={`mailto:${supportEmail}`} className="font-medium text-rose hover:underline">
            {supportEmail}
          </a>{" "}
          or through our{" "}
          <Link href="/contact" className="font-medium text-rose hover:underline">
            contact page
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
