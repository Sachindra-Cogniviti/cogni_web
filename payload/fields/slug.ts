import type { Field } from "payload"

/**
 * A URL slug that fills itself in from another field but stays editable.
 *
 * Auto-filling only when the slug is empty matters more than it looks: a
 * published URL that silently follows a retitled post breaks every inbound
 * link and every share of it. Once set, it is the editor's to change
 * deliberately.
 */
export function slugField(from: string): Field {
  return {
    name: "slug",
    type: "text",
    required: true,
    unique: true,
    index: true,
    admin: {
      position: "sidebar",
      description: "The URL. Set from the title, and safe to edit before publishing.",
    },
    hooks: {
      beforeValidate: [
        ({ value, data }) => {
          if (typeof value === "string" && value.length > 0) return toSlug(value)
          const source = data?.[from]
          return typeof source === "string" ? toSlug(source) : value
        },
      ],
    },
  }
}

function toSlug(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    // Strip accents so "Coupa Café" and "Coupa Cafe" cannot become two URLs.
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
