"use client";

import { motion, useScroll } from "motion/react";

/** A thin bar across the top of the window showing how far through the page you are. */
function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-signal print:hidden"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

export default ReadingProgress;
