"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { stations, steps } from "@/content/request";
import { useReducedMotion } from "@/lib/useReducedMotion";

const EASE = [0.65, 0, 0.35, 1] as const;
const pad = (n: number) => String(n).padStart(2, "0");
/** Position of station `i` along the rail, as a percentage. */
const along = (i: number) => `${(i / (stations.length - 1)) * 100}%`;

interface RailProps {
  orientation: "vertical" | "horizontal";
  /** Station the request is at. */
  at: number;
  /** Furthest station reached so far. */
  reached: number;
  reduced: boolean;
}

/**
 * The request's path: a line of stations with the red packet on it. Nodes
 * and packet sit on the same zero-width axis and are both centred on their
 * point with translate(-50%, -50%), so the packet always lands dead centre.
 */
function Rail({ orientation, at, reached, reduced }: RailProps) {
  const vertical = orientation === "vertical";
  const place = (i: number) => (vertical ? { left: 0, top: along(i) } : { top: 0, left: along(i) });
  const transition = { duration: reduced ? 0 : 0.6, ease: EASE };

  return (
    <div className={vertical ? "absolute bottom-3 left-3 top-3" : "absolute left-8 right-8 top-3"}>
      {/* Track, and the part of it the request has travelled. */}
      <div
        className={`absolute bg-ink/15 ${
          vertical ? "left-0 top-0 h-full w-0.5 -translate-x-1/2" : "left-0 top-0 h-0.5 w-full -translate-y-1/2"
        }`}
      />
      <motion.div
        className={`absolute bg-sovereign ${vertical ? "left-0 top-0 w-0.5 -translate-x-1/2" : "left-0 top-0 h-0.5 -translate-y-1/2"}`}
        initial={false}
        animate={vertical ? { height: along(reached) } : { width: along(reached) }}
        transition={transition}
      />

      {stations.map((s, i) => {
        const here = i === at;
        return (
          <div key={s.name}>
            {here && !reduced && (
              <span
                className="absolute size-5 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-sovereign/30"
                style={place(i)}
              />
            )}
            <span
              className={`absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors duration-300 ${
                here
                  ? "border-sovereign bg-paper"
                  : i <= reached
                    ? "border-sovereign bg-sovereign"
                    : "border-ink/25 bg-paper"
              }`}
              style={place(i)}
            />
            {vertical ? (
              <span
                className="absolute left-7 -translate-y-1/2 whitespace-nowrap leading-tight"
                style={{ top: along(i) }}
              >
                <span
                  className={`block text-2xl font-medium tracking-[-0.02em] transition-colors duration-300 lg:text-3xl ${
                    here ? "text-ink" : "text-ink/30"
                  }`}
                >
                  {s.name}
                </span>
                <span className={`block text-sm transition-colors duration-300 ${here ? "text-muted" : "text-ink/25"}`}>
                  {s.role}
                </span>
              </span>
            ) : (
              <span
                className={`absolute top-4 -translate-x-1/2 whitespace-nowrap text-xs font-medium transition-colors duration-300 ${
                  here ? "text-ink" : "text-ink/35"
                }`}
                style={{ left: along(i) }}
              >
                {s.name}
              </span>
            )}
          </div>
        );
      })}

      {/* The request. */}
      <motion.span
        className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal"
        style={vertical ? { left: 0 } : { top: 0 }}
        initial={false}
        animate={vertical ? { top: along(at) } : { left: along(at) }}
        transition={transition}
      />
    </div>
  );
}

/** What the station the request is at does, swapped as it moves. */
function Readout({ at, reduced }: { at: number; reduced: boolean }) {
  const s = stations[at];
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.dl
        key={s.name}
        initial={reduced ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? undefined : { opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
        className="grid gap-y-2"
      >
        {s.facts.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-6 text-base">
            <dt className="text-muted">{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </motion.dl>
    </AnimatePresence>
  );
}

/**
 * One prompt's journey, told as you scroll. A tracker shows the request (a
 * red packet) moving between stations inside a UK boundary it never
 * crosses: a sticky panel beside the steps on wider screens, a compact
 * sticky bar above them on phones.
 */
function Request() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const at = steps[active].at;
  const reached = Math.max(...steps.slice(0, active + 1).map((s) => s.at));
  const progress = `Step ${pad(active + 1)} / ${pad(steps.length)}`;

  return (
    <div className="shell mt-12 grid md:mt-20 md:grid-cols-12 md:gap-12">
      {/* Phones: compact tracker pinned under the nav. */}
      <div
        aria-hidden
        className="sticky top-16 z-10 -mx-4 self-start border-b border-line bg-paper/95 px-4 pb-10 pt-4 backdrop-blur md:hidden"
      >
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium text-sovereign">United Kingdom · 0 km abroad</span>
          <span className="tabular-nums text-muted">{progress}</span>
        </div>
        <div className="relative mt-4 h-3">
          <Rail orientation="horizontal" at={at} reached={reached} reduced={reduced} />
        </div>
      </div>

      {/* Wider screens: tracker panel, held in the middle of the viewport. */}
      <div aria-hidden className="hidden md:col-span-5 md:block">
        <div className="sticky top-24 flex h-[calc(100svh-8rem)] flex-col justify-center">
          <div className="border-2 border-dashed border-sovereign/40 p-6 lg:p-8">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium text-sovereign">United Kingdom</span>
              <span className="tabular-nums text-muted">{progress}</span>
            </div>
            <div className="relative mt-6 h-[min(38svh,21rem)]">
              <Rail orientation="vertical" at={at} reached={reached} reduced={reduced} />
            </div>
            <div className="mt-8 border-t border-line pt-5">
              <Readout at={at} reduced={reduced} />
            </div>
            <p className="mt-5 flex items-baseline justify-between border-t border-line pt-4 text-sm text-muted">
              Distance travelled outside the UK
              <span className="text-2xl font-medium tabular-nums text-sovereign">0 km</span>
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <ol className="md:col-span-6 md:col-start-7">
        {steps.map((step, i) => {
          const current = i === active;
          return (
            <motion.li
              key={step.title}
              className="flex min-h-[55svh] flex-col justify-center border-t border-line py-10 first:border-t-0 md:min-h-[65svh] md:py-0 md:first:border-t"
              onViewportEnter={() => setActive(i)}
              viewport={{ margin: "-45% 0px -45% 0px" }}
            >
              <span className="flex items-center gap-4 text-lg font-medium">
                <span className={`tabular-nums transition-colors duration-500 ${current ? "text-signal" : "text-muted"}`}>
                  {pad(i + 1)}
                </span>
                <span className="text-muted">{stations[step.at].name}</span>
              </span>
              <h3
                className={`mt-4 text-3xl font-medium tracking-[-0.03em] transition-colors duration-500 md:text-5xl ${
                  current ? "text-ink" : "text-ink/30"
                }`}
              >
                {step.title}
              </h3>
              <p
                className={`mt-5 max-w-xl text-xl leading-relaxed transition-colors duration-500 ${
                  current ? "text-ink/70" : "text-ink/30"
                }`}
              >
                {step.body}
              </p>
              {/* Phones: this step's station facts inline, as there's no side panel. */}
              <div className="mt-6 border-t border-line pt-4 md:hidden">
                <Readout at={step.at} reduced />
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

export default Request;
