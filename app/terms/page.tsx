import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
import LegalTOC from "@/components/LegalTOC";
import ScrollToHash from "@/components/ScrollToHash";

export const metadata: Metadata = { title: "Terms of Service" };

const EFFECTIVE_DATE = "August 19, 2026";
const CONTACT_EMAIL = "EMAIL_PLACEHOLDER";
const OPERATING_NAME = "NoBSCourses";
const JURISDICTION = "Florida, United States";

const TOC = [
  { id: "acceptance", label: "Acceptance of Terms" },
  { id: "accounts", label: "Accounts" },
  { id: "reviews-content", label: "Reviews & User Content" },
  { id: "course-listings", label: "Course Listings & Verification" },
  { id: "affiliate-links", label: "Affiliate Links & Compensation" },
  { id: "payments-refunds", label: "Payments, Subscriptions & Refunds" },
  { id: "prohibited-conduct", label: "Prohibited Conduct" },
  { id: "content-removal", label: "Content Removal & Enforcement" },
  { id: "termination", label: "Termination" },
  { id: "disclaimers", label: "Disclaimer of Warranties" },
  { id: "liability", label: "Limitation of Liability" },
  { id: "governing-law", label: "Governing Law" },
  { id: "changes", label: "Changes to These Terms" },
  { id: "contact", label: "Contact Us" },
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <ScrollToHash />
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Effective {EFFECTIVE_DATE} · Last updated {EFFECTIVE_DATE}
      </p>

      <LegalTOC items={TOC} />

      <div className="mt-10 flex flex-col gap-10 text-zinc-700 dark:text-zinc-300">
        <section id="acceptance">
          <h2 className="scroll-mt-24 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            1. Acceptance of Terms
          </h2>
          <p className="mt-3">
            By using {SITE_NAME}, you&apos;re agreeing to these terms. {SITE_NAME} is
            operated under the name {OPERATING_NAME} by an individual as a sole
            proprietorship — no separate company has been formed for this business yet. If
            you don&apos;t agree to these terms, don&apos;t use the site.
          </p>
        </section>

        <section id="accounts">
          <h2 className="scroll-mt-24 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            2. Accounts
          </h2>
          <p className="mt-3">
            {SITE_NAME} has two separate account types, kept independent on purpose:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong>Learner accounts</strong> — for taking courses and leaving reviews.
            </li>
            <li>
              <strong>Business (owner) accounts</strong> — for course providers who claim,
              verify, and manage listings. A business account is a separate identity from any
              learner account you might also hold; they don&apos;t share a login.
            </li>
          </ul>
          <p className="mt-3">
            You&apos;re responsible for keeping your login credentials secure and for
            everything that happens under your account. You must be at least 13 years old to
            create an account. Provide accurate information when you sign up — for business
            accounts specifically, the paperwork and identity information you submit for
            verification must be genuine.
          </p>
        </section>

        <section id="reviews-content">
          <h2 className="scroll-mt-24 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            3. Reviews & User Content
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              You may post <strong>one review per course</strong> on your account — this is
              enforced technically, not just as a rule. To leave a new review for a course
              you&apos;ve already reviewed, you edit your existing one.
            </li>
            <li>
              Reviews must be honest, must be your own genuine experience, and can&apos;t be
              defamatory, harassing, or fraudulent.
            </li>
            <li>
              <strong>No incentivized or fake reviews.</strong> You may not accept payment,
              discounts, free access, or any other compensation in exchange for posting a
              review or for posting a specific rating. You may not post a review for a course
              you didn&apos;t actually take.
            </li>
            <li>
              A review only gets a &ldquo;Verified&rdquo; badge if you submit evidence you
              actually purchased the course and an admin approves it. Submitting fake
              purchase evidence is grounds for account termination.
            </li>
            <li>
              Reviews can be edited for 48 hours after posting, after which they lock — by
              you and by us. We don&apos;t edit review content on anyone&apos;s behalf, and a
              course provider can&apos;t have a review removed just because they disagree
              with it or don&apos;t like it.
            </li>
            <li>
              We do reserve the right to remove content that violates this policy — for
              example, spam, harassment, or content unrelated to the course being reviewed.
              See <a href="#content-removal" className="underline">Content Removal &amp;
              Enforcement</a> below for how that works.
            </li>
            <li>
              By posting a review, you grant {SITE_NAME} a non-exclusive, worldwide,
              royalty-free license to display it on the site (and to describe it in
              aggregate — like a course&apos;s average rating) for as long as it&apos;s live.
            </li>
          </ul>
        </section>

        <section id="course-listings">
          <h2 className="scroll-mt-24 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            4. Course Listings & Verification
          </h2>
          <p className="mt-3">
            Anyone with an account can submit a course listing. Every new listing goes
            through admin review before it&apos;s public — but a course being listed on{" "}
            {SITE_NAME} is not our endorsement of it, and adding a listing doesn&apos;t make
            you its owner.
          </p>
          <p className="mt-3">
            <strong>What &ldquo;Verified&rdquo; does and doesn&apos;t mean:</strong>{" "}
            &ldquo;Registered Business&rdquo; and &ldquo;Verified Course&rdquo; badges confirm
            that we reviewed the provider&apos;s identity and paperwork — that they are who
            they say they are. They are <strong>not</strong> an endorsement, certification, or
            guarantee of the course&apos;s quality, outcomes, or value, and they have no
            effect on a course&apos;s rating, which comes only from reviews.
          </p>
        </section>

        <section id="affiliate-links">
          <h2 className="scroll-mt-24 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            5. Affiliate Links & Compensation
          </h2>
          <p className="mt-3">
            Some &ldquo;Go to course&rdquo; links on Verified Course listings are affiliate
            links, routed through our own <code>/go/</code> redirect system. If you buy
            through one, {SITE_NAME} may earn a commission from the course provider, at no
            additional cost to you. This has no effect on the course&apos;s rating or review
            content, which are computed independently of any affiliate relationship or
            payment from the provider.
          </p>
        </section>

        <section id="payments-refunds">
          <h2 className="scroll-mt-24 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            6. Payments, Subscriptions & Refunds
          </h2>
          <p className="mt-3">
            Payments are processed by Stripe, and all fees are listed in USD. The $5/month
            customer plan renews automatically each month until you cancel; the first
            month is non-refundable, and cancelling stops future charges without refunding
            what you&apos;ve already paid. The Registered Business tier is a one-time $99
            setup fee plus a $50/month subscription that renews automatically until
            cancelled — cancelling removes the Registered Business badge and editing access
            but does not revoke ownership of courses already claimed. One-time course
            unlocks ($0.99) and bonus unlock credits are non-refundable once the content
            has been unlocked.
          </p>
          <p className="mt-3">
            The $99 setup fee follows its own rules. If we reject your claim submission,
            we&apos;ll refund the $99 in full — unless you choose to appeal and resubmit
            instead, in which case the fee carries over to the resubmission rather than
            being refunded and charged again. If a verified listing is later revoked for
            fraud, abuse, or a policy violation (posting incentivized or fake reviews, for
            example), the $99 fee and any remaining subscription period are forfeited, with
            no refund. And if you cancel voluntarily after a successful verification, you
            can request a full refund of the $99 within 14 days of the original payment;
            after that window, the fee is non-refundable, though you can still cancel the
            $50/month subscription going forward — that just isn&apos;t retroactive.
          </p>
          <p className="mt-3">
            Except where stated above or required by law, fees are non-refundable. Refunds
            aren&apos;t automatic — email {" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
              {CONTACT_EMAIL}
            </a>{" "}
            to request one, and we&apos;ll process it manually.
          </p>
        </section>

        <section id="prohibited-conduct">
          <h2 className="scroll-mt-24 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            7. Prohibited Conduct
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Posting fake, incentivized, or paid-for reviews, or reviewing a course you didn&apos;t take.</li>
            <li>Manipulating review counts, ratings, or the review-flagging system.</li>
            <li>Creating fake or duplicate accounts, including to evade a suspension.</li>
            <li>Scraping the site or automating access without our permission.</li>
            <li>Submitting fraudulent business paperwork, purchase evidence, or affiliate links.</li>
            <li>Using the site for anything illegal, or to harass another user.</li>
            <li>Interfering with or attempting to bypass the site&apos;s security or rate limits.</li>
          </ul>
        </section>

        <section id="content-removal">
          <h2 className="scroll-mt-24 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            8. Content Removal & Enforcement
          </h2>
          <p className="mt-3">
            We reserve the right to remove any content — including reviews — that violates
            this policy, including spam, harassment, or content unrelated to the course being
            reviewed. This is different from a provider removing a review they simply
            disagree with: course providers cannot remove or hide reviews, and content
            removal under this section is a platform decision based on an actual policy
            violation, not a provider&apos;s preference.
          </p>
        </section>

        <section id="termination">
          <h2 className="scroll-mt-24 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            9. Termination
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong>By you:</strong> you may stop using {SITE_NAME} and request account
              deletion at any time by emailing{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
                {CONTACT_EMAIL}
              </a>
              . Cancelling a paid subscription stops future charges but does not retroactively
              refund past ones, except as stated in{" "}
              <a href="#payments-refunds" className="underline">
                Payments, Subscriptions &amp; Refunds
              </a>
              .
            </li>
            <li>
              <strong>By us:</strong> we can suspend or terminate an account that violates
              these terms — including fake reviews, fraudulent verification paperwork, or
              abuse of the platform. Where practical, we&apos;ll tell you why.
            </li>
          </ul>
        </section>

        <section id="disclaimers">
          <h2 className="scroll-mt-24 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            10. Disclaimer of Warranties
          </h2>
          <p className="mt-3">
            {SITE_NAME} and all content on it are provided &ldquo;as is&rdquo; and &ldquo;as
            available,&rdquo; without warranties of any kind, express or implied, including
            merchantability, fitness for a particular purpose, and non-infringement. We work
            to keep reviews genuine and the system honest, but we don&apos;t guarantee that
            any course listed here will meet your expectations, and we&apos;re not a party to
            any transaction between you and a course provider. We&apos;re not liable for the
            content, quality, delivery, or outcomes of any third-party course.
          </p>
        </section>

        <section id="liability">
          <h2 className="scroll-mt-24 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            11. Limitation of Liability
          </h2>
          <p className="mt-3">
            To the maximum extent permitted by law, {OPERATING_NAME} and the individual
            operating it are not liable for indirect, incidental, special, or consequential
            damages arising from your use of the site. Our total liability for any claim is
            limited to the amount you paid us in the 12 months before the claim arose.
            Because {OPERATING_NAME} is currently a sole proprietorship rather than an LLC or
            corporation, this limitation is especially important — read it carefully, and
            note this is a standard startup default, not a substitute for a lawyer&apos;s
            review.
          </p>
        </section>

        <section id="governing-law">
          <h2 className="scroll-mt-24 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            12. Governing Law
          </h2>
          <p className="mt-3">
            These terms are governed by the laws of the State of Florida, United States,
            without regard to conflict-of-law principles, and without regard to where you
            personally access the site from.
          </p>
        </section>

        <section id="changes">
          <h2 className="scroll-mt-24 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            13. Changes to These Terms
          </h2>
          <p className="mt-3">
            We may update these terms as the product changes. Material changes will update
            the date at the top of this page; continuing to use {SITE_NAME} after a change
            means you accept it.
          </p>
        </section>

        <section id="contact">
          <h2 className="scroll-mt-24 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            14. Contact Us
          </h2>
          <p className="mt-3">
            Questions about these terms:{" "}
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
