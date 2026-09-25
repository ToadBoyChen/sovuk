/**
 * Structured data (schema.org) for search engines, as a JSON-LD script.
 * "<" is escaped so content can never close the script tag early.
 */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export default JsonLd;
