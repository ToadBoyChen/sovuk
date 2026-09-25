/** A highlighted passage in a research piece: a key finding or a caveat. */
function Callout({ title, children, tone = "finding" }: { title?: string; children: React.ReactNode; tone?: "finding" | "caveat" }) {
  return (
    <aside
      className={`my-10 border-l-4 px-6 py-5 ${tone === "caveat" ? "border-muted bg-subtle" : "border-sovereign bg-sovereign-soft"}`}
    >
      {title && <p className="text-sm font-medium text-muted">{title}</p>}
      <div className="text-xl leading-relaxed text-ink [&>p]:mt-0 [&>p+p]:mt-3">{children}</div>
    </aside>
  );
}

export default Callout;
