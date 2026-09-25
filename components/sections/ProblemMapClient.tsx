"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import DotCanvas, { type Dot } from "@/components/ui/DotCanvas";
import { hubs, london, ukSites, views, type MapPlace, type View } from "@/content/problem";
import { projectToGrid, type MapGrid } from "@/lib/mapGrid";
import { useReducedMotion } from "@/lib/useReducedMotion";

const INK = 0;
const BLUE = 1;
const RED = 2;
const TONES = ["--ink", "--sovereign", "--signal"];
/** How long the wave from one map to the other takes to cross the map. */
const MORPH_MS = 1100;
/** The even zoom that plays with it: the new map grows (or shrinks) from this scale. */
const ZOOM_FROM = { sovereign: 0.88, today: 1.12 };

type Point = { x: number; y: number };

/**
 * Rounds a number for server-rendered markup. Math functions like
 * Math.hypot can differ in the last digit between Node and the browser,
 * which would break hydration.
 */
const fix = (n: number) => Math.round(n * 1000) / 1000;

/** A quadratic arc between two grid points, bowed upward in proportion to its length. */
function arc(a: Point, b: Point, bow = 0.28) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 - Math.hypot(b.x - a.x, b.y - a.y) * bow;
  return `M${fix(a.x)},${fix(a.y)} Q${fix(mx)},${fix(my)} ${fix(b.x)},${fix(b.y)}`;
}

const near = (x: number, y: number, pts: Point[], r: number) =>
  pts.some((p) => Math.hypot(x + 0.5 - p.x, y + 0.5 - p.y) <= r);

/**
 * Dots for one map: faint land, the highlighted country ("*") in
 * `countryTone`, and cells near `marks` in red. Boots outward from `origin`.
 */
function buildDots(grid: MapGrid, origin: Point, marks: Point[], radius: number, countryTone: number): Dot[] {
  const dots: Dot[] = [];
  grid.data.forEach((row, y) => {
    [...row].forEach((c, x) => {
      if (c === ".") return;
      const delay = Math.min(1, Math.hypot(x - origin.x, y - origin.y) / 110);
      if (near(x, y, marks, radius)) dots.push({ x, y, tone: RED, delay });
      else if (c === "*") dots.push({ x, y, tone: countryTone, delay });
      else dots.push({ x, y, alpha: 0.2, level: 0.75, delay });
    });
  });
  return dots;
}

/**
 * Dots for morphing into `target`: its own dots, plus a fading-out copy of
 * every cell only `other` has, so nothing vanishes abruptly.
 */
function blend(target: Dot[], other: Dot[]): Dot[] {
  const has = new Set(target.map((d) => d.x * 65536 + d.y));
  return [...target, ...other.filter((d) => !has.has(d.x * 65536 + d.y)).map((d) => ({ ...d, alpha: 0 }))];
}

/** Everything the two maps need that depends only on the grids, worked out once. */
function prepare(world: MapGrid, zoom: MapGrid) {
  const at = (grid: MapGrid) => (p: MapPlace) => projectToGrid(grid, p.lat, p.lon);

  const worldOrigin = at(world)(london);
  const hubCells = hubs.map(at(world));
  const zoomOrigin = at(zoom)(london);
  const siteCells = ukSites.map(at(zoom));
  const worldDots = buildDots(world, worldOrigin, hubCells, 1.1, INK);
  const zoomDots = buildDots(zoom, zoomOrigin, siteCells, 1.3, BLUE);

  // Today = the world; sovereign = zoomed into the British Isles.
  return {
    today: {
      grid: world,
      dots: worldDots,
      morph: blend(worldDots, zoomDots),
      origin: worldOrigin,
      routes: hubCells.map((h) => arc(worldOrigin, h)),
      hubCells,
    },
    sovereign: {
      grid: zoom,
      dots: zoomDots,
      morph: blend(zoomDots, worldDots),
      origin: zoomOrigin,
      siteCells,
    },
  };
}

