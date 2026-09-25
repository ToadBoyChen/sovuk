import type { MetadataRoute } from "next";
import { team } from "@/content/team";
import { brand } from "@/lib/brand";
import { research } from "@/lib/research";

/** Every public page, for search engines. Research and team pages follow their content files. */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (p: string) => `${brand.url}${p}`;
  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/research"), changeFrequency: "weekly", priority: 0.9 },
    ...research.map((r) => ({
      url: url(`/research/${r.slug}`),
      ...(r.status === "published" && { lastModified: new Date(r.date) }),
      changeFrequency: "monthly" as const,
      priority: r.status === "published" ? 0.8 : 0.5,
    })),
    ...team.map((m) => ({ url: url(`/team/${m.slug}`), changeFrequency: "monthly" as const, priority: 0.6 })),
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.5 },
  ];
}
