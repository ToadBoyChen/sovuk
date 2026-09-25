import { team } from "@/content/team";
import { ogImage, ogSize } from "@/lib/og";

export const alt = "A co-founder of SovereignStrUKture";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return team.map((m) => ({ slug: m.slug }));
}

/** A founder's preview card: name, role and what they lead on. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = team.find((m) => m.slug === slug)!;
  return ogImage({ label: member.role, title: member.name, detail: `Leads on ${member.focus.toLowerCase()}` });
}
