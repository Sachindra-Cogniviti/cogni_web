import type { CollectionConfig } from "payload"

export const Updates: CollectionConfig = {
  slug: "updates",
  orderable: true,
  admin: {
    useAsTitle: "title",
    group: "Content",
    defaultColumns: ["title", "kind", "date", "hidden"],
    description:
      "Homepage updates. Drag rows to reorder. Check Hidden to remove an update from the site without deleting it.",
  },
  access: {
    read: ({ req }) => Boolean(req.user) || { hidden: { not_equals: true } },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "kind",
      type: "text",
      required: true,
      admin: { description: "For example: Award, Client, or Event." },
    },
    {
      name: "date",
      type: "text",
      required: true,
      admin: { description: "Display text, such as Coupa Inspire 2026." },
    },
    { name: "body", type: "textarea", required: true },
    { name: "image", type: "upload", relationTo: "media" },
    {
      name: "imagePath",
      type: "text",
      admin: {
        description:
          "Existing site image path. Uploading an image above takes precedence.",
      },
    },
    {
      name: "imageAlt",
      type: "text",
      admin: { description: "Description of the picture for screen readers." },
    },
    {
      name: "linkType",
      type: "select",
      required: true,
      defaultValue: "url",
      options: [
        { label: "Blog post", value: "post" },
        { label: "Client story", value: "story" },
        { label: "External link or site URL", value: "url" },
      ],
    },
    {
      name: "post",
      type: "relationship",
      relationTo: "posts",
      required: true,
      admin: { condition: (data) => data.linkType === "post" },
    },
    {
      name: "story",
      type: "relationship",
      relationTo: "client-stories",
      required: true,
      admin: { condition: (data) => data.linkType === "story" },
    },
    {
      name: "url",
      type: "text",
      required: true,
      admin: {
        condition: (data) => data.linkType === "url",
        description: "Use https:// for external links or / for a site path.",
      },
      validate: (value: unknown) => {
        if (typeof value !== "string") return "Enter a URL."
        if (/^\/(?!\/)/.test(value)) return true
        try {
          return (
            ["https:", "http:"].includes(new URL(value).protocol) ||
            "Use an http or https URL."
          )
        } catch {
          return "Enter a valid URL or site path."
        }
      },
    },
    {
      name: "linkLabel",
      type: "text",
      required: true,
      defaultValue: "Read more",
    },
    {
      name: "hidden",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description:
          "Hide from the homepage while keeping this update in the CMS.",
      },
    },
  ],
}
