/**
 * Single source of truth for brand identity. The name and logo are not final —
 * change them here and every page, the footer, metadata and ⌘K follow.
 */
export const brand = {
  name: "SovereignStrUKture",
  shortName: "SovUK",
  tagline: "Sovereign AI compute, built in Britain.",
  description:
    "Building the framework and policy for AI inference and training that stays within the United Kingdom.",
  glyphSrc: "/glyph.png",
  email: "hello@example.co.uk",
  location: { city: "London", lat: 51.5072, lon: -0.1276 },
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
    { label: "X", href: "https://x.com/" },
    { label: "GitHub", href: "https://github.com/" },
  ],
} as const;

/** Home-page sections, in order. Drives the nav, section rail and ⌘K palette. */
export const sections = [
  { id: "top", label: "Introduction" },
  { id: "problem", label: "The problem" },
  { id: "who-we-are", label: "Who we are" },
  { id: "stack", label: "The stack" },
  { id: "request", label: "Follow a request" },
  { id: "roadmap", label: "Roadmap" },
  { id: "team", label: "Team" },
  { id: "research", label: "Research" },
  { id: "contact", label: "Get in touch" },
] as const;

export const navLinks = [
  { label: "Research", href: "/research" },
  { label: "Team", href: "/#team" },
  { label: "Contact", href: "/contact" },
] as const;
