import type { Metadata } from "next";
import { Suspense } from "react";
import ResearchIndex, { type ResearchItem } from "@/components/ResearchIndex";
import ResearchIndexFromUrl from "@/components/ResearchIndexFromUrl";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import { team } from "@/content/team";
import { formatDate, research, STATUSES, TYPES } from "@/lib/research";

export const metadata: Metadata = {
  title: "Research",
  description: "Policy briefs, papers and notes on sovereign AI compute, and our research plan.",
};

const items: ResearchItem[] = research.map((r) => ({
  ...r,
  typeLabel: TYPES[r.type],
  statusLabel: STATUSES[r.status],
  dateLabel: formatDate(r.date),
  authors: r.authors.map((slug) => ({ slug, name: team.find((m) => m.slug === slug)!.name })),
}));

const types: [string, string][] = [
  ["policy-brief", "Policy briefs"],
  ["paper", "Papers"],
  ["note", "Notes"],
];

/** Research: published pieces and the plan, filterable by type and topic. */
export default function ResearchPage() {
  return (
    <section className="pb-28 pt-32 md:pb-44 md:pt-44">
      <div className="shell">
        <Eyebrow>Research</Eyebrow>
        <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-12">
          <Reveal className="md:col-span-8">
            <h1 className="text-4xl font-medium leading-[1.02] sm:text-5xl tracking-[-0.035em] text-balance md:text-7xl xl:text-8xl">
              Research<span className="text-signal">.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-4 md:col-start-9 md:self-end xl:col-span-3 xl:col-start-10">
            <p className="text-xl leading-relaxed text-ink/70 md:text-2xl">
              Policy briefs, papers and notes on sovereign AI compute. Every piece has a named lead and a target date.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 md:mt-24">
          {/* ?type= is only known in the browser; until then, unfiltered. */}
          <Suspense fallback={<ResearchIndex items={items} types={types} />}>
            <ResearchIndexFromUrl items={items} types={types} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
