import { brand } from "@/lib/brand";

/** The wordmark. Text comes from lib/brand.ts so a rename is one edit. */
function Name({ className = "" }: { className?: string }) {
  return (
    <h1 className={`font-bold leading-[0.85] tracking-[-0.055em] ${className}`}>
      {brand.shortName}
      <span className="text-signal">.</span>
    </h1>
  );
}

export default Name;
