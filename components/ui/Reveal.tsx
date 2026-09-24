"use client";

import { motion } from "motion/react";

interface RevealProps {
  children: React.ReactNode;
  /** Seconds to wait before animating, for simple staggers. */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "p" | "span";
}

/** Fades and lifts its children into view once, the first time they're scrolled to. */
function Reveal({ children, delay = 0, className, as = "div" }: RevealProps) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
