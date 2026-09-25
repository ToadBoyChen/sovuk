import { brand } from "@/lib/brand";
import { ogImage, ogSize } from "@/lib/og";

export const alt = `${brand.name}: ${brand.tagline}`;
export const size = ogSize;
export const contentType = "image/png";

/** The default preview card, used by every page without its own. */
export default function Image() {
  return ogImage({ label: brand.shortName, title: brand.tagline, detail: brand.description });
}
