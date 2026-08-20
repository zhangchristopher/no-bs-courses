import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
import LegalTOC from "@/components/LegalTOC";
import ScrollToHash from "@/components/ScrollToHash";

export const metadata: Metadata = { title: "Privacy Policy" };

const EFFECTIVE_DATE = "August 19, 2026";
const CONTACT_EMAIL = "EMAIL_PLACEHOLDER";
const OPERATING_NAME = "NoBSCourses";
const JURISDICTION = "Florida, United States";

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "how-we-use-information", label: "How We Use Your Information" },
  { id: "cookies-tracking", label: "Cookies & Tracking" },
  { id: "how-we-share-information", label: "How We Share Information" },
  { id: "data-retention", label: "Data Retention" },
  { id: "your-rights", label: "Your Rights & Choices" },
  { id: "childrens-privacy", label: "Children's Privacy" },
  { id: "changes", label: "Changes to This Policy" },
  { id: "contact", label: "Contact Us" },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <ScrollToHash />
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Effective {EFFECTIVE_DATE} · Last updated {EFFECTIVE_DATE}
      </p>

      <LegalTOC items={TOC} />

      <div className="mt-10 flex flex-col gap-10 text-zinc-700 dark:text-zinc-300">
        <section id="overview">
          <h2 className="scroll-mt-24 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            1. Overview
          </h2>
          <p className="mt-3">
            This describes what {SITE_NAME} (operating name &ldquo;{OPERATING_NAME}
            ,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) collects, why, and what you can do
            about it. {OPERATING_NAME} is currently operated by an individual as a sole
            proprietorship — no separate company (like an LLC) has been formed for this
            business yet. We&apos;ve tried to write this the way we write everything else
            here — plainly, and without saying more than what&apos;s actually true.
          </p>
        </section>

        <section id="information-we-collect">
          <h2 className="scroll-mt-24 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            2. Information We Collect
          </h2>
          <p className="mt-3">
            {SITE_NAME} has two kinds of accounts — learner accounts and business (course
            owner) accounts — kept separate on purpose. Depending on which you have, we
            collect:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong>Account info:</strong> email address, a display name, phone number (if
              you give us one), and your password (stored as a one-way hash — we never store
              or can retrieve the plaintext password).
            </li>
            <li>
              <strong>Business accounts additionally:</strong> a business or legal name,
              business registration number, state of registration, and a link to supporting
              paperwork, submitted only if you apply for Registered Business status.
            </li>
            <li>
              <strong>Marketing preferences:</strong> whether you opted in to email or SMS
              updates at signup. Off by default — you check the box, or you don&apos;t.
            </li>
            <li>
              <strong>Reviews and content:</strong> ratings, review text, and any purchase
              evidence you submit to get a review verified.
            </li>
            <li>
              <strong>Payment activity:</strong> payment info is handled directly by
              Stripe — we don&apos;t collect or store your card number. We keep only what
              Stripe tells us back: a customer/subscription reference ID and its status.
            </li>
            <li>
              <strong>Usage and analytics data:</strong> which courses you view, and clicks
              through to a provider&apos;s site (affiliate click tracking), tied to your
              account if you&apos;re signed in. If you&apos;re not signed in, we use a
              first-party, random visitor cookie (not a tracking pixel, not shared with ad
              networks) so we can tell &ldquo;the same anonymous visitor did both of these
              things&rdquo; — for example, to measure whether a listing section actually
              leads to a click.
            </li>
          </ul>
        </section>

        <section id="how-we-use-information">
          <h2 className="scroll-mt-24 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            3. How We Use Your Information
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>To run your account — sign-in, password reset, email verification.</li>
            <li>To display reviews and calculate a course&apos;s rating.</li>
            <li>
              To detect review manipulation and abuse — for example, we automatically flag
              (for human review, never automatic removal) a course that receives an unusually
              high number of reviews in a short window.
            </li>
            <li>To process payments and manage subscriptions, through Stripe.</li>
            <li>
              To review business paperwork and affiliate links before granting Registered
              Business or Verified Course status.
            </li>
            <li>
              To send transactional email — verification links, password resets, and
              anything you&apos;ve opted into — through Resend.
            </li>
            <li>
              To measure which parts of a listing actually help a visitor decide — never to
              sell that data, and never to build an ad-targeting profile of you.
            </li>
          </ul>
        </section>

        <section id="cookies-tracking">
          <h2 className="scroll-mt-24 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            4. Cookies & Tracking
          </h2>
          <p className="mt-3">
            We currently use session cookies to keep you signed in (one for learner accounts,
            one for business accounts — they&apos;re independent), and a first-party visitor
            cookie, described above, to correlate anonymous activity on this site only. We
            don&apos;t use third-party advertising or cross-site tracking cookies today.
          </p>
          <p className="mt-3">
            If we add analytics or advertising tooling later that changes this, we&apos;ll
            update this section to disclose it before it goes live — not after.
          </p>
        </section>

        <section id="how-we-share-information">
          <h2 className="scroll-mt-24 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            5. How We Share Information
          </h2>
          <p className="mt-3">
            We don&apos;t sell your personal information to advertisers or data brokers. It
            goes to these third parties only because they&apos;re the ones actually doing the
            work:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong>Stripe</strong> — processes payments as our payment processor. They
              receive what&apos;s needed to charge you; we never see or store your full card
              number.
            </li>
            <li>
              <strong>Resend</strong> — sends transactional email on our behalf
              (verification links, password resets, and anything you opted into). They
              process your email address and the content of that email as our email
              processor.
            </li>
            <li>
              We may disclose information if legally required to (for example, a valid
              subpoena), or to investigate fraud, abuse, or a security incident.
            </li>
          </ul>
        </section>

        <section id="data-retention">
          <h2 className="scroll-mt-24 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            6. Data Retention
          </h2>
          <p className="mt-3">
            We keep account and review data for as long as your account is active. If you
            delete your account, we remove personal identifiers within a reasonable time,
            though some records (like payment history) may be retained longer where
            we&apos;re legally required to.
          </p>
        </section>

        <section id="your-rights">
          <h2 className="scroll-mt-24 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            7. Your Rights & Choices
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Update your display name any time from your account settings.</li>
            <li>Unsubscribe from marketing email using the link in any marketing email.</li>
            <li>Reply STOP to any marketing text to opt out.</li>
            <li>
              Request a copy of your data (data export), or ask us to delete your account, by
              emailing{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
                {CONTACT_EMAIL}
              </a>
              . We don&apos;t have a self-serve export tool yet — for now this is a manual,
              email-us process, and we&apos;ll get back to you.
            </li>
          </ul>
        </section>

        <section id="childrens-privacy">
          <h2 className="scroll-mt-24 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            8. Children&apos;s Privacy
          </h2>
          <p className="mt-3">
            {SITE_NAME} isn&apos;t directed at children under 13, and we don&apos;t knowingly
            collect information from them.
          </p>
        </section>

        <section id="changes">
          <h2 className="scroll-mt-24 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            9. Changes to This Policy
          </h2>
          <p className="mt-3">
            If this changes in a way that matters, we&apos;ll update the date at the top of
            this page. We won&apos;t quietly water it down.
          </p>
        </section>

        <section id="contact">
          <h2 className="scroll-mt-24 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            10. Contact Us
          </h2>
          <p className="mt-3">
            Questions about this policy, or about your data specifically:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
              {CONTACT_EMAIL}
            </a>
            . {OPERATING_NAME}, {JURISDICTION}.
          </p>
        </section>
      </div>
    </main>
  );
}
