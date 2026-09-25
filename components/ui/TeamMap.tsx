"use client";

import { useMemo } from "react";
import DotCanvas, { type Dot } from "@/components/ui/DotCanvas";
import type { Location } from "@/content/team";
import { projectToGrid, type MapGrid } from "@/lib/mapGrid";

// Tone indices into the DotCanvas palette.
const INK = 0;
const BLUE = 1;
const RED = 2;
const TONES = ["--ink", "--sovereign", "--signal"];
const PIN_RADIUS = 1.6;

interface TeamMapProps {
  grid: MapGrid;
  locations: Location[];
  /** Index into `locations` to emphasise, or null for none. */
  focus: number | null;
  className?: string;
}

/** The UK in faint dots with a pin per team member; the focused pin turns red and the rest dim. */
function TeamMap({ grid, locations, focus, className = "" }: TeamMapProps) {
  const pins = useMemo(
    () => locations.map((l) => ({ ...l, ...projectToGrid(grid, l.lat, l.lon) })),
    [grid, locations]
  );

  const dots = useMemo(() => {
    const out: Dot[] = [];
    grid.data.forEach((row, y) =>
      [...row].forEach((c, x) => {
        if (c === ".") return;
        const pin = pins.findIndex((p) => Math.hypot(x + 0.5 - p.x, y + 0.5 - p.y) <= PIN_RADIUS);
        const delay = y / grid.rows;
        if (pin < 0) out.push({ x, y, tone: INK, alpha: 0.12, delay });
        else if (focus === null) out.push({ x, y, tone: BLUE, delay });
        else out.push({ x, y, tone: pin === focus ? RED : BLUE, alpha: pin === focus ? 1 : 0.35, delay });
      })
    );
    return out;
  }, [grid, pins, focus]);

  return (
    <div
      className={`relative mx-auto max-w-full ${className}`}
      style={{ aspectRatio: `${grid.cols} / ${grid.rows}` }}
      role="img"
      aria-label={`Map of the United Kingdom showing where the team is based: ${locations
        .map((l) => l.name)
        .join(", ")}`}
    >
      <DotCanvas
        dots={dots}
        cols={grid.cols}
        rows={grid.rows}
        tones={TONES}
        flips={1}
        repel={2.5}
        bleed={24}
        bootMs={1400}
        bootStyle="fill"
        transitionMs={500}
        className="size-full"
      />
      {pins.map((p, i) => {
        const gap = PIN_RADIUS + 1;
        const side =
          p.label === "left"
            ? { right: `${((grid.cols - (p.x - gap)) / grid.cols) * 100}%` }
            : { left: `${((p.x + gap) / grid.cols) * 100}%` };
        return (
          <span
            key={`${p.name}-${i}`}
            aria-hidden
            className={`absolute -translate-y-1/2 whitespace-nowrap bg-paper/85 px-1 text-sm font-medium transition-colors duration-300 md:text-base ${
              focus === null || focus === i ? "text-ink" : "text-ink/30"
            }`}
            style={{ ...side, top: `${(p.y / grid.rows) * 100}%` }}
          >
            {p.name}
          </span>
        );
      })}
    </div>
  );
}

export default TeamMap;
