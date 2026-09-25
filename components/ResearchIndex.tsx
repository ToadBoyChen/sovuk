"use client";

import Link from "next/link";
import { useState } from "react";
import Arrow from "@/components/ui/Arrow";

/** A research piece, pre-formatted on the server for display. */
export interface ResearchItem {
  slug: string;
  title: string;
  summary: string;
  type: string;
  typeLabel: string;
  topic: string;
  authors: { slug: string; name: string }[];
  status: "planned" | "in-progress" | "published";
  statusLabel: string;
  dateLabel: string;
}

interface ResearchIndexProps {
  items: ResearchItem[];
  /** Type filters: [type, plural label]. */
  types: [string, string][];
  /** Initial type filter, e.g. from ?type=. */
  type?: string;
}

const CHIP = "border px-4 py-2 text-base font-medium transition-colors";
const chipState = (on: boolean) => (on ? "border-sovereign bg-sovereign text-paper" : "border-line hover:border-ink");

function Authors({ authors }: { authors: ResearchItem["authors"] }) {
  return (
    <span>
      {authors.map((a, i) => (
        <span key={a.slug}>
          {i > 0 && (i === authors.length - 1 ? " and " : ", ")}
          <Link href={`/team/${a.slug}`} className="underline-offset-4 hover:text-sovereign hover:underline">
            {a.name}
          </Link>
        </span>
      ))}
    </span>
  );
}

function Status({ item }: { item: ResearchItem }) {
  const active = item.status === "in-progress";
  return (
    <span className={`inline-flex items-center gap-2 text-sm font-medium ${active ? "text-sovereign" : "text-muted"}`}>
      <span
        aria-hidden
        className={`size-2 rounded-full ${active ? "animate-pulse-dot bg-sovereign" : "border border-muted"}`}
      />
      {item.statusLabel}
    </span>
  );
}

/**
 * The research page's body: type and topic filters, published pieces, then
 * the research plan — every upcoming piece with its lead, target and status.
 */
function ResearchIndex({ items, types, type: initialType = "" }: ResearchIndexProps) {
  const [type, setType] = useState(types.some(([t]) => t === initialType) ? initialType : "");
  const [topic, setTopic] = useState("");
  const topics = [...new Set(items.map((i) => i.topic))].sort();

  const pick = (t: string) => {
    setType(t);
    // Keep the URL shareable without a navigation.
    const url = new URL(window.location.href);
    if (t) url.searchParams.set("type", t);
    else url.searchParams.delete("type");
    window.history.replaceState(null, "", url);
  };

  const shown = items.filter((i) => (!type || i.type === type) && (!topic || i.topic === topic));
  const published = shown.filter((i) => i.status === "published");
  const plan = shown.filter((i) => i.status !== "published");

  return (
    <div>
      {/* Filters */}
      <div className="grid gap-4 border-y border-line py-6 md:grid-cols-[auto_1fr] md:gap-x-8">
        <p className="text-base font-medium text-muted md:py-2">Type</p>
        <div className="flex flex-wrap gap-2">
          {[["", "All"] as [string, string], ...types].map(([t, label]) => (
            <button
              key={t || "all"}
              type="button"
              aria-pressed={type === t}
              onClick={() => pick(t)}
              className={`${CHIP} ${chipState(type === t)}`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-base font-medium text-muted md:py-2">Topic</p>
        <div className="flex flex-wrap gap-2">
          {["", ...topics].map((t) => (
            <button
              key={t || "all"}
              type="button"
              aria-pressed={topic === t}
              onClick={() => setTopic(t)}
              className={`${CHIP} ${chipState(topic === t)}`}
            >
              {t || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Published */}
      <section aria-labelledby="published-heading" className="mt-16 md:mt-24">
        <h2 id="published-heading" className="text-3xl font-medium tracking-[-0.03em] md:text-5xl">
          Published
        </h2>
        {published.length ? (
          <ul className="mt-8">
            {published.map((item) => (
              <li key={item.slug} className="border-t border-line last:border-b">
                <Link
                  href={`/research/${item.slug}`}
                  className="group grid gap-3 py-8 md:grid-cols-12 md:gap-6"
                >
                  <span className="text-base text-muted md:col-span-2">
                    {item.dateLabel}
                    <span className="block">{item.typeLabel}</span>
                  </span>
                  <span className="md:col-span-8">
                    <span className="block text-2xl font-medium tracking-[-0.02em] transition-colors group-hover:text-sovereign md:text-3xl">
                      {item.title}
                    </span>
                    <span className="mt-2 block text-lg text-ink/70">{item.summary}</span>
                    <span className="mt-3 block text-base text-muted">
                      {item.authors.map((a) => a.name).join(", ")} · {item.topic}
                    </span>
                  </span>
                  <Arrow className="hidden self-center justify-self-end text-2xl text-sovereign md:col-span-2 md:block" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-ink/70">
            {items.some((i) => i.status === "published")
              ? "Nothing published matches these filters yet."
              : "Our first pieces are in progress. The plan below shows what is coming, who is leading each piece, and when it is due."}
          </p>
        )}
      </section>

      {/* Plan */}
      <section aria-labelledby="plan-heading" className="mt-16 md:mt-24">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="plan-heading" className="text-3xl font-medium tracking-[-0.03em] md:text-5xl">
            Research plan
          </h2>
          <p className="text-base text-muted">Dates are targets and may move.</p>
        </div>
        {plan.length ? (
          <>
            <div
              aria-hidden
              className="mt-8 hidden grid-cols-12 gap-6 border-b border-ink pb-3 text-sm font-medium text-muted md:grid"
            >
              <span className="col-span-2">Target</span>
              <span className="col-span-6">Piece</span>
              <span className="col-span-2">Topic and type</span>
              <span className="col-span-2">Lead</span>
            </div>
            <ul className="mt-8 md:mt-0">
              {plan.map((item) => (
                <li key={item.slug} className="grid gap-3 border-t border-line py-7 first:border-t-0 md:grid-cols-12 md:gap-6">
                  <div className="flex items-baseline justify-between gap-4 md:col-span-2 md:block">
                    <p className="text-lg font-medium tabular-nums">{item.dateLabel}</p>
                    <div className="md:mt-2">
                      <Status item={item} />
                    </div>
                  </div>
                  <div className="md:col-span-6">
                    <Link
                      href={`/research/${item.slug}`}
                      className="group inline-flex items-baseline gap-3 text-2xl font-medium tracking-[-0.02em] transition-colors hover:text-sovereign"
                    >
                      {item.title}
                      <Arrow className="text-lg text-sovereign" />
                    </Link>
                    <p className="mt-2 text-lg text-ink/70">{item.summary}</p>
                  </div>
                  <p className="text-base text-muted md:col-span-2">
                    <span className="text-ink">{item.topic}</span>
                    <span className="md:block"> · {item.typeLabel}</span>
                  </p>
                  <p className="text-base md:col-span-2">
                    <span className="text-muted md:hidden">Lead: </span>
                    <Authors authors={item.authors} />
                  </p>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-6 text-xl text-ink/70">Nothing planned matches these filters.</p>
        )}
      </section>
    </div>
  );
}

export default ResearchIndex;
