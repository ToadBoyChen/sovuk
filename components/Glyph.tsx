"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import DotCanvas, { type Dot } from "@/components/ui/DotCanvas";
import { loadImage, sampleImage } from "@/lib/dotMatrix";

interface GlyphProps {
  /** Path to the image the glyph renders, e.g. a PNG in /public. Swap this to change the glyph. */
  src?: string;
  /** Nodes across the glyph's diameter. */
  resolution?: number;
  /** Brightness (0-255) above which a sampled pixel counts as "on". */
  threshold?: number;
  /** Duration of the boot-up flicker animation, in ms. */
  flickerMs?: number;
  /** While false, the glyph stays fully hidden. Flip to true to play the flicker-in. */
  start?: boolean;
  /** How far dots ease away from the cursor, in cells (0 disables). */
  repel?: number;
  /** Average bit flips per second (0 disables). */
  flips?: number;
  /** Colour token for the dots, e.g. "--paper" on a dark band. */
  tone?: string;
  className?: string;
}

const DEFAULT_CLASS =
  "w-full h-full col-span-4 sm:row-span-2 md:row-span-3 lg:row-span-4";
const OFF_ALPHA = 0.1;

// Below this width the glyph samples at reduced resolution — fewer nodes keeps
// redraws cheap on lower-powered hardware.
const MOBILE_QUERY = "(max-width: 639px)";
const MOBILE_RESOLUTION_SCALE = 0.7;

function subscribeMobile(onChange: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/**
 * A circular grid of lit/unlit dots, in the spirit of the Nothing Phone glyph
 * interface. Rendered by the shared DotCanvas engine: the occasional bit flip,
 * and dots that ease away from the cursor.
 */
function Glyph({
  src = "/glyph.png",
  resolution = 44,
  threshold = 128,
  flickerMs = 1200,
  start = true,
  repel = 3,
  flips = 1.5,
  tone = "--foreground",
  className,
}: GlyphProps) {
  const isMobile = useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false
  );
  const effectiveResolution = isMobile
    ? Math.max(16, Math.round(resolution * MOBILE_RESOLUTION_SCALE))
    : resolution;
  const [dots, setDots] = useState<Dot[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadImage(src).then((image) => {
      if (cancelled) return;
      const samples = sampleImage(image, effectiveResolution, effectiveResolution, { mask: "circle" });
      setDots(
        samples.map(({ x, y, brightness, alpha }) => {
          const on = alpha > 32 && brightness > threshold;
          return on ? { x, y } : { x, y, alpha: OFF_ALPHA };
        })
      );
    });
    return () => {
      cancelled = true;
    };
  }, [src, effectiveResolution, threshold]);

  return (
    <DotCanvas
      dots={start ? dots : null}
      cols={effectiveResolution}
      rows={effectiveResolution}
      tones={[tone]}
      flips={flips}
      repel={repel}
      bootMs={flickerMs * 0.6}
      bleed={40}
      className={className ?? DEFAULT_CLASS}
    />
  );
}

export default Glyph;
