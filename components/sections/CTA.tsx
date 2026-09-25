import Glyph from "@/components/Glyph";
import Button from "@/components/ui/Button";
import { brand } from "@/lib/brand";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";

function CTA() {
  return (
    <section id="contact" data-section="Get in touch" className="scroll-mt-16">
      <div className="shell pt-28 md:pt-44">
        {/* Phones: a light, compact version instead of the full-bleed band. */}
        <div className="border-t border-ink pt-10 md:hidden">
          <Eyebrow>Get in touch</Eyebrow>
          <Reveal>
            <h2 className="mt-6 text-5xl font-medium leading-[1.02] tracking-[-0.035em]">
              Build sovereign AI with us<span className="text-signal">.</span>
            </h2>
          </Reveal>
          <p className="mt-6 text-xl text-ink/70">
            Investors, policymakers, researchers and future colleagues — we&apos;d like to hear from you.
          </p>
          <div className="mt-8 grid gap-3">
            <Button href="/contact" className="justify-between">
              Start a conversation
            </Button>
            <Button href="/research" variant="secondary" className="justify-between">
              Read the research
            </Button>
          </div>
        </div>

        <div className="relative hidden overflow-hidden bg-ink px-6 py-16 text-paper md:block md:px-16 md:py-32">
          {/* A faint logo glyph, cropped by the band's right edge; still reacts to the cursor. */}
          <div
            aria-hidden
            className="absolute -right-[12%] top-1/2 hidden aspect-square h-[125%] -translate-y-1/2 opacity-15 md:block"
          >
            <Glyph src={brand.glyphSrc} resolution={40} tone="--paper" className="size-full" />
          </div>
          <div aria-hidden className="absolute right-0 top-0 h-full w-1.5 bg-signal" />
          <div className="relative">
            <Eyebrow tone="light">Get in touch</Eyebrow>
            <Reveal>
              <h2 className="mt-8 max-w-5xl text-5xl font-medium leading-[1.02] tracking-[-0.035em] md:text-8xl xl:text-9xl">
                Build sovereign AI with us<span className="text-signal">.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-8 max-w-2xl text-xl text-paper/70 md:text-2xl">
                Investors, policymakers, researchers and future colleagues — we&apos;d like to hear from you.
              </p>
            </Reveal>
            <Reveal delay={0.2} className="mt-10 flex flex-wrap gap-3">
              <Button href="/contact" className="bg-signal! text-paper! hover:bg-paper! hover:text-ink!">
                Start a conversation
              </Button>
              <Button href="/research" variant="ghost" className="text-paper! hover:text-paper/70!">
                Read the research
              </Button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTA;
