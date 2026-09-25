import type { Metadata } from "next";
import Link from "next/link";
import Arrow from "@/components/ui/Arrow";
import { notFound } from "next/navigation";
import Button from "@/components/ui/Button";
import DotPortrait from "@/components/ui/DotPortrait";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import { team } from "@/content/team";
import JsonLd from "@/components/JsonLd";
import { openGraphBase } from "@/lib/brand";
import { organization, person } from "@/lib/schema";
import { formatDate, research, STATUSES } from "@/lib/research";

/** Only the founders' pages exist; any other slug is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return team.map((m) => ({ slug: m.slug }));
}

const find = (slug: string) => team.find((m) => m.slug === slug);

export async function generateMetadata({ params }: PageProps<"/team/[slug]">): Promise<Metadata> {
  const member = find((await params).slug);
  if (!member) return {};
  return {
    title: member.name,
    description: member.bio[0],
    alternates: { canonical: `/team/${member.slug}` },
    openGraph: { ...openGraphBase, type: "profile", title: member.name, description: member.bio[0] },
  };
}

/** A founder's page: portrait, background, what they lead on, and a short bio. */
export default async function TeamMemberPage({ params }: PageProps<"/team/[slug]">) {
  const member = find((await params).slug);
  if (!member) notFound();
  // The other founders, in content order, so no page ranks anyone.
  const others = team.filter((m) => m.slug !== member.slug);
  const pieces = research.filter((r) => r.authors.includes(member.slug));

  return (
    <article className="pb-28 pt-32 md:pb-44 md:pt-44">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          mainEntity: { ...person(member.slug), description: member.bio[0], worksFor: organization },
        }}
      />
      <div className="shell">
        <Link
          href="/#team"
          className="group inline-flex items-center gap-2 text-base font-medium text-muted transition-colors hover:text-sovereign"
        >
          <Arrow direction="left" /> The founding team
        </Link>

        <div className="mt-10 grid gap-12 md:mt-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <DotPortrait src={member.photo} alt={member.name} revealed={false} />
          </div>

          <div className="md:col-span-7 md:col-start-6">
            <Eyebrow>{member.role}</Eyebrow>
            <Reveal>
              <h1 className="mt-6 text-4xl font-medium sm:text-5xl leading-[1.02] tracking-[-0.035em] md:text-7xl">
                {member.name}
                <span className="text-signal">.</span>
              </h1>
            </Reveal>

            <dl className="mt-10 grid gap-6 border-t border-ink pt-6 sm:grid-cols-2">
              <div>
                <dt className="text-base text-muted">Background</dt>
                <dd className="mt-1 text-lg">
                  <span className="font-medium text-sovereign">{member.field}</span>
                  <span className="text-ink/70"> · {member.background}</span>
                </dd>
              </div>
              <div>
                <dt className="text-base text-muted">Leads on</dt>
                <dd className="mt-1 text-lg">{member.focus}</dd>
              </div>
            </dl>

            <div className="mt-10 grid gap-6">
              {member.bio.map((p) => (
                <p key={p} className="max-w-2xl text-xl leading-relaxed text-ink/80 md:text-2xl">
                  {p}
                </p>
              ))}
            </div>

            <h2 className="mt-12 text-lg font-medium text-muted">Responsible for</h2>
            <ul className="mt-4 grid gap-3">
              {member.responsibilities.map((r) => (
                <li key={r} className="flex items-center gap-3 text-lg">
                  <span aria-hidden className="h-[3px] w-4 bg-sovereign" />
                  {r}
                </li>
              ))}
            </ul>

            {pieces.length > 0 && (
              <>
                <h2 className="mt-12 text-lg font-medium text-muted">Research</h2>
                <ul className="mt-4 border-t border-line">
                  {pieces.map((r) => (
                    <li key={r.slug} className="border-b border-line py-4">
                      <p className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                        <Link href={`/research/${r.slug}`} className="text-lg font-medium hover:text-sovereign">
                          {r.title}
                        </Link>
                        <span className="text-base text-muted">
                          {STATUSES[r.status]} · {formatDate(r.date)}
                        </span>
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="mt-12 flex flex-wrap gap-3">
              <Button href={`/contact?to=${member.slug}`}>Contact {member.name.split(" ")[0]}</Button>
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-3 border border-ink px-6 py-4 text-base font-medium transition-colors duration-300 hover:bg-ink hover:text-paper md:px-7 md:text-lg"
                >
                  LinkedIn <Arrow direction="up-right" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* The other co-founders */}
        <nav aria-label="Other co-founders" className="mt-24 border-t border-line pt-10 md:mt-32">
          <p className="text-lg font-medium text-muted">Also on the founding team</p>
          <ul className="mt-4 grid gap-px md:grid-cols-2">
            {others.map((m) => (
              <li key={m.slug}>
                <Link
                  href={`/team/${m.slug}`}
                  className="group flex items-baseline justify-between gap-6 border-b border-line py-5 md:mr-6"
                >
                  <span>
                    <span className="block text-2xl font-medium tracking-[-0.02em] transition-colors group-hover:text-sovereign md:text-3xl">
                      {m.name}
                    </span>
                    <span className="mt-1 block text-base text-muted">
                      {m.role} · {m.field}
                    </span>
                  </span>
                  <Arrow className="text-2xl text-sovereign" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </article>
  );
}
