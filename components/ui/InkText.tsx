"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

/** A paragraph whose words darken from faint grey to ink as it scrolls through the viewport. */
function InkText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 45%"],
  });
  const words = text.split(" ");

  return (
    <p ref={ref} className={className}>
      {/* Screen readers get the sentence once, not word-by-word. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, i) => (
          <Word
            key={i}
            progress={scrollYProgress}
            range={[i / words.length, (i + 1) / words.length]}
          >
            {word}
          </Word>
        ))}
      </span>
    </p>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block whitespace-pre">
      {children}{" "}
    </motion.span>
  );
}

export default InkText;
