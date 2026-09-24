"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import DotCanvas, { type Dot } from "@/components/ui/DotCanvas";
import Section from "@/components/ui/Section";
import { roadmap, type Phase } from "@/content/roadmap";
import { projectToGrid, ukGrid } from "@/lib/ukGrid";
import { useReducedMotion } from "@/lib/useReducedMotion";

const STATUS: Record<Phase["status"], { label: string; className: string }> = {
  now: { label: "Now", className: "text-signal" },
  next: { label: "Next", className: "text-sovereign" },
  later: { label: "Later", className: "text-muted" },
};

// Tone indices into the DotCanvas palette.
const INK = 0;
const BLUE = 1;
const RED = 2;
const TONES = ["--ink", "--sovereign", "--signal"];

const origin = projectToGrid(51.507, -0.128); // London: where every phase starts
const land: { x: number; y: number }[] = [];
ukGrid.data.forEach((row, y) =>
  [...row].forEach((c, x) => c === "#" && land.push({ x, y }))
);
const maxDist = Math.max(...land.map((c) => Math.hypot(c.x - origin.x, c.y - origin.y)));
const phasePlaces = roadmap.map((p) => p.places.map((pl) => ({ ...pl, ...projectToGrid(pl.lat, pl.lon) })));

/** The first phase at which a land cell lights up. */
function litAt(x: number, y: number): number {
  for (let i = 0; i < roadmap.length; i++) {
    if (roadmap[i].everywhere) return i;
    for (const pl of phasePlaces[i]) {
      if (Math.hypot(x + 0.5 - pl.x, y + 0.5 - pl.y) <= roadmap[i].reach) return i;
    }
  }
  return roadmap.length;
}
const litPhase = land.map((c) => litAt(c.x, c.y));

/** Dots for the map with everything up to `selected` lit and its places marked in red. */
function buildMap(selected: number): Dot[] {
  const places = phasePlaces[selected];
  return land.map(({ x, y }, i) => {
    const delay = Math.hypot(x - origin.x, y - origin.y) / maxDist;
    if (litPhase[i] > selected) return { x, y, tone: INK, alpha: 0.1, delay };
    const mark = places.some((pl) => Math.hypot(x + 0.5 - pl.x, y + 0.5 - pl.y) <= 1.2);
    return { x, y, tone: mark ? RED : BLUE, delay };
  });
}

/**
 * Roadmap as a map of the UK in dots: each phase lights up more of the
 * country, spreading out from London.
 */
function Roadmap() {
  const reduced = useReducedMotion();
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [selected, setSelected] = useState(() =>
    Math.max(0, roadmap.findIndex((p) => p.status === "now"))
  );
  const dots = useMemo(() => buildMap(selected), [selected]);

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const step = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + roadmap.length) % roadmap.length;
    setSelected(next);
    tabsRef.current[next]?.focus();
  };

  return (
    <Section
      id="roadmap"
      label="Roadmap"
      title="From framework to national capacity."
      intro="We start in Westminster and build outward — until sovereign compute covers the whole country."
    >
      <div className="shell mt-12 grid gap-12 md:mt-20 md:grid-cols-12 md:items-center">
        {/* Map */}
        <div className="md:col-span-5">
          <div
            className="relative mx-auto h-[26rem] max-w-full md:h-[min(80svh,52rem)]"
            style={{ aspectRatio: `${ukGrid.cols} / ${ukGrid.rows}` }}
            role="img"
            aria-label={`Map of the United Kingdom showing ${roadmap[selected].title}: ${
              roadmap[selected].everywhere
                ? "the whole country"
                : roadmap[selected].places.map((p) => p.name).join(", ")
            }`}
          >
            <DotCanvas
              dots={dots}
              cols={ukGrid.cols}
              rows={ukGrid.rows}
              tones={TONES}
              flips={1}
              repel={2.5}
              bleed={24}
              bootMs={1400}
              bootStyle="fill"
              transitionMs={900}
              className="size-full"
            />
            {/* Place labels sit just clear of their dot cluster. */}
            {phasePlaces[selected].map((pl) => {
              const gap = roadmap[selected].reach + 1;
              const side =
                pl.label === "left"
                  ? { right: `${((ukGrid.cols - (pl.x - gap)) / ukGrid.cols) * 100}%` }
                  : { left: `${((pl.x + gap) / ukGrid.cols) * 100}%` };
              return (
                <span
                  key={pl.name}
                  aria-hidden
                  className="absolute -translate-y-1/2 whitespace-nowrap bg-paper/85 px-1 text-sm font-medium text-ink md:text-base"
                  style={{ ...side, top: `${(pl.y / ukGrid.rows) * 100}%` }}
                >
                  {pl.name}
                </span>
              );
            })}
          </div>
        </div>

        {/* Phases */}
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label="Roadmap phases"
          className="md:col-span-6 md:col-start-7"
        >
          {roadmap.map((p, i) => {
            const active = i === selected;
            return (
              <div key={p.title} className="border-t border-line last:border-b">
                <button
                  ref={(el) => {
                    tabsRef.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`phase-tab-${i}`}
                  aria-selected={active}
                  aria-controls={`phase-panel-${i}`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => setSelected(i)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setSelected(i)}
                  className="flex w-full items-baseline justify-between gap-6 py-6 text-left md:py-8"
                >
                  <span
                    className={`text-3xl font-medium tracking-[-0.03em] transition-colors duration-300 md:text-5xl ${
                      active ? "text-ink" : "text-ink/30 hover:text-ink/60"
                    }`}
                  >
                    {p.title}
                  </span>
                  <span className={`text-lg font-medium ${STATUS[p.status].className}`}>
                    {p.when ?? STATUS[p.status].label}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {active && (
                    <motion.div
                      id={`phase-panel-${i}`}
                      role="tabpanel"
                      aria-labelledby={`phase-tab-${i}`}
                      initial={reduced ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduced ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-xl text-xl leading-relaxed text-ink/70">{p.summary}</p>
                      <ul className="flex flex-wrap gap-x-8 gap-y-2 pt-5 pb-8">
                        {p.points.map((point) => (
                          <li key={point} className="flex items-center gap-3 text-base">
                            <span aria-hidden className="h-[3px] w-4 bg-sovereign" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

export default Roadmap;
