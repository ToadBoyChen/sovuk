import Link from "next/link";
import Button from "@/components/ui/Button";
import {
  authorNames,
  formatDate,
  published,
  STATUSES,
  TYPES,
  upcoming,
} from "@/lib/research";

/**
 * Home-page research: the latest published pieces first, topped up with
 * the next pieces on the plan, three in all. Updates itself as files in
 * content/research change.
 */
function ResearchPreview() {
  const pieces = [...published, ...upcoming].slice(0, 3);
  return (
    <div className="shell mt-12 md:mt-20">
      <ul className="grid gap-px border-y border-line bg-line md:grid-cols-3">
        {pieces.map((r) => {
          const live = r.status === "published";
          return (
            <li key={r.slug} className="bg-paper">
              <Link
                href={`/research/${r.slug}`}
                className="block h-full p-6 transition-colors hover:bg-subtle md:p-8"
              >
                <p className="flex items-baseline justify-between gap-4 text-base">
                  <span className="font-medium tabular-nums">
                    {formatDate(r.date)}
                  </span>
                  <span
                    className={
                      live
                        ? "text-signal"
                        : r.status === "in-progress"
                          ? "text-sovereign"
                          : "text-muted"
                    }
                  >
                    {STATUSES[r.status]}
                  </span>
                </p>
                <p className="mt-6 text-2xl font-medium tracking-[-0.02em] md:text-3xl">
                  {r.title}
                </p>
                <p className="mt-4 text-base text-muted">
                  {TYPES[r.type]} · {authorNames(r).join(", ")}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-10">
        <Button href="/research" variant="secondary">
          See the full research plan
        </Button>
      </div>
    </div>
  );
}

export default ResearchPreview;
