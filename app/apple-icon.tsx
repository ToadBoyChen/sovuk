import { markImage } from "@/lib/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon for iPhones and iPads, with the white margin Apple expects. */
export default function AppleIcon() {
  return markImage(size.width, 22);
}
