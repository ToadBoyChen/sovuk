import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

/** Open to all crawlers, pointing them at the sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${brand.url}/sitemap.xml`,
  };
}
