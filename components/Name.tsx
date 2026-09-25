import { brand } from "@/lib/brand";

/**
 * The wordmark. Text comes from lib/brand.ts so a rename is one edit. A
 * paragraph by default; pass `as="h1"` where it should be the page heading.
 */
function Name({ className = "", as: Tag = "p" }: { className?: string; as?: "p" | "h1" }) {
  return (
    <Tag className={`font-bold leading-[0.85] tracking-[-0.055em] ${className}`}>
      {brand.shortName}
      <span className="text-signal">.</span>
    </Tag>
  );
}

export default Name;
