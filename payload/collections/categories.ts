import type { CollectionConfig } from "payload"

import { slugField } from "@/payload/fields/slug"

/** Blog taxonomy. Deliberately shallow - one level, no nesting. */
export const Categories: CollectionConfig = {
  slug: "categories",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug"],
    group: "Content",
  },
  access: { read: () => true },
  fields: [
    { name: "title", type: "text", required: true },
    slugField("title"),
    {
      name: "description",
      type: "textarea",
      maxLength: 200,
      admin: {
        description: "Shown on the category's own listing page and in its metadata.",
      },
    },
  ],
}
