import type { MDXComponents } from "mdx/types";
import Callout from "@/components/research/Callout";
import Chart from "@/components/research/Chart";

/** House style for research pieces written in MDX, plus <Chart> and <Callout>. */
const components: MDXComponents = {
  h2: (props) => <h2 className="mt-14 text-3xl font-medium tracking-[-0.02em] md:text-4xl" {...props} />,
  h3: (props) => <h3 className="mt-10 text-2xl font-medium tracking-[-0.01em]" {...props} />,
  p: (props) => <p className="mt-5 text-xl leading-relaxed text-ink/80" {...props} />,
  ul: (props) => <ul className="mt-5 grid list-disc gap-2 pl-6 text-xl leading-relaxed text-ink/80" {...props} />,
  ol: (props) => <ol className="mt-5 grid list-decimal gap-2 pl-6 text-xl leading-relaxed text-ink/80" {...props} />,
  a: (props) => <a className="text-sovereign underline underline-offset-4 hover:text-ink" {...props} />,
  blockquote: (props) => <blockquote className="mt-8 border-l-4 border-signal pl-6 text-2xl text-ink" {...props} />,
  table: (props) => (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full border-collapse text-left text-lg" {...props} />
    </div>
  ),
  th: (props) => <th className="border-b-2 border-ink py-2 pr-6 font-medium" {...props} />,
  td: (props) => <td className="border-b border-line py-2 pr-6" {...props} />,
  // Available in every piece without importing.
  Chart,
  Callout,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
