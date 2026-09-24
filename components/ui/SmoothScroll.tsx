"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { cancelFrame, frame } from "motion/react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Site-wide inertial scrolling. Disabled entirely for reduced-motion visitors.
 *
 * Lenis is stepped from Motion's frame loop (not its own rAF), so the scroll
 * position and every scroll-linked effect update in the same frame — two
 * independent loops drift a frame apart, which reads as slight judder.
 */
function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -72 } });
    const update = ({ timestamp }: { timestamp: number }) => lenis.raf(timestamp);
    frame.update(update, true);
    return () => {
      cancelFrame(update);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}

export default SmoothScroll;
