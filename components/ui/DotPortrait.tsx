"use client";

import { useEffect, useState } from "react";
import DotCanvas, { type Dot } from "@/components/ui/DotCanvas";
import { loadImage, sampleImage } from "@/lib/dotMatrix";

interface DotPortraitProps {
  src: string;
  alt: string;
  /** While true, the photo is revealed over the halftone. */
  revealed: boolean;
  /** Where the reveal starts, as fractions of the portrait (0-1). Default centre. */
  origin?: { x: number; y: number };
}

// 4:5 portrait grid.
const COLS = 48;
const ROWS = 60;

/** Halftone: darker pixels become larger dots; near-white areas are left empty. */
function toHalftone(image: HTMLImageElement): Dot[] {
  const dots: Dot[] = [];
  for (const { x, y, brightness } of sampleImage(image, COLS, ROWS, { fit: "cover" })) {
    const darkness = 1 - brightness / 255;
    if (darkness < 0.16) continue;
    dots.push({ x, y, level: Math.min(1.15, 0.15 + 0.95 * darkness ** 0.8) });
  }
  return dots;
}

/**
 * A team portrait shown as a blue halftone. On reveal, the photo opens in a
 * circle from `origin` (where the cursor came in), covering the dots.
 */
function DotPortrait({ src, alt, revealed, origin = { x: 0.5, y: 0.5 } }: DotPortraitProps) {
  const [dots, setDots] = useState<Dot[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadImage(src)
      .then((image) => !cancelled && setDots(toHalftone(image)))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [src]);

  const at = `${origin.x * 100}% ${origin.y * 100}%`;

  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-subtle">
      <DotCanvas
        dots={dots}
        cols={COLS}
        rows={ROWS}
        tones={["--sovereign"]}
        className={`absolute! inset-0 transition-transform duration-700 ease-out ${
          revealed ? "scale-[1.04]" : ""
        }`}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- sized by its container; also sampled into dots */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 size-full object-cover transition-[clip-path] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{ clipPath: `circle(${revealed ? "150%" : "0%"} at ${at})` }}
      />
    </div>
  );
}

export default DotPortrait;
