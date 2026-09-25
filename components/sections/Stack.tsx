"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { stack } from "@/content/stack";
import { useReducedMotion } from "@/lib/useReducedMotion";

// Plate layout, as % of the visual's height: first plate's centre, spacing,
// and the gap that opens beneath the selected plate.
const FIRST = 17;
const GAP = 11;
const OPEN = 6;

/** Dots printed on each plate, echoing the site's dot matrix. */
const DOTS = {
  backgroundImage: "radial-gradient(circle, currentColor 1.2px, transparent 1.7px)",
  backgroundSize: "12px 12px",
};

/**
 * The sovereign stack as isometric plates beside a list of layers. Selecting
 * a layer (hover, click or arrow keys) lifts its plate out of the stack.
 */
function Stack() {
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState(0);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const step = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + stack.length) % stack.length;
    setSelected(next);
    tabsRef.current[next]?.focus();
  };

  return (
    <div className="shell mt-10 grid gap-6 md:mt-20 md:grid-cols-12 md:items-center md:gap-12">
      {/* Plates. On phones they sit left with a tappable label beside each. */}
      <div className="relative mx-auto aspect-square w-full max-w-md md:col-span-5 md:aspect-[4/5] md:max-w-none">
        {stack.map((layer, i) => {
          const active = i === selected;
          const top = FIRST + i * GAP + (i > selected ? OPEN : 0);
          return (
            <motion.div
              key={layer.title}
              aria-hidden
              className="absolute left-[36%] aspect-square w-[46%] -translate-x-1/2 -translate-y-1/2 cursor-pointer md:left-1/2 md:w-[58%]"
              style={{ zIndex: stack.length - i }}
              initial={false}
              animate={{ top: `${top}%` }}
              transition={{ duration: reduced ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setSelected(i)}
              onPointerEnter={(e) => e.pointerType === "mouse" && setSelected(i)}
            >
              <div
                className={`size-full border-2 transition-colors duration-300 ${
                  active ? "border-sovereign bg-sovereign-soft text-sovereign" : "border-ink/20 bg-paper text-ink/15"
                }`}
                style={{ ...DOTS, transform: "rotateX(60deg) rotateZ(-45deg)" }}
              />
            </motion.div>
          );
        })}
        {stack.map((layer, i) => {
          const active = i === selected;
          const top = FIRST + i * GAP + (i > selected ? OPEN : 0);
          return (
            <motion.button
              key={layer.title}
              type="button"
              aria-pressed={active}
              className={`absolute left-[72%] -translate-y-1/2 whitespace-nowrap text-left text-base font-medium transition-colors md:hidden ${
                active ? "text-sovereign" : "text-ink/40"
              }`}
              initial={false}
              animate={{ top: `${top}%` }}
              transition={{ duration: reduced ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setSelected(i)}
            >
              {layer.title}
            </motion.button>
          );
        })}
      </div>

      {/* Phones: the selected layer, right under the plates. */}
      <div className="md:hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selected}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="border-t border-line pt-5"
          >
            <p className="flex items-baseline gap-4">
              <span className="text-lg font-medium tabular-nums text-signal">{String(selected + 1).padStart(2, "0")}</span>
              <span className="text-3xl font-medium tracking-[-0.03em]">{stack[selected].title}</span>
            </p>
            <p className="mt-3 text-lg leading-relaxed text-ink/70">{stack[selected].summary}</p>
            <ul className="mt-4 grid gap-2">
              {stack[selected].points.map((point) => (
                <li key={point} className="flex items-center gap-3 text-base">
                  <span aria-hidden className="h-[3px] w-4 bg-sovereign" />
                  {point}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Layers */}
      <div
        role="tablist"
        aria-orientation="vertical"
        aria-label="Layers of the sovereign stack"
        className="hidden md:col-span-6 md:col-start-7 md:block"
      >
        {stack.map((layer, i) => {
          const active = i === selected;
          return (
            <div key={layer.title} className="border-t border-line last:border-b">
              <button
                ref={(el) => {
                  tabsRef.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`layer-tab-${i}`}
                aria-selected={active}
                aria-controls={`layer-panel-${i}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setSelected(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                onPointerEnter={(e) => e.pointerType === "mouse" && setSelected(i)}
                className="flex w-full items-baseline gap-6 py-5 text-left md:py-6"
              >
                <span className={`text-lg font-medium tabular-nums ${active ? "text-signal" : "text-muted"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`text-3xl font-medium tracking-[-0.03em] transition-colors duration-300 md:text-4xl ${
                    active ? "text-ink" : "text-ink/30 hover:text-ink/60"
                  }`}
                >
                  {layer.title}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {active && (
                  <motion.div
                    id={`layer-panel-${i}`}
                    role="tabpanel"
                    aria-labelledby={`layer-tab-${i}`}
                    initial={reduced ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduced ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-xl text-xl leading-relaxed text-ink/70">{layer.summary}</p>
                    <ul className="flex flex-wrap gap-x-8 gap-y-2 pt-5 pb-7">
                      {layer.points.map((point) => (
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
  );
}

export default Stack;
