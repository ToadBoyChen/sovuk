import { team } from "@/content/team";
import { brand } from "@/lib/brand";

/**
 * schema.org descriptions of the organisation and its people, shared by
 * the home page, research pieces and founder pages. Social profiles are
 * left out of `sameAs` until lib/brand.ts has the real ones.
 */

export const organization = {
  "@type": "Organization",
  "@id": `${brand.url}/#organization`,
  name: brand.name,
  alternateName: brand.shortName,
  url: brand.url,
  description: brand.description,
  logo: `${brand.url}/apple-icon`,
  email: brand.email,
  address: { "@type": "PostalAddress", addressLocality: brand.location.city, addressCountry: "GB" },
};

export function person(slug: string) {
  const m = team.find((t) => t.slug === slug)!;
  return {
    "@type": "Person",
    "@id": `${brand.url}/team/${m.slug}#person`,
    name: m.name,
    url: `${brand.url}/team/${m.slug}`,
    jobTitle: m.role,
    knowsAbout: [m.field, m.focus],
    worksFor: { "@id": organization["@id"] },
    ...(m.linkedin && { sameAs: [m.linkedin] }),
  };
}
