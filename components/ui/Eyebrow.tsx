interface EyebrowProps {
  children: React.ReactNode;
  /** "light" for use on blue or black bands. */
  tone?: "default" | "light" | "signal" | "muted";
  className?: string;
}

/** Section kicker: a short red rule followed by a sentence-case label. */
function Eyebrow({ children, tone = "default", className = "" }: EyebrowProps) {
  const color = {
    default: "text-sovereign",
    light: "text-paper",
    signal: "text-signal",
    muted: "text-muted",
  }[tone];
  return (
    <p className={`flex items-center gap-4 text-lg font-medium md:text-xl ${color} ${className}`}>
      <span aria-hidden className="h-[3px] w-10 bg-signal" />
      {children}
    </p>
  );
}

export default Eyebrow;
