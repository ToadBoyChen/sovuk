import "katex/dist/katex.min.css";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReadingProgress from "@/components/research/ReadingProgress";
import Arrow from "@/components/ui/Arrow";
import Eyebrow from "@/components/ui/Eyebrow";
import { team } from "@/content/team";
import { citation, formatDate, research, STATUSES, TYPES } from "@/lib/research";

/** Every piece in content/research has a page; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return research.map((r) => ({ slug: r.slug }));
}

const find = (slug: string) => research.find((r) => r.slug === slug);

export async function generateMetadata({ params }: PageProps<"/research/[slug]">): Promise<Metadata> {
  const piece = find((await params).slug);
  return piece ? { title: piece.title, description: piece.summary } : {};
}

/**
 * A research piece: title and details, a contents list beside the body on
 * wide screens, the MDX body (prose, maths, charts, tables, footnotes), and
 * a suggested citation. Unpublished pieces are clearly marked as drafts.
 */
export default async function ResearchPiecePage({ params }: PageProps<"/research/[slug]">) {
  const piece = find((await params).slug);
  if (!piece) notFound();
  const { default: Body } = await import(`@/content/research/${piece.slug}.mdx`);
  const authors = piece.authors.map((slug) => team.find((m) => m.slug === slug)!);
  const live = piece.status === "published";

  return (
    <article className="pb-28 pt-32 md:pb-44 md:pt-44">
      <ReadingProgress />
      <div className="shell">
        <Link
          href="/research"
          className="group inline-flex items-center gap-2 text-base font-medium text-muted transition-colors hover:text-sovereign"
        >
          <Arrow direction="left" /> Research
        </Link>

        {/* Header */}
        <header className="mt-10 max-w-4xl md:mt-14">
          <Eyebrow>{TYPES[piece.type]}</Eyebrow>
          <h1 className="mt-6 text-4xl font-medium leading-[1.05] tracking-[-0.035em] text-balance md:text-6xl">
            {piece.title}
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-ink/70 md:text-2xl">{piece.summary}</p>
        </header>

        <dl className="mt-10 grid gap-6 border-y border-ink py-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-base text-muted">{live ? "Published" : "Target"}</dt>
            <dd className="mt-1 text-lg">{formatDate(piece.date)}</dd>
          </div>
          <div>
            <dt className="text-base text-muted">{authors.length > 1 ? "Authors" : "Author"}</dt>
            <dd className="mt-1 text-lg">
              {authors.map((a, i) => (
                <span key={a.slug}>
                  {i > 0 && (i === authors.length - 1 ? " and " : ", ")}
                  <Link href={`/team/${a.slug}`} className="underline-offset-4 hover:text-sovereign hover:underline">
                    {a.name}
                  </Link>
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt className="text-base text-muted">Topic</dt>
            <dd className="mt-1 text-lg">{piece.topic}</dd>
          </div>
          <div>
            <dt className="text-base text-muted">Status</dt>
            <dd className="mt-1 text-lg">
              {STATUSES[piece.status]}
              {piece.hasBody && <span className="text-muted"> · {piece.minutes} min read</span>}
            </dd>
          </div>
        </dl>

        {!live && (
          <p className="mt-8 max-w-3xl border-l-4 border-signal bg-subtle px-6 py-4 text-lg">
            <strong className="font-medium">Working draft.</strong>{" "}
            {piece.hasBody
              ? "This piece is still being written. Arguments, figures and conclusions may change before publication."
              : `Not yet drafted — due ${formatDate(piece.date)}. The summary above sets out what it will cover.`}
          </p>
        )}

        {piece.hasBody && (
          <div className="mt-12 grid gap-12 lg:grid-cols-12">
            {/* Contents */}
            {piece.headings.length > 1 && (
              <nav aria-label="Contents" className="lg:order-last lg:col-span-3 lg:col-start-10">
                <div className="lg:sticky lg:top-28">
                  <p className="text-base font-medium text-muted">Contents</p>
                  <ol className="mt-3 grid gap-2 border-l border-line">
                    {piece.headings.map((h) => (
                      <li key={h.id} className={h.level === 3 ? "pl-8" : "pl-4"}>
                        <a
                          href={`#${h.id}`}
                          className={`block leading-snug transition-colors hover:text-sovereign ${
                            h.level === 3 ? "text-sm text-muted" : "text-base"
                          }`}
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              </nav>
            )}

            {/* Body */}
            <div className="research min-w-0 lg:col-span-8">
              <Body />

              <section aria-labelledby="cite-heading" className="mt-16 border-t border-ink pt-6">
                <h2 id="cite-heading" className="text-base font-medium text-muted">
                  How to cite
                </h2>
                <p className="mt-2 text-lg">{citation(piece)}</p>
              </section>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
