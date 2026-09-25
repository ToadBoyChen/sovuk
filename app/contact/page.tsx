import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import { audiences } from "@/content/contact";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${brand.name}.`,
};

/** Contact: heading, the form, and direct details alongside. */
export default function ContactPage() {
  return (
    <section className="pb-28 pt-32 md:pb-44 md:pt-44">
      <div className="shell">
        <Eyebrow>Contact</Eyebrow>
        <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-12">
          <Reveal className="md:col-span-8">
            <h1 className="text-5xl font-medium leading-[1.02] tracking-[-0.035em] text-balance md:text-7xl xl:text-8xl">
              Start a conversation<span className="text-signal">.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-4 md:col-start-9 md:self-end xl:col-span-3 xl:col-start-10">
            <p className="text-xl leading-relaxed text-ink/70 md:text-2xl">
              Whether you want to fund it, shape it, use it or power it — we&apos;d like to hear from you.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-16 border-t border-ink pt-12 md:mt-24 md:grid-cols-12 md:pt-16">
          <div className="md:col-span-7">
            <ContactForm />
          </div>

          <aside className="md:col-span-4 md:col-start-9">
            <h2 className="text-lg font-medium text-muted">Email</h2>
            <a
              href={`mailto:${brand.email}`}
              className="mt-2 block break-all text-2xl font-medium transition-colors hover:text-sovereign md:text-3xl"
            >
              {brand.email}
            </a>

            <h2 className="mt-10 text-lg font-medium text-muted">Based in</h2>
            <p className="mt-2 text-2xl font-medium">{brand.location.city}, United Kingdom</p>

            <h2 className="mt-10 text-lg font-medium text-muted">Elsewhere</h2>
            <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
              {brand.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xl font-medium transition-colors hover:text-sovereign"
                  >
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>

            <h2 className="mt-14 text-lg font-medium text-muted">Who we&apos;d like to hear from</h2>
            <ul className="mt-4">
              {audiences.map((a) => (
                <li key={a.title} className="border-t border-line py-4 last:border-b">
                  <p className="text-lg font-medium">{a.title}</p>
                  <p className="mt-1 text-base text-ink/70">{a.body}</p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
