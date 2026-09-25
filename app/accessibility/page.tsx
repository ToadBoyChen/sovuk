import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Accessibility statement",
  description: `How accessible the ${brand.name} website is, what we know falls short, and how to tell us about problems.`,
};

/**
 * Accessibility statement, following the structure of the UK government's
 * model statement. Keep "Known issues" in step with the site: remove an
 * item once it is fixed, and update the date.
 */
export default function AccessibilityPage() {
  return (
    <LegalPage label="Accessibility" title="Accessibility statement" updated="25 September 2026">
      <p>
        This statement applies to the {brand.name} website at {brand.url.replace("https://", "")}. We want as many
        people as possible to be able to use it. You should be able to:
      </p>
      <ul>
        <li>zoom in up to 400% without text spilling off the screen</li>
        <li>navigate the whole site using just a keyboard</li>
        <li>use the site with a screen reader</li>
        <li>turn off animation by setting your device to reduce motion</li>
        <li>read the data behind every chart as a table</li>
      </ul>

      <h2>How accessible this website is</h2>
      <p>
        We aim to meet the Web Content Accessibility Guidelines (WCAG) version 2.2 at level AA. We know some parts of
        the site do not yet do so. They are listed below, with what we are doing about them.
      </p>

      <h2>Known issues</h2>
      <ul>
        <li>
          Some faded text, such as unselected tabs on the roadmap and the stack, has too little contrast against the
          background (WCAG 1.4.3).
        </li>
        <li>
          Some animations, such as packets moving on the world map, loop without a pause control. Setting your device to
          reduce motion stops them (WCAG 2.2.2).
        </li>
        <li>
          On the home page, the buttons at the bottom of the opening screen can receive keyboard focus before they have
          faded into view (WCAG 2.4.7).
        </li>
        <li>The hub markers on the world map are smaller than the recommended target size (WCAG 2.5.8).</li>
        <li>On phones, the companies at each hub on the world map are not shown.</li>
        <li>
          When you switch views on the world map or choose a roadmap phase, screen readers are not told that the content
          has changed (WCAG 4.1.3).
        </li>
      </ul>

      <h2>Reporting problems</h2>
      <p>
        If you find a problem not listed here, or need information from the site in a different format, email{" "}
        <a href={`mailto:${brand.email}`}>{brand.email}</a> or use our <Link href="/contact">contact page</Link>. Tell us
        the page and what you were trying to do. We will reply within 10 working days.
      </p>

      <h2>Enforcement procedure</h2>
      <p>
        The Equality and Human Rights Commission is responsible for enforcing the accessibility regulations. If you are
        not happy with how we respond to your complaint, contact the{" "}
        <a href="https://www.equalityadvisoryservice.com/">Equality Advisory and Support Service</a>.
      </p>

      <h2>How we tested this website</h2>
      <p>
        This statement was prepared on 25 September 2026, based on a review of the site by our own team against WCAG 2.2
        AA. It has not yet been independently audited. We will review it whenever the site changes significantly, and at
        least once a year.
      </p>
    </LegalPage>
  );
}