/**
 * World map of where UK AI requests run. "Today": requests travel out to
 * overseas AI and cloud hubs and answers travel back. "With sovereign
 * compute": the map zooms into the UK and traffic stays between UK sites.
 * `world` and `zoom` come from the server wrapper and share cols × rows.
 */
function ProblemMapClient({ world, zoom }: { world: MapGrid; zoom: MapGrid }) {
  const { cols, rows } = world;
  const maps = useMemo(() => prepare(world, zoom), [world, zoom]);
  const reduced = useReducedMotion();
  const [view, setView] = useState<View>("today");
  // While true, the canvas shows the blended dots so the old map fades out.
  const [morphing, setMorphing] = useState(false);
  // Hub whose companies are showing (hover, focus or tap).
  const [hub, setHub] = useState<number | null>(null);
  const settle = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const strip = useRef<HTMLDivElement>(null);

  // Phones: start the scrolling map centred (London sits mid-map in both views).
  useEffect(() => {
    const el = strip.current;
    if (el) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, []);

  useEffect(() => () => clearTimeout(settle.current), []);

  const choose = (v: View) => {
    if (v === view) return;
    setView(v);
    setHub(null);
    if (reduced) return;
    setMorphing(true);
    clearTimeout(settle.current);
    // Once faded, drop the invisible dots so they can't flicker back on.
    settle.current = setTimeout(() => setMorphing(false), MORPH_MS + 800);
    // A gentle, even zoom centred on London as the dots morph.
    const ox = maps[v].origin.x / cols;
    const oy = maps[v].origin.y / rows;
    animate(
      scope.current,
      { originX: [ox, ox], originY: [oy, oy], scale: [ZOOM_FROM[v], 1] },
      { duration: MORPH_MS / 1000, ease: [0.22, 1, 0.36, 1] }
    );
  };

  const today = view === "today";
  const current = maps[view];

  return (
    <div className="shell mt-12 md:mt-20">
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

      {/* Map: one dot canvas that morphs between the world and the British Isles.
          Phones get a taller map in a sideways-scrolling strip, centred on the UK. */}
      <div
        ref={strip}
        className="-mx-4 mt-8 overflow-x-auto overscroll-x-contain px-4 [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0"
      >
        <div
          className="relative h-(--map-h) w-[calc(var(--map-h)*var(--map-ar))] overflow-hidden md:h-auto md:w-full"
          style={
            {
              aspectRatio: `${cols} / ${rows}`,
              "--map-h": "min(20rem, 50svh)",
              "--map-ar": cols / rows,
            } as React.CSSProperties
          }
          role="group"
          aria-label={
            today
              ? "World map: requests from the UK travel to overseas AI and cloud hubs and back."
              : `Map of the UK: requests stay between ${ukSites.map((s) => s.name).join(", ")}.`
          }
        >
          <div ref={scope} className="absolute inset-0">
            <DotCanvas
              dots={morphing ? current.morph : current.dots}
              cols={cols}
              rows={rows}
              tones={TONES}
              flips={1}
              repel={2}
              bleed={16}
              bootMs={1200}
              bootStyle="fill"
              transitionMs={MORPH_MS}
              className="size-full"
            />
            {/* Packets and hubs for the current view, once its dots are in. */}
            <motion.div
              key={view}
              className="absolute inset-0"
              initial={morphing ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: morphing ? MORPH_MS / 1000 / 2 : 0 }}
            >
              {today ? (
                <>
                  {!reduced && <RoundTrips grid={world} routes={maps.today.routes} />}
                  {/* Hubs: companies show on hover, focus or tap. */}
                  {hubs.map((h, i) => {
                    const c = maps.today.hubCells[i];
                    const open = hub === i;
                    return (
                      <button
                        key={h.name}
                        type="button"
                        aria-label={`${h.name}: ${h.companies.join(", ")}`}
                        aria-expanded={open}
                        className={`absolute hidden size-5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-shadow md:block ${
                          open ? "ring-2 ring-signal" : ""
                        }`}
                        style={{ left: `${fix((c.x / cols) * 100)}%`, top: `${fix((c.y / rows) * 100)}%` }}
                        onPointerEnter={(e) => e.pointerType === "mouse" && setHub(i)}
                        onPointerLeave={(e) => e.pointerType === "mouse" && setHub(null)}
                        onFocus={() => setHub(i)}
                        onBlur={() => setHub(null)}
                        onClick={() => setHub(i)}
                      >
                        <AnimatePresence>
                          {open && (
                            <motion.span
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 4 }}
                              transition={{ duration: 0.15 }}
                              className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap border border-line bg-paper px-2 py-1 text-sm font-medium text-ink"
                            >
                              {h.companies.join(" · ")}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    );
                  })}
                </>
              ) : (
                !reduced && <RandomPackets grid={zoom} sites={maps.sovereign.siteCells} />
              )}
            </motion.div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted md:hidden">Drag sideways to explore the map.</p>

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
          Illustrative — approximate headquarters and data-centre hubs of major AI and cloud providers.
        </p>
      </div>
    </div>
  );
}

