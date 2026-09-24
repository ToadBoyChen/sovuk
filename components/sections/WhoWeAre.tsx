import InkText from "@/components/ui/InkText";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import { manifesto, principles } from "@/content/manifesto";

/** Full-bleed sovereign-blue band — the site's boldest colour moment. */
function WhoWeAre() {
  return (
    <section
      id="who-we-are"
      data-section="Who we are"
      className="relative mt-28 scroll-mt-16 overflow-hidden bg-sovereign text-paper md:mt-44"
    >
      {/* Red edge, echoing the CTA band. */}
      <div aria-hidden className="absolute left-0 top-0 h-1.5 w-1/3 bg-signal" />

      <div className="shell relative py-24 md:py-40">
        <Eyebrow tone="light">Who we are</Eyebrow>

        <InkText
          text={manifesto}
          className="mt-14 max-w-[90rem] text-4xl font-medium leading-[1.1] tracking-[-0.03em] md:mt-20 md:text-6xl xl:text-7xl"
        />

        <ul className="mt-20 grid gap-px border border-paper/20 bg-paper/20 md:mt-28 md:grid-cols-3">
          {principles.map((p, i) => (
            <Reveal
              as="li"
              key={p.title}
              delay={i * 0.08}
              className="group bg-sovereign p-6 transition-colors duration-500 hover:bg-sovereign-deep md:p-10"
            >
              <span aria-hidden className="block h-[3px] w-8 bg-paper/60 transition-[width] duration-500 group-hover:w-16" />
              <h3 className="mt-8 text-2xl font-medium tracking-tight md:text-4xl">{p.title}</h3>
              <p className="mt-4 text-lg text-paper/75 md:text-xl">{p.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default WhoWeAre;
