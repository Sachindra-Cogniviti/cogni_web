import type { CollectionConfig } from "payload"

/**
 * Post bylines. Kept separate from `users` so someone can be credited as an
 * author without being given a login, and so a consultant who leaves does not
 * take their byline off published work when their account is deactivated.
 */
export const Authors: CollectionConfig = {
  slug: "authors",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "role"],
    group: "Content",
  },
  access: { read: () => true },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "role",
      type: "text",
      admin: { description: "As it should read under the byline." },
    },
    { name: "photo", type: "upload", relationTo: "media" },
    { name: "bio", type: "textarea", maxLength: 320 },
    {
      name: "linkedIn",
      type: "text",
      admin: { description: "Full URL. Used for the author's JSON-LD sameAs." },
    },
  ],
}
