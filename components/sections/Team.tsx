"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Arrow from "@/components/ui/Arrow";
import { motion } from "motion/react";
import DotPortrait from "@/components/ui/DotPortrait";
import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import { team } from "@/content/team";

/** A random order of `n` indices (Fisher–Yates). */
function shuffled(n: number) {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// Server (and hydration) use content order; the browser then swaps in one
// shuffle per page load, before the section is scrolled to.
const contentOrder = team.map((_, i) => i);
let visitOrder: number[] | null = null;
const noSubscribe = () => () => {};
const useVisitOrder = () =>
  useSyncExternalStore(
    noSubscribe,
    () => (visitOrder ??= shuffled(team.length)),
    () => contentOrder,
  );

/**
 * The founders as equals: one row of identical cards in a random order per
 * visit, with portraits that reveal together.
 */
function Team() {
  const order = useVisitOrder();

  // All portraits reveal together, once, when the row scrolls into view.
  const [revealed, setRevealed] = useState(false);

  return (
    <Section
      id="team"
      label="Team"
      title="The founding team."
      intro="Three equal co-founders, from mathematics, architecture and astrophysics."
    >
        <motion.ul
          className="shell mt-14 grid grid-cols-1 gap-x-6 gap-y-14 md:mt-20 md:grid-cols-3"
          onViewportEnter={() => setTimeout(() => setRevealed(true), 600)}
          viewport={{ once: true, amount: 0.4 }}
        >
          {order.map((i, pos) => {
            const member = team[i];
            return (
              <Reveal as="li" key={member.name} delay={pos * 0.08}>
                <div>
                  <DotPortrait
                    src={member.photo}
                    alt={member.name}
                    revealed={revealed}
                  />
                  <div className="mt-6 flex items-baseline justify-between gap-4">
                    <h3 className="text-3xl font-medium tracking-[-0.02em] md:text-4xl">
                      {member.name}
                    </h3>
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="group inline-flex shrink-0 items-center gap-2 text-base font-medium text-muted transition-colors hover:text-sovereign"
                        aria-label={`${member.name} on LinkedIn`}
                      >
                        LinkedIn <Arrow direction="up-right" />
                      </a>
                    )}
                  </div>
                  <p className="mt-1 text-lg text-muted">{member.role}</p>
                  <dl className="mt-6 grid gap-4 border-t border-line pt-4">
                    <div>
                      <dt className="text-base text-muted">Background</dt>
                      <dd className="mt-1 text-lg">
                        <span className="font-medium text-sovereign">
                          {member.field}
                        </span>
                        <span className="text-ink/70">
                          {" "}
                          · {member.background}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-base text-muted">Leads on</dt>
                      <dd className="mt-1 text-lg">{member.focus}</dd>
                    </div>
                  </dl>
                  <Link
                    href={`/team/${member.slug}`}
                    className="group mt-6 inline-flex items-center gap-3 text-lg font-medium text-sovereign transition-colors hover:text-ink"
                    aria-label={`Read more about ${member.name}`}
                  >
                    Read more
                    <Arrow />
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </motion.ul>
    </Section>
  );
}

export default Team;
