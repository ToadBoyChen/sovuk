import "server-only";

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import { parse } from "yaml";
import { team } from "@/content/team";

/**
 * Research pieces: one MDX file each in content/research, described by its
 * YAML frontmatter (see content/research/_template.mdx). Files starting
 * with "_" are ignored. Everything else — lists, the plan, author pages,
 * the home-page preview — is derived from these files at build time, and a
 * malformed file fails the build with a message naming it.
 */

export const TYPES = { "policy-brief": "Policy brief", paper: "Paper", note: "Note" } as const;
export const STATUSES = { planned: "Planned", "in-progress": "In progress", published: "Published" } as const;

export type ResearchType = keyof typeof TYPES;
export type ResearchStatus = keyof typeof STATUSES;

export interface Research {
  slug: string;
  title: string;
  summary: string;
  type: ResearchType;
  topic: string;
  /** Founder slugs; the first is the lead. */
  authors: string[];
  status: ResearchStatus;
  /** "YYYY-MM" target while planned or in progress; "YYYY-MM-DD" once published. */
  date: string;
  /** Section headings (## and ###), with the ids rehype-slug gives them. */
  headings: { id: string; text: string; level: 2 | 3 }[];
  /** Whether anything is written below the frontmatter. */
  hasBody: boolean;
  /** Estimated minutes to read the body. */
  minutes: number;
}

const DIR = path.join(process.cwd(), "content/research");

function read(file: string): Research {
  const fail = (why: string): never => {
    throw new Error(`content/research/${file}: ${why}`);
  };
  const src = readFileSync(path.join(DIR, file), "utf8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(src);
  if (!match) fail("missing frontmatter");
  const d = parse(match![1]) ?? {};
  const body = src.slice(match![0].length);

  for (const key of ["title", "summary", "topic"]) {
    if (typeof d[key] !== "string" || !d[key].trim()) fail(`"${key}" is required`);
  }
  if (!(d.type in TYPES)) fail(`"type" must be one of ${Object.keys(TYPES).join(", ")}`);
  if (!(d.status in STATUSES)) fail(`"status" must be one of ${Object.keys(STATUSES).join(", ")}`);
  if (!Array.isArray(d.authors) || !d.authors.length) fail(`"authors" must list at least one founder`);
  for (const a of d.authors) {
    if (!team.some((m) => m.slug === a)) fail(`unknown author "${a}" (use slugs from content/team.ts)`);
  }
  const date = String(d.date ?? "");
  const pattern = d.status === "published" ? /^\d{4}-\d{2}-\d{2}$/ : /^\d{4}-\d{2}(-\d{2})?$/;
  if (!pattern.test(date)) {
    fail(d.status === "published" ? `"date" must be YYYY-MM-DD once published` : `"date" must be YYYY-MM`);
  }

  return {
    slug: file.replace(/\.mdx$/, ""),
    title: d.title,
    summary: d.summary,
    type: d.type,
    topic: d.topic,
    authors: d.authors,
    status: d.status,
    date,
    ...outline(body),
  };
}

/** Headings, whether there is a body, and reading time, from the raw MDX. */
function outline(body: string) {
  const slugger = new GithubSlugger();
  // Ignore anything inside fenced code or $$ maths blocks.
  const prose = body.replace(/```[\s\S]*?```|\$\$[\s\S]*?\$\$/g, "");
  const headings = [...prose.matchAll(/^(#{2,3})\s+(.+?)\s*$/gm)].map(([, hashes, raw]) => {
    const text = raw.replace(/[*_`]/g, "");
    return { id: slugger.slug(text), text, level: hashes.length as 2 | 3 };
  });
  const words = prose.replace(/<[^>]*>|[#*_`>|-]/g, " ").split(/\s+/).filter(Boolean).length;
  return { headings, hasBody: words > 0, minutes: Math.max(1, Math.round(words / 220)) };
}

/** Every piece, soonest date first. */
export const research: Research[] = readdirSync(DIR)
  .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
  .map(read)
  .sort((a, b) => a.date.localeCompare(b.date));

export const published = research.filter((r) => r.status === "published").reverse();
export const upcoming = research.filter((r) => r.status !== "published");

/** "Nov 2026" for targets, "3 Nov 2026" for publication dates. */
export function formatDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: d ? "numeric" : undefined,
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d || 1)));
}

/** A suggested citation for a piece. */
export function citation(r: Research) {
  const names = authorNames(r);
  const who = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0];
  return `${who} (${r.date.slice(0, 4)}). ${r.title}. SovereignStrUKture.`;
}

/** Author names, in order, for display. */
export const authorNames = (r: Research) => r.authors.map((a) => team.find((m) => m.slug === a)!.name);
