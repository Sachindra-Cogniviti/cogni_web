import type { Block } from "payload"

/**
 * A code block inside rich text.
 *
 * Lexical has no code block of its own in Payload, so this is a block the
 * editor inserts from the "+" menu: a language and the code, verbatim. The
 * page renders it on the night ground with the language as a label
 * (components/rich-text.tsx). No syntax colouring - the mono face carries
 * it, and a highlighter is a dependency that would have to be kept in step
 * with every language anyone might paste.
 */
export const CodeBlock: Block = {
  slug: "code",
  interfaceName: "CodeBlock",
  labels: { singular: "Code block", plural: "Code blocks" },
  fields: [
    {
      name: "language",
      type: "select",
      defaultValue: "plain",
      options: [
        { label: "Plain text", value: "plain" },
        { label: "JSON", value: "json" },
        { label: "SQL", value: "sql" },
        { label: "XML", value: "xml" },
        { label: "YAML", value: "yaml" },
        { label: "Shell", value: "shell" },
        { label: "TypeScript", value: "typescript" },
        { label: "JavaScript", value: "javascript" },
        { label: "Python", value: "python" },
        { label: "Java", value: "java" },
        { label: "ABAP", value: "abap" },
      ],
      admin: { width: "40%" },
    },
    {
      name: "code",
      type: "code",
      required: true,
    },
  ],
}
