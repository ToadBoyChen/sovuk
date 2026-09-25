import Link from "next/link";
import Arrow from "@/components/ui/Arrow";
import { brand, navLinks } from "@/lib/brand";
import LondonClock from "@/components/ui/LondonClock";

const columns = [
  { title: "Site", links: [{ label: "Home", href: "/" }, ...navLinks] },
  {
    title: "Research",
    links: [
      { label: "All research", href: "/research" },
      { label: "Policy briefs", href: "/research?type=policy-brief" },
      { label: "Papers", href: "/research?type=paper" },
    ],
  },
  {
    title: "Social",
    links: brand.socials.map((s) => ({ label: s.label, href: s.href })),
  },
];

function Footer() {
  return (
    <footer className="relative mt-32 overflow-hidden border-t border-line print:hidden">
      <div className="shell relative grid grid-cols-2 gap-x-6 gap-y-12 pt-16 pb-10 md:grid-cols-12">
        <div className="col-span-2 md:col-span-5">
          <p className="max-w-md text-3xl font-medium leading-tight tracking-tight md:text-4xl">
            {brand.tagline}
          </p>
          <a
            href={`mailto:${brand.email}`}
            className="mt-8 inline-block border-b border-ink pb-0.5 text-lg transition-colors hover:border-sovereign hover:text-sovereign"
          >
            {brand.email}
          </a>
        </div>

        {columns.map((col) => (
          <div key={col.title} className="md:col-span-2">
            <p className="text-base font-medium text-ink">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => {
                const external = link.href.startsWith("http");
                return (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      {...(external && { target: "_blank", rel: "noreferrer" })}
                      className="group inline-flex items-center gap-1.5 text-base text-ink/70 transition-colors hover:text-ink"
                    >
                      {link.label}
                      {external && <Arrow direction="up-right" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="md:col-span-1 md:text-right">
          <a
            href="#top"
            className="group inline-flex size-10 items-center justify-center border border-line bg-paper transition-colors hover:border-ink"
            aria-label="Back to top"
          >
            <Arrow direction="up" />
          </a>
        </div>
      </div>

      <div className="shell relative flex flex-col gap-2 border-t border-line py-6 text-sm text-muted md:text-base sm:flex-row sm:items-center sm:justify-between">
        <span>
          © {new Date().getFullYear()} {brand.name}
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="size-1.5 rounded-full bg-signal animate-pulse-dot" />
          {brand.location.city}, <LondonClock />
        </span>
        <span>Designed &amp; built in Britain</span>
      </div>

      {/* Oversized wordmark, cropped by the bottom edge. */}
      <div aria-hidden className="relative select-none overflow-hidden">
        <p className="translate-y-[22%] text-center text-[24vw] font-bold leading-[0.8] tracking-[-0.06em] text-ink">
          {brand.shortName}
          <span className="text-signal">.</span>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
