
/** Temporary stand-in for a set-piece that hasn't been built yet. */
function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`shell mt-14 ${className}`}>
      <div className="flex aspect-[16/7] items-center justify-center border border-dashed border-line bg-subtle">
        <span className="text-lg text-muted">{label}</span>
      </div>
    </div>
  );
}

export default Placeholder;
