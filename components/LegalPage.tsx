import Eyebrow from "@/components/ui/Eyebrow";

interface LegalPageProps {
  label: string;
  title: string;
  /** "25 September 2026" — when the text was last reviewed. */
  updated: string;
  children: React.ReactNode;
}

/** A plain reading page for statements and notices: heading, last-updated line, then prose. */
function LegalPage({ label, title, updated, children }: LegalPageProps) {
  return (
    <article className="pb-28 pt-32 md:pb-44 md:pt-44">
      <div className="shell">
        <Eyebrow>{label}</Eyebrow>
        <h1 className="mt-8 max-w-4xl text-4xl font-medium leading-[1.02] tracking-[-0.035em] text-balance sm:text-5xl md:text-7xl">
          {title}
          <span className="text-signal">.</span>
        </h1>
        <p className="mt-6 text-base text-muted">Last updated {updated}</p>
        <div
          className="mt-12 max-w-3xl border-t border-ink pt-4 text-lg leading-relaxed text-ink/80 md:text-xl
            [&_a]:text-sovereign [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-ink
            [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:tracking-[-0.02em] [&_h2]:text-ink md:[&_h2]:text-3xl
            [&_li]:mt-2 [&_p]:mt-5 [&_strong]:font-medium [&_strong]:text-ink
            [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6"
        >
          {children}
        </div>
      </div>
    </article>
  );
}

export default LegalPage;