/**
 * One packet per route: out to the hub as the request, a pause, then back
 * to the UK as the answer. Routes are staggered so packets don't move in step.
 */
function RoundTrips({ grid, routes }: { grid: MapGrid; routes: string[] }) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${grid.cols} ${grid.rows}`}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
    >
      {routes.map((d, i) => {
        const begin = `${fix(i * 0.4)}s`;
        return (
          <circle key={d} r={0.55} fill="var(--signal)" opacity={0}>
            <set attributeName="opacity" to="1" begin={begin} />
            <animateMotion
              path={d}
              dur={`${fix(4.4 + i * 0.3)}s`}
              begin={begin}
              repeatCount="indefinite"
              keyPoints="0;1;1;0;0"
              keyTimes="0;0.45;0.5;0.95;1"
              calcMode="linear"
            />
          </circle>
        );
      })}
    </svg>
  );
}

/** Packets hopping between random UK sites, each at its own pace. */
function RandomPackets({ grid, sites, count = 4 }: { grid: MapGrid; sites: Point[]; count?: number }) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${grid.cols} ${grid.rows}`}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
    >
      {Array.from({ length: count }, (_, i) => (
        <RandomPacket key={i} sites={sites} />
      ))}
    </svg>
  );
}

/**
 * A packet that repeatedly picks two different sites and travels between
 * them over a random time, with a random pause between hops. Randomness
 * only happens in effects, so server and client render the same markup.
 */
function RandomPacket({ sites }: { sites: Point[] }) {
  const id = useId().replace(/\W/g, "");
  const [hop, setHop] = useState<{ n: number; d: string; dur: number } | null>(null);
  const motionRef = useRef<SVGAnimateMotionElement>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let n = 0;
    const next = () => {
      const a = Math.floor(Math.random() * sites.length);
      const b = (a + 1 + Math.floor(Math.random() * (sites.length - 1))) % sites.length;
      const dur = 1.2 + Math.random() * 1.6;
      const bow = (Math.random() - 0.5) * 0.8;
      setHop({ n: n++, d: arc(sites[a], sites[b], bow), dur });
      timer = setTimeout(next, (dur + 0.2 + Math.random() * 1.5) * 1000);
    };
    timer = setTimeout(next, Math.random() * 2000);
    return () => clearTimeout(timer);
  }, [sites]);

  // Newly mounted SMIL animations would start at document time 0, so start each hop by hand.
  useEffect(() => {
    motionRef.current?.beginElement();
  }, [hop]);

  if (!hop) return null;
  // No hyphens: SMIL would read "-…" in "id.begin" as a time offset.
  const hopId = `${id}hop${hop.n}`;
  return (
    <circle key={hop.n} r={0.55} fill="var(--signal)" opacity={0}>
      <animateMotion ref={motionRef} id={hopId} path={hop.d} dur={`${fix(hop.dur)}s`} begin="indefinite" />
      <set attributeName="opacity" to="1" begin={`${hopId}.begin`} end={`${hopId}.end`} />
    </circle>
  );
}

export default ProblemMapClient;
