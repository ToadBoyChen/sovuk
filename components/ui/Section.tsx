import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";

interface SectionProps {
  id: string;
  label: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Ends a heading's closing punctuation in signal red, echoing the wordmark's
 * full stop. Non-string titles are left as they are.
 */
function RedStop({ title }: { title: React.ReactNode }) {
  if (typeof title !== "string" || !/[.?!]$/.test(title)) return <>{title}</>;
  return (
    <>
      {title.slice(0, -1)}
      <span className="text-signal">{title.slice(-1)}</span>
    </>
  );
}

/** Standard home-page section: eyebrow label, heading, optional intro, then content. */
function Section({ id, label, title, intro, children, className = "" }: SectionProps) {
  return (
    <section id={id} data-section={label} className={`scroll-mt-16 ${className}`}>
      <div className="shell pt-28 md:pt-44">
        <Eyebrow>{label}</Eyebrow>
        <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-12">
          <Reveal className="md:col-span-8">
            <h2 className="text-5xl font-medium leading-[1.02] tracking-[-0.035em] text-balance md:text-7xl xl:text-8xl">
              <RedStop title={title} />
            </h2>
          </Reveal>
          {intro && (
            <Reveal delay={0.1} className="md:col-span-4 md:col-start-9 xl:col-span-3 xl:col-start-10 md:self-end">
              <p className="text-xl leading-relaxed text-ink/70 md:text-2xl">{intro}</p>
            </Reveal>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

export default Section;
