import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  alternates: { canonical: "/privacy" },
  title: "Privacy notice",
  description: `What personal information the ${brand.name} website collects, why, and your rights.`,
};

/**
 * Privacy notice. Written to match what the site actually does: no cookies,
 * no analytics, no third-party requests, and a contact form that opens the
 * visitor's own email app. Update it before adding anything that changes
 * that (analytics, a form backend, embedded content).
 */
export default function PrivacyPage() {
  return (
    <LegalPage label="Privacy" title="Privacy notice" updated="25 September 2026">
      <p>
        This notice explains what personal information {brand.name} collects through this website, why, and what rights
        you have. We follow the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
      </p>

      <h2>In short</h2>
      <ul>
        <li>We do not use cookies or any similar tracking.</li>
        <li>We do not use analytics, advertising or social media tracking.</li>
        <li>The site does not load anything from other companies&apos; servers while you browse it.</li>
        <li>We only hold information you choose to send us, such as an email.</li>
      </ul>

      <h2>Who we are</h2>
      <p>
        {brand.name} is responsible for the personal information described here. You can contact us at{" "}
        <a href={`mailto:${brand.email}`}>{brand.email}</a>.
      </p>

      <h2>When you contact us</h2>
      <p>
        Our <Link href="/contact">contact form</Link> does not send anything to our servers. It opens your own email app
        with your message filled in, and nothing is sent until you send that email. When you do, we receive your name,
        email address, organisation if you give one, and your message.
      </p>
      <p>
        We use this only to reply to you and to keep a record of our conversation. Our lawful basis is our legitimate
        interest in responding to people who contact us. We keep correspondence for up to two years after our last
        contact, unless we need to keep it longer for a legal reason, and we never sell it or share it for marketing.
      </p>

      <h2>When you visit the site</h2>
      <p>
        The site is hosted by Vercel Inc. Like any web host, Vercel automatically records basic technical information
        when pages are requested, such as your IP address, browser type and the time of the request, to deliver the site
        and keep it secure. Vercel processes this on our behalf and keeps it for a limited period. Vercel is based in
        the United States, so this information may be processed outside the UK, under safeguards recognised by UK data
        protection law.
      </p>

      <h2>Your rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>ask for a copy of the personal information we hold about you</li>
        <li>ask us to correct information that is wrong</li>
        <li>ask us to delete your information</li>
        <li>object to or ask us to restrict how we use it</li>
      </ul>
      <p>
        To use any of these rights, email <a href={`mailto:${brand.email}`}>{brand.email}</a>. We will reply within one
        month.
      </p>

      <h2>Complaints</h2>
      <p>
        If you are unhappy with how we have handled your information, please tell us first. You can also complain to
        the Information Commissioner&apos;s Office at <a href="https://ico.org.uk/make-a-complaint/">ico.org.uk</a> or
        on 0303 123 1113.
      </p>

      <h2>Changes to this notice</h2>
      <p>If we change how the site handles personal information, we will update this notice and the date above.</p>
    </LegalPage>
  );
}
