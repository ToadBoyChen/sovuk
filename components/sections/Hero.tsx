"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useScroll } from "motion/react";
import DotCanvas from "@/components/ui/DotCanvas";
import Button from "@/components/ui/Button";
import Name from "@/components/Name";
import { brand } from "@/lib/brand";
import { loadImage, sampleImage } from "@/lib/dotMatrix";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Logo diameter in dots, when the stage allows. */
const RES = 44;
/** Cap on dots across the whole stage, to keep the scroll scrub smooth. */
const MAX_DOTS = 3500;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Phones get a timed animation instead of the scroll-pinned one. */
const PHONE = "(max-width: 767px)";
const subscribePhone = (onChange: () => void) => {
  const mql = window.matchMedia(PHONE);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
};

/**
 * Full-height hero with an assembly: the logo pulls together from slowly
 * drifting, scattered dots, then the wordmark, tagline and buttons fade in.
 * On wider screens the hero pins for an extra screen and your scroll drives
 * it; on phones it plays by itself on load, with no pin. Reduced motion
 * shows the assembled logo and text straight away.
 */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const phone = useSyncExternalStore(subscribePhone, () => window.matchMedia(PHONE).matches, () => false);
  const played = useRef(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  // The dot field fills the whole hero, behind the text. `cell` is the dot
  // size in px, chosen so the logo spans the space above the text;
  // `reserve` is how many rows at the bottom the text covers.
  const [grid, setGrid] = useState({ cell: 0, reserve: 0 });
  const { cell } = grid;
  const stageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  // Motion values, not state: they update every scroll frame without
  // re-rendering React (the canvas subscribes to `spread` directly).
  const spread = useMotionValue(1);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  // Set by hand from the scroll event rather than useTransform: Motion hands
  // transformed scroll values to native scroll-driven animations, which
  // don't hold their end value once the pin releases (the text vanished).
  const textOpacity = useMotionValue(0);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduced || phone) return;
    // Assemble over the first 60% of the pinned scroll, easing into place…
    spread.set((1 - clamp01(p / 0.6)) ** 2);
    // …then bring in the wordmark and tagline.
    textOpacity.set(clamp01((p - 0.55) / 0.3));
  });

  // Phones: once the dots are ready, play the assembly once, then the text.
  const ready = Boolean(image && cell);
  useEffect(() => {
    if (!phone || reduced || !ready || played.current) return;
    played.current = true;
    const ease = [0.22, 1, 0.36, 1] as const;
    animate(spread, 0, { duration: 2.4, delay: 0.5, ease });
    animate(textOpacity, 1, { duration: 0.8, delay: 2.4, ease });
  }, [phone, reduced, ready, spread, textOpacity]);

  // Reduced motion is only known on the client, so apply its static state here.
  useEffect(() => {
    if (!reduced) return;
    textOpacity.set(1);
    spread.set(0);
  }, [reduced, textOpacity, spread]);

  useEffect(() => {
    loadImage(brand.glyphSrc)
      .then(setImage)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const text = textRef.current;
    if (!stage || !text) return;
    const measure = () => {
      const { width: w, height: h } = stage.getBoundingClientRect();
      const textH = text.getBoundingClientRect().height;
      const free = h - textH;
      if (!w || free <= 0) return;
      const c = Math.max(
        6,
        Math.min(w, free) / RES,
        Math.sqrt((w * h) / MAX_DOTS),
      );
      setGrid({ cell: c, reserve: Math.ceil(textH / c) });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    ro.observe(text);
    return () => ro.disconnect();
  }, []);

  /** Faint dots across the whole grid, with the logo lit in the space above the text. */
  const buildDots = useCallback(
    (cols: number, rows: number) => {
      if (!image) return [];
      const free = Math.max(1, rows - grid.reserve);
      const size = Math.min(cols, free);
      const ox = Math.floor((cols - size) / 2);
      const oy = Math.floor((free - size) / 2);
      const lit = new Set(
        sampleImage(image, size, size, { mask: "circle" })
          .filter(({ brightness, alpha }) => alpha > 32 && brightness > 128)
          .map(({ x, y }) => (y + oy) * cols + x + ox),
      );
      return Array.from({ length: cols * rows }, (_, i) => {
        const x = i % cols;
        const y = Math.floor(i / cols);
        return lit.has(i) ? { x, y } : { x, y, alpha: 0.1 };
      });
    },
    [image, grid],
  );

  return (
    <div ref={ref} className={reduced || phone ? "" : "h-[200svh]"}>
      <section className="sticky top-0 flex h-svh min-h-[36rem] flex-col justify-end pt-20">
        {/* The canvas fills the hero below the nav, behind the text; scattered dots stay inside it. */}
        <div ref={stageRef} className="absolute inset-x-0 bottom-0 top-20">
          <DotCanvas
            dots={image && cell ? buildDots : null}
            cell={cell}
            tones={["--ink"]}
            flips={1}
            spread={spread}
            drift={0.02}
            className="absolute! inset-x-0 inset-y-4"
          />
        </div>
        {/* Solid paper behind the text, edge to edge, fading in with it so the dots never show through. */}
        <motion.div
          ref={textRef}
          style={{ opacity: textOpacity }}
          className="relative bg-paper"
        >
          <div className="shell">
            <div className="grid gap-6 border-t border-ink py-8 md:grid-cols-12 md:items-end md:py-10">
              {/* The page heading, in words people search for; always in the
                  page for search engines and screen readers, whatever the fade. */}
              <h1 className="sr-only">
                {brand.name}: {brand.tagline}
              </h1>
              <Name className="text-5xl sm:text-6xl md:col-span-4 md:text-7xl" />
              <p className="text-xl font-medium leading-[1.15] sm:text-2xl tracking-[-0.02em] md:col-span-5 md:text-3xl">
                {brand.tagline}
              </p>
              <div className="flex flex-wrap gap-3 md:col-span-3 md:justify-end">
                <Button href="/research">Read our research</Button>
                <Button href="/contact" variant="secondary">
                  Get in touch
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default Hero;
