import { formatDate, research, TYPES, authorNames } from "@/lib/research";
import { ogImage, ogSize } from "@/lib/og";

export const alt = "Research from SovereignStrUKture";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return research.map((r) => ({ slug: r.slug }));
}

/** A research piece's preview card: type, title, authors and date. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const piece = research.find((r) => r.slug === slug)!;
  const when = piece.status === "published" ? formatDate(piece.date) : `${TYPES[piece.type]} in progress`;
  return ogImage({
    label: TYPES[piece.type],
    title: piece.title,
    detail: `${authorNames(piece).join(", ")} · ${when}`,
  });
}
