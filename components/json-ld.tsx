/**
 * One JSON-LD block.
 *
 * A server component with no client cost: it renders a script tag and
 * nothing else. The serialisation is the only thing worth care - `<` is
 * escaped so a string in the data (a headline containing "<") cannot close
 * the script element early. React does not escape inside
 * dangerouslySetInnerHTML, and a `</script>` in a post title would otherwise
 * end the block and spill the rest of the JSON into the document.
 *
 * The shapes themselves are built in lib/schema.ts.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  )
}
