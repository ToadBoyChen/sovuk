"use client";

import { useEffect, useState } from "react";
import DotCanvas, { type Dot } from "@/components/ui/DotCanvas";
import { sampleText } from "@/lib/dotMatrix";

interface DotTextProps {
  text: string;
  cols: number;
  rows: number;
  /** Accessible label; also shown as a tooltip hint. */
  label: string;
  className?: string;
}

/**
 * Text set in dots. The dots fly in when first seen, drift from the cursor,
 * and scatter and reform when clicked.
 */
function DotText({ text, cols, rows, label, className = "" }: DotTextProps) {
  const [dots, setDots] = useState<Dot[] | null>(null);
  const [burst, setBurst] = useState(1);

  useEffect(() => {
    let cancelled = false;
    // Wait for web fonts so the dots use the site's typeface, not a fallback.
    document.fonts.ready.then(() => {
      if (cancelled) return;
      setDots(
        sampleText(text, cols, rows).map(({ x, y, alpha }) =>
          alpha > 110 ? { x, y } : { x, y, alpha: 0.08 }
        )
      );
    });
    return () => {
      cancelled = true;
    };
  }, [text, cols, rows]);

  return (
    <button
      type="button"
      aria-label={label}
      title="Click to scatter"
      onClick={() => setBurst((b) => b + 1)}
      className={`block cursor-pointer ${className}`}
    >
      <DotCanvas
        dots={dots}
        cols={cols}
        rows={rows}
        tones={["--ink"]}
        flips={1.2}
        repel={3}
        scatter={14}
        burst={burst}
        bleed={48}
        className="size-full"
      />
    </button>
  );
}

export default DotText;
