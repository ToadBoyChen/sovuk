"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useScroll } from "motion/react";
import DotCanvas, { type Dot } from "@/components/ui/DotCanvas";
import Button from "@/components/ui/Button";
import Name from "@/components/Name";
import { brand } from "@/lib/brand";
import { loadImage, sampleImage } from "@/lib/dotMatrix";
import { useReducedMotion } from "@/lib/useReducedMotion";

const RES = 44;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Full-height hero with a scroll-scrubbed assembly: the hero pins for an
 * extra screen, your scroll pulls the logo together from slowly drifting,
 * scattered dots, then the wordmark, tagline and buttons fade in. Reduced
 * motion shows the assembled logo and text straight away, without the pin.
 */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [dots, setDots] = useState<Dot[] | null>(null);
  // Motion values, not state: they update every scroll frame without
  // re-rendering React (the canvas subscribes to `spread` directly).
  const spread = useMotionValue(1);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Set by hand from the scroll event rather than useTransform: Motion hands
  // transformed scroll values to native scroll-driven animations, which
  // don't hold their end value once the pin releases (the text vanished).
  const textOpacity = useMotionValue(0);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduced) return;
    // Assemble over the first 60% of the pinned scroll, easing into place…
    spread.set((1 - clamp01(p / 0.6)) ** 2);
    // …then bring in the wordmark and tagline.
    textOpacity.set(clamp01((p - 0.55) / 0.3));
  });

  // Reduced motion is only known on the client, so apply its static state here.
  useEffect(() => {
    if (!reduced) return;
    textOpacity.set(1);
    spread.set(0);
  }, [reduced, textOpacity, spread]);

  useEffect(() => {
    loadImage(brand.glyphSrc)
      .then((img) =>
        setDots(
          sampleImage(img, RES, RES, { mask: "circle" }).map(({ x, y, brightness, alpha }) =>
            alpha > 32 && brightness > 128 ? { x, y } : { x, y, alpha: 0.1 }
          )
        )
      )
      .catch(() => {});
  }, []);

  return (
    <div ref={ref} className={reduced ? "" : "h-[200svh]"}>
      <section className="sticky top-0 flex h-svh min-h-[40rem] flex-col pt-20">
        {/* The canvas fills this stage; scattered dots stay inside it. */}
        <div className="relative min-h-0 flex-1">
          <DotCanvas
            dots={dots}
            cols={RES}
            rows={RES}
            tones={["--ink"]}
            flips={1}
            spread={spread}
            drift={0.02}
            className="absolute! inset-x-0 inset-y-4"
          />
        </div>
        <motion.div style={{ opacity: textOpacity }} className="shell">
          <div className="grid gap-6 border-t border-ink py-8 md:grid-cols-12 md:items-end md:py-10">
            <Name className="text-6xl md:col-span-4 md:text-7xl" />
            <p className="text-2xl font-medium leading-[1.15] tracking-[-0.02em] md:col-span-5 md:text-3xl">
              {brand.tagline}
            </p>
            <div className="flex flex-wrap gap-3 md:col-span-3 md:justify-end">
              <Button href="/research">Read our research</Button>
              <Button href="/contact" variant="secondary">
                Get in touch
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default Hero;
