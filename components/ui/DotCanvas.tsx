"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import { readTokenRgb } from "@/lib/dotMatrix";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * The site's dot-matrix renderer (hero glyph, roadmap).
 *
 * Draws on demand only — there is no always-on animation loop. The only
 * ambient motion is the occasional glitch: a bit flip, a short run of flips
 * (sometimes red) or a brief sideways scanline tear. A short loop runs only while booting, while dots are displaced
 * (cursor repel or a scatter burst) or while group emphasis is easing.
 */

export interface Dot {
  /** Grid cell. */
  x: number;
  y: number;
  /** Radius scale, 0-1. Default 1. */
  level?: number;
  /** Opacity, 0-1. Dots under 0.5 are "off" dots: shown from the start, and flip on. Default 1. */
  alpha?: number;
  /** Index into `tones`. Default 0. */
  tone?: number;
  /** Boot order, 0-1 (0 = first). Default random. */
  delay?: number;
  /** Optional group id, for `activeGroup` emphasis. */
  group?: number;
}

/** Either a fixed list, or a builder called with the grid size (used with `cell`). */
export type DotSource = Dot[] | ((cols: number, rows: number) => Dot[]);

interface DotCanvasProps {
  dots: DotSource | null;
  /** Fixed grid size. Omit and pass `cell` to derive the grid from the container size. */
  cols?: number;
  rows?: number;
  /** Cell size in px when deriving the grid from the container. */
  cell?: number;
  /** CSS colour tokens, indexed by `Dot.tone`. */
  tones?: string[];
  /** Average bit flips per second across the whole canvas (0 disables). */
  flips?: number;
  /** Cursor repel push, in cells (0 disables). */
  repel?: number;
  /** Boot duration in ms (0 = none). Starts when first scrolled into view. */
  bootMs?: number;
  /** "flicker" = dots stutter on (glyph); "fill" = dots fade in in delay order (bars). */
  bootStyle?: "flicker" | "fill";
  /** When set, dots in this group stay full strength and the others dim. */
  activeGroup?: number | null;
  /** Extra canvas margin in px so pushed dots aren't clipped. */
  bleed?: number;
  /** How far (in cells) a burst throws dots before they spring home. */
  scatter?: number;
  /** Increment to scatter the dots. A non-zero initial value makes them fly in on first view. */
  burst?: number;
  /**
   * When `dots` changes, fade each dot from its old opacity to its new one
   * instead of snapping, staggered by `Dot.delay` over this many ms.
   */
  transitionMs?: number;
  /**
   * 0-1: blends each dot between its home cell (0) and its own fixed random
   * spot inside the canvas box (1), so a scattered field never leaves the
   * box. Set it continuously (e.g. from scroll) to scrub an assembly;
   * overrides the springs while set. Pass a MotionValue to drive it every
   * frame without re-rendering React.
   */
  spread?: number | MotionValue<number>;
  /**
   * While `spread` > 0, each scattered spot wanders at up to this fraction of
   * the box per second, bouncing off the edges. The loop stops (zero cost)
   * once the dots are fully assembled or off-screen.
   */
  drift?: number;
  className?: string;
}

interface LiveDot {
  x: number;
  y: number;
  level: number;
  alpha: number;
  tone: number;
  delay: number;
  group: number;
  off: boolean;
  flipped: boolean;
  /** Glitch: draw this flip in signal red. */
  tint: boolean;
  /** Glitch: temporary sideways offset, in cells (a "scanline tear"). */
  gx: number;
  /** Opacity currently on screen; eases toward `alpha` after a dots change. */
  shown: number;
  /** Random spot in the box (0-1 each axis), used by `spread`. */
  rx: number;
  ry: number;
  /** Direction of that spot's drift (unit vector scaled 0.4-1). */
  dx: number;
  dy: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  emph: number;
}

const DOT_RADIUS = 0.36; // fraction of a cell
const SETTLE_MS = 220;
const FADE_MS = 160;
const SPRING_STIFFNESS = 300;
const SPRING_DAMPING = 54;
const REPEL_RADIUS_CELLS = 9;
const MOTION_EPSILON = 0.05;
const DIM = 0.6;

const fract = (n: number) => n - Math.floor(n);

