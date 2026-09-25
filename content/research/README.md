# Research

One `.mdx` file per piece. The file name is its URL: `routing-by-complexity.mdx` → `/research/routing-by-complexity`.

## Add a piece to the plan

Copy `_template.mdx`, rename it, and fill in the frontmatter:

| Field     | Values                                                         |
| --------- | -------------------------------------------------------------- |
| `title`   | The title                                                      |
| `summary` | One or two sentences, shown in lists                           |
| `type`    | `policy-brief`, `paper` or `note`                              |
| `topic`   | A short reusable label, e.g. `Models`, `Compute`, `Governance` |
| `authors` | Founder slugs from `content/team.ts`; the first is the lead    |
| `status`  | `planned`, `in-progress` or `published`                        |
| `date`    | `YYYY-MM` target while planned; `YYYY-MM-DD` once published    |

It then appears on `/research`, on each author's page, and (if it's among the next three) on the home page.

## Publish

Write the body below the frontmatter in Markdown (tables, links and quotes work), set `status: published` and a full `date`, and push. The piece gets its own page.

A mistake in the frontmatter (unknown author, bad date, missing field) fails the build with the file name and the problem, so nothing broken goes live. Files starting with `_` are ignored.
