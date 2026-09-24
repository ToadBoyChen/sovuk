"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import DotCanvas, { type Dot } from "@/components/ui/DotCanvas";
import { destinations, london, ukSites, views, type MapPlace, type View } from "@/content/problem";
import { projectToWorld, worldGrid } from "@/lib/worldGrid";
import { useReducedMotion } from "@/lib/useReducedMotion";

const { cols, rows } = worldGrid;
const INK = 0;
const BLUE = 1;
const RED = 2;
const TONES = ["--ink", "--sovereign", "--signal"];
const AUTOPLAY_MS = 6000;

const origin = projectToWorld(london.lat, london.lon);
const at = (p: MapPlace) => projectToWorld(p.lat, p.lon);
const destCells = destinations.map(at);
const ukCells = ukSites.map(at);

/** Dots for one view: soft land everywhere; the UK and destinations lit per view. */
function buildWorld(view: View): Dot[] {
  const dots: Dot[] = [];
  worldGrid.data.forEach((row, y) => {
    [...row].forEach((c, x) => {
      if (c === ".") return;
      const delay = Math.min(1, Math.hypot(x - origin.x, y - origin.y) / 110);
      if (c === "U") {
        dots.push({ x, y, tone: view === "sovereign" ? BLUE : INK, delay });
        return;
      }
      const isDest = destCells.some((d) => Math.hypot(x + 0.5 - d.x, y + 0.5 - d.y) <= 1.1);
      if (isDest && view === "today") dots.push({ x, y, tone: RED, delay });
      else dots.push({ x, y, alpha: 0.2, level: 0.75, delay });
    });
  });
  return dots;
}

/** A quadratic arc between two grid points, bowed upward in proportion to its length. */
function arc(a: { x: number; y: number }, b: { x: number; y: number }, bow = 0.28) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 - Math.hypot(b.x - a.x, b.y - a.y) * bow;
  return `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`;
}

const outbound = destCells.map((d) => arc(origin, d));
// A small loop between UK sites for the sovereign view.
const ukLoop = ukCells.map((c, i) => arc(c, ukCells[(i + 1) % ukCells.length], 0.5));

function ProblemMap() {
  const reduced = useReducedMotion();
  const [view, setView] = useState<View>("today");
  const [autoplay, setAutoplay] = useState(true);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dots = useMemo(() => buildWorld(view), [view]);

  // Only autoplay while the map is on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Gently alternate views until the visitor picks one.
  useEffect(() => {
    if (!autoplay || reduced || !inView) return;
    const id = setInterval(() => setView((v) => (v === "today" ? "sovereign" : "today")), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [autoplay, reduced, inView]);

  const choose = (v: View) => {
    setAutoplay(false);
    setView(v);
  };

  const today = view === "today";
  const paths = today ? outbound : ukLoop;

  return (
    <div ref={ref} className="shell mt-12 md:mt-20">
      {/* View switch */}
      <div role="tablist" aria-label="Where AI runs" className="flex gap-8 border-b border-line">
        {(Object.keys(views) as View[]).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={view === v}
            onClick={() => choose(v)}
            className={`-mb-px border-b-2 pb-3 text-lg font-medium transition-colors md:text-xl ${
              view === v ? "border-signal text-ink" : "border-transparent text-ink/40 hover:text-ink/70"
            }`}
          >
            {views[v].label}
          </button>
        ))}
      </div>

      {/* Map */}
      <div
        className="relative mt-8 w-full"
        style={{ aspectRatio: `${cols} / ${rows}` }}
        role="img"
        aria-label={
          today
            ? `World map: requests from the UK travel to ${destinations.map((d) => d.name).join(", ")}.`
            : "World map: requests stay within the United Kingdom."
        }
      >
        <DotCanvas
          dots={dots}
          cols={cols}
          rows={rows}
          tones={TONES}
          flips={1}
          repel={2}
          bleed={16}
          bootMs={1200}
          bootStyle="fill"
          transitionMs={700}
          className="size-full"
        />

        {/* Routes: dotted arcs with packets travelling along them. */}
        <svg
          aria-hidden
          viewBox={`0 0 ${cols} ${rows}`}
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
        >
          <AnimatePresence mode="wait">
            <motion.g
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {paths.map((d, i) => (
                <g key={d}>
                  <path
                    d={d}
                    fill="none"
                    stroke={today ? "var(--ink)" : "var(--sovereign)"}
                    strokeOpacity={0.55}
                    strokeWidth={0.32}
                    strokeLinecap="round"
                    strokeDasharray="0 0.9"
                  />
                  {!reduced && (
                    <circle r={0.55} fill="var(--signal)">
                      <animateMotion
                        dur={today ? `${2.6 + i * 0.35}s` : "1.6s"}
                        begin={`${i * 0.4}s`}
                        repeatCount="indefinite"
                        path={d}
                      />
                    </circle>
                  )}
                </g>
              ))}
            </motion.g>
          </AnimatePresence>
        </svg>

        {/* Labels (desktop only; the map is too small for them on phones). */}
        {(today ? destinations : [{ ...london, name: "United Kingdom" }]).map((p) => {
          const c = at(p);
          const side =
            p.label === "left"
              ? { right: `${((cols - c.x + 1.2) / cols) * 100}%` }
              : { left: `${((c.x + 1.2) / cols) * 100}%` };
          return (
            <span
              key={p.name}
              className={`absolute hidden -translate-y-1/2 whitespace-nowrap bg-paper/85 px-1 text-sm font-medium md:block ${
                today ? "text-signal" : "text-sovereign"
              }`}
              style={{ ...side, top: `${(c.y / rows) * 100}%` }}
            >
              {p.name}
            </span>
          );
        })}
      </div>

      {/* Caption */}
      <div className="mt-8 grid gap-4 border-t border-line pt-6 md:grid-cols-12">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={view}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-xl leading-relaxed text-ink/80 md:col-span-8 md:text-2xl"
          >
            {views[view].caption}
          </motion.p>
        </AnimatePresence>
        <p className="text-sm text-muted md:col-span-3 md:col-start-10 md:text-right">
          Illustrative — locations are examples of major overseas cloud and AI hubs.
        </p>
      </div>
    </div>
  );
}

export default ProblemMap;
