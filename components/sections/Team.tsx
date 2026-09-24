"use client";

import { useState } from "react";
import DotPortrait from "@/components/ui/DotPortrait";
import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import { team } from "@/content/team";

function Team() {
  // Which portrait is revealed, and where the pointer entered it (the reveal's origin).
  const [active, setActive] = useState<{ i: number; x: number; y: number } | null>(null);

  const enter = (i: number, e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setActive({ i, x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
  };

  return (
    <Section
      id="team"
      label="Team"
      title="Meet the people building it."
      intro="Three equal co-founders — from mathematics, architecture and astrophysics."
    >
      <ul className="shell mt-14 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 md:mt-20">
        {team.map((member, i) => {
          const revealed = active?.i === i;
          return (
            <Reveal as="li" key={member.name} delay={i * 0.08}>
              <button
                type="button"
                className="block w-full text-left"
                aria-pressed={revealed}
                aria-label={`${member.name}, ${member.role} — show photo`}
                onPointerEnter={(e) => e.pointerType === "mouse" && enter(i, e)}
                onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
                onClick={() => setActive((a) => (a?.i === i ? null : { i, x: 0.5, y: 0.5 }))}
              >
                <DotPortrait
                  src={member.photo}
                  alt={member.name}
                  revealed={revealed}
                  origin={revealed ? { x: active.x, y: active.y } : undefined}
                />
              </button>

              <div className="mt-6 flex items-baseline justify-between gap-4">
                <h3 className="text-3xl font-medium tracking-[-0.02em] md:text-4xl">{member.name}</h3>
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-base font-medium text-muted transition-colors hover:text-sovereign"
                    aria-label={`${member.name} on LinkedIn`}
                  >
                    LinkedIn ↗
                  </a>
                )}
              </div>
              <p className="mt-1 text-lg text-muted">{member.role}</p>
              <div className="mt-6 border-t border-line pt-4">
                <p className="text-xl font-medium text-sovereign">{member.field}</p>
                <p className="mt-1 text-lg text-ink/70">{member.background}</p>
              </div>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}

export default Team;