function toLive(d: Dot): LiveDot {
  const alpha = d.alpha ?? 1;
  return {
    x: d.x,
    y: d.y,
    level: d.level ?? 1,
    alpha,
    tone: d.tone ?? 0,
    delay: d.delay ?? Math.random(),
    group: d.group ?? -1,
    off: alpha < 0.5,
    flipped: false,
    tint: false,
    gx: 0,
    shown: alpha,
    // Deterministic hash so the scattered layout is stable across rebuilds.
    rx: fract(Math.sin(d.x * 12.9898 + d.y * 78.233) * 43758.5453),
    ry: fract(Math.sin(d.x * 39.3468 + d.y * 11.135) * 24634.6345),
    ...(() => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.4 + Math.random() * 0.6;
      return { dx: Math.cos(angle) * speed, dy: Math.sin(angle) * speed };
    })(),
    ox: 0,
    oy: 0,
    vx: 0,
    vy: 0,
    emph: 1,
  };
}

function DotCanvas(props: DotCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  // The engine reads the latest props through this ref; prop changes only
  // request a redraw, they never restart it.
  const propsRef = useRef(props);
  const kickRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    propsRef.current = props;
    kickRef.current?.();
  });

  const { bleed = 0, className = "" } = props;
  const tonesKey = (props.tones ?? ["--ink"]).join(",");

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!container || !canvas || !ctx) return;

    const palette = tonesKey.split(",").map((t) => {
      const [r, g, b] = readTokenRgb(t);
      return `rgb(${r},${g},${b})`;
    });
    const [sr, sg, sb] = readTokenRgb("--signal");
    const signal = `rgb(${sr},${sg},${sb})`;

    let dots: LiveDot[] = [];
    let byCell = new Map<number, LiveDot>();
    let source: DotSource | null = null;
    let cell = 0;
    let offX = 0;
    let offY = 0;
    let w = 0;
    let h = 0;

    let bootStart = -1; // -1 = not yet scrolled into view
    let inView = false;
    let frame = 0;
    let last = 0;
    let flipTimer: ReturnType<typeof setTimeout> | undefined;
    let lastBurst = 0;
    let rebuiltAt = 0;
    const mouse = { x: 0, y: 0, active: false };

    const rebuild = () => {
      const p = propsRef.current;
      source = p.dots;
      if (!source || w === 0) {
        dots = [];
        return;
      }
      let cols: number;
      let rows: number;
      if (p.cell) {
        cell = p.cell;
        cols = Math.max(1, Math.floor(w / cell));
        rows = Math.max(1, Math.floor(h / cell));
      } else {
        cols = p.cols ?? 1;
        rows = p.rows ?? cols;
        cell = Math.min(w / cols, h / rows);
      }
      offX = (w - cols * cell) / 2;
      offY = (h - rows * cell) / 2;
      const list = typeof source === "function" ? source(cols, rows) : source;
      // Carry each cell's on-screen opacity across the change so it can ease.
      const previous = p.transitionMs ? new Map(dots.map((d) => [d.x * 65536 + d.y, d.shown])) : null;
      // Sorted by tone so drawing changes fillStyle as rarely as possible.
      dots = list.map(toLive).sort((a, b) => a.tone - b.tone);
      byCell = new Map(dots.map((d) => [d.x * 65536 + d.y, d]));
      if (previous?.size) {
        for (const d of dots) d.shown = previous.get(d.x * 65536 + d.y) ?? 0;
        rebuiltAt = performance.now();
      }
    };

    /** Paints one frame. Returns true if anything is still moving. */
    const paint = (now: number, dt: number): boolean => {
      const p = propsRef.current;
      if (p.dots !== source) rebuild();

      const bootMs = reduced ? 0 : (p.bootMs ?? 0);
      const elapsed = bootStart < 0 ? -1 : now - bootStart;
      const booting = bootMs > 0 && (elapsed < 0 || elapsed < bootMs + SETTLE_MS);
      const flicker = (p.bootStyle ?? "flicker") === "flicker";
      const repelPush = reduced ? 0 : cell * (p.repel ?? 0);
      const repelR = cell * REPEL_RADIUS_CELLS;
      const active = p.activeGroup ?? null;
      const spread = typeof p.spread === "object" ? p.spread.get() : p.spread;
      let moving = booting;

      // Scatter burst: throw every dot off its cell; the springs bring them home.
      const burst = p.burst ?? 0;
      if (burst !== lastBurst && dots.length) {
        lastBurst = burst;
        if (!reduced) {
          const reach = cell * (p.scatter ?? 8);
          for (const d of dots) {
            const angle = Math.random() * Math.PI * 2;
            const r = reach * (0.3 + Math.random() * 0.7);
            d.ox = Math.cos(angle) * r;
            d.oy = Math.sin(angle) * r;
            d.vx = d.vy = 0;
          }
          moving = true;
        }
      }

      ctx.save();
      ctx.clearRect(0, 0, w + bleed * 2, h + bleed * 2);
      ctx.translate(bleed + offX, bleed + offY);
      let tone = -1;
      const tinted: [number, number, number, number][] = [];

      for (const d of dots) {
        const cx = (d.x + 0.5) * cell;
        const cy = (d.y + 0.5) * cell;

        let vis = 1;
        if (bootMs > 0 && !d.off) {
          const start = d.delay * bootMs;
          if (elapsed < start) vis = 0;
          else if (flicker) vis = elapsed < start + SETTLE_MS ? (Math.random() < 0.5 ? 1 : 0.1) : 1;
          else vis = Math.min(1, (elapsed - start) / FADE_MS);
        }

        if (spread !== undefined) {
          // Drift the scattered spot while there's any scatter to see.
          if (p.drift && spread > 0 && dt > 0) {
            d.rx += d.dx * p.drift * dt;
            d.ry += d.dy * p.drift * dt;
            // Bounce off the box edges.
            if (d.rx < 0 || d.rx > 1) {
              d.dx = -d.dx;
              d.rx = Math.min(1, Math.max(0, d.rx));
            }
            if (d.ry < 0 || d.ry > 1) {
              d.dy = -d.dy;
              d.ry = Math.min(1, Math.max(0, d.ry));
            }
            moving = true;
          }
          // Scrubbed: blend from home toward this dot's random spot in the box
          // (box coordinates are offset by the grid's centring inset).
          const margin = cell;
          const tx = margin + d.rx * (w - margin * 2) - offX - cx;
          const ty = margin + d.ry * (h - margin * 2) - offY - cy;
          d.ox = tx * spread;
          d.oy = ty * spread;
          d.vx = d.vy = 0;
        } else if (
          dt > 0 &&
          (repelPush > 0 || d.ox !== 0 || d.oy !== 0 || d.vx !== 0 || d.vy !== 0)
        ) {
          let tx = 0;
          let ty = 0;
          if (repelPush > 0 && mouse.active) {
            const dx = cx - mouse.x;
            const dy = cy - mouse.y;
            const dist = Math.hypot(dx, dy) || 0.0001;
            if (dist < repelR) {
              const push = (1 - dist / repelR) * repelPush;
              tx = (dx / dist) * push;
              ty = (dy / dist) * push;
            }
          }
          d.vx += ((tx - d.ox) * SPRING_STIFFNESS - d.vx * SPRING_DAMPING) * dt;
          d.vy += ((ty - d.oy) * SPRING_STIFFNESS - d.vy * SPRING_DAMPING) * dt;
          d.ox += d.vx * dt;
          d.oy += d.vy * dt;
          if (Math.abs(d.vx) + Math.abs(d.vy) + Math.abs(d.ox - tx) + Math.abs(d.oy - ty) > MOTION_EPSILON) {
            moving = true;
          } else if (tx === 0 && ty === 0) {
            d.ox = d.oy = d.vx = d.vy = 0; // settled home
          }
        }

        if (d.shown !== d.alpha) {
          if (dt === 0) d.shown = d.alpha;
          else {
            if (now - rebuiltAt >= d.delay * (p.transitionMs ?? 0)) {
              d.shown += (d.alpha - d.shown) * Math.min(1, dt * 12);
              if (Math.abs(d.alpha - d.shown) < 0.01) d.shown = d.alpha;
            }
            moving = true;
          }
        }

        const target = active === null || d.group < 0 || d.group === active ? 1 : DIM;
        if (dt > 0 && Math.abs(target - d.emph) > 0.005) {
          d.emph += (target - d.emph) * Math.min(1, dt * 10);
          moving = true;
        } else d.emph = target;

        // A flipped bit shows the opposite state: off dots light up, on dots go dark.
        let alpha = d.shown;
        let level = d.level;
        if (d.flipped) {
          if (d.off) {
            alpha = 1;
            level = 1;
          } else alpha = 0.08;
        }
        alpha *= vis * d.emph;
        if (alpha < 0.01) continue;

        const px = cx + d.ox + d.gx * cell;
        const py = cy + d.oy;
        const r = cell * DOT_RADIUS * level;
        if (d.tint) {
          tinted.push([px, py, r, alpha]);
          continue;
        }
        if (d.tone !== tone) {
          tone = d.tone;
          ctx.fillStyle = palette[tone] ?? palette[0];
        }
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Red glitch bits go on top.
      if (tinted.length) {
        ctx.fillStyle = signal;
        for (const [px, py, r, a] of tinted) {
          ctx.globalAlpha = Math.max(a, 0.85);
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
      return moving;
    };

    // Short-lived loop: runs only while something is moving, then stops.
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      frame = paint(now, dt) && inView ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (frame) return;
      if (reduced || !inView) {
        paint(performance.now(), 0);
        return;
      }
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };
    kickRef.current = kick;

    const resize = () => {
      w = container.clientWidth;
      h = container.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = (w + bleed * 2) * dpr;
      canvas.height = (h + bleed * 2) * dpr;
      canvas.style.width = `${w + bleed * 2}px`;
      canvas.style.height = `${h + bleed * 2}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rebuild();
      paint(performance.now(), 0);
    };

    /** A contiguous run of dots along the row starting at `d`. */
    const runFrom = (d: LiveDot, length: number) => {
      const run: LiveDot[] = [];
      for (let i = 0; i < length; i++) {
        const next = byCell.get((d.x + i) * 65536 + d.y);
        if (!next) break;
        run.push(next);
      }
      return run;
    };

    // Entropy, slightly glitchy: mostly single bit flips, sometimes a short
    // run along a row (occasionally red), rarely a sideways scanline tear.
    const glitch = () => {
      const d = dots[(Math.random() * dots.length) | 0];
      const roll = Math.random();
      let hit: LiveDot[];
      if (roll < 0.62) {
        hit = [d];
        d.flipped = true;
        d.tint = Math.random() < 0.15;
      } else if (roll < 0.9) {
        hit = runFrom(d, 2 + ((Math.random() * 4) | 0));
        const red = Math.random() < 0.35;
        for (const h of hit) {
          h.flipped = true;
          h.tint = red;
        }
      } else {
        hit = runFrom(d, 4 + ((Math.random() * 9) | 0));
        const shift = (Math.random() < 0.5 ? -1 : 1) * (Math.random() < 0.7 ? 1 : 2);
        for (const h of hit) h.gx = shift;
      }
      kick();
      setTimeout(() => {
        for (const h of hit) {
          h.flipped = false;
          h.tint = false;
          h.gx = 0;
        }
        kick();
      }, 70 + Math.random() * 180);
    };

    const scheduleFlip = () => {
      const rate = propsRef.current.flips ?? 0;
      if (reduced || rate <= 0) return;
      flipTimer = setTimeout(() => {
        if (inView && dots.length) glitch();
        scheduleFlip();
      }, (1000 / rate) * (0.4 + Math.random() * 1.2));
    };

    const onMove = (e: PointerEvent) => {
      if (!inView || e.pointerType !== "mouse" || !(propsRef.current.repel ?? 0)) return;
      const rect = container.getBoundingClientRect();
      const margin = cell * REPEL_RADIUS_CELLS;
      const inside =
        e.clientX > rect.left - margin &&
        e.clientX < rect.right + margin &&
        e.clientY > rect.top - margin &&
        e.clientY < rect.bottom + margin;
      if (!inside && !mouse.active) return;
      mouse.active = inside;
      mouse.x = e.clientX - rect.left - offX;
      mouse.y = e.clientY - rect.top - offY;
      kick();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView && bootStart < 0) bootStart = performance.now();
        if (inView) kick();
        else mouse.active = false;
      },
      { rootMargin: "80px" }
    );
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    io.observe(container);
    resize();
    scheduleFlip();
    // A MotionValue spread repaints on change, bypassing React entirely.
    const spreadSource = propsRef.current.spread;
    const unsubscribeSpread = typeof spreadSource === "object" ? spreadSource.on("change", kick) : undefined;
    if (!reduced) window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      kickRef.current = null;
      unsubscribeSpread?.();
      cancelAnimationFrame(frame);
      clearTimeout(flipTimer);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduced, bleed, tonesKey]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute"
        style={{ left: -bleed, top: -bleed }}
      />
    </div>
  );
}

export default DotCanvas;
