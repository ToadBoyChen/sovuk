import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { brand, openGraphBase } from "@/lib/brand";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/sections/Footer";
import SmoothScroll from "@/components/ui/SmoothScroll";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s · ${brand.shortName}`,
  },
  description: brand.description,
  // Absolute URLs for link previews and the sitemap.
  metadataBase: new URL(brand.url),
  openGraph: { ...openGraphBase, type: "website" },
  twitter: { card: "summary_large_image" },
};

/** Light only: stops phone browsers in dark mode from recolouring the site. */
export const viewport: Viewport = {
  colorScheme: "only light",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body id="top" className="flex min-h-svh flex-col font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <Nav />
        {/* overflow-x-clip: dot canvases bleed past their boxes; never let that scroll the page. */}
        <main id="main" className="flex-1 overflow-x-clip">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
