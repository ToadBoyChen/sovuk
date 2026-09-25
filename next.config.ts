import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {};

// Research pieces are MDX files in content/research with YAML frontmatter.
// Plugins are named as strings so Turbopack can load them.
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-frontmatter", "remark-mdx-frontmatter", "remark-gfm", "remark-math"],
    // Heading ids (for the contents list) and LaTeX maths via KaTeX.
    rehypePlugins: ["rehype-slug", "rehype-katex"],
  },
});

export default withMDX(nextConfig);
