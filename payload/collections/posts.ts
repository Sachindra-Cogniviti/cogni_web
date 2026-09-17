import type { CollectionConfig } from "payload"

import { slugField } from "@/payload/fields/slug"
import { livePreview, previewUrl } from "@/lib/preview"

/**
 * The blog.
 *
 * Drafts are on, which is what gives editors a preview of unpublished work on
 * the real page rather than in a side panel. `_status` also means "publish" is
 * a distinct action from "save", so a half-finished post cannot reach the live
 * site by autosave.
 *
 * That preview is /blog/[slug] itself, in Next's draft mode: the Preview
 * button opens it in a tab and the Live Preview panel shows it beside the
 * form, re-rendering on each save. lib/preview.ts explains the route.
 */
export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "author", "publishedAt", "_status"],
    group: "Content",
    livePreview: livePreview("posts"),
    preview: (doc) => previewUrl("posts", doc.slug),
  },
  access: {
    // Drafts stay private; only published posts are readable without a login.
    read: ({ req }) =>
      Boolean(req.user) || { _status: { equals: "published" } },
  },
  versions: { drafts: true },
  fields: [
    { name: "title", type: "text", required: true },
    slugField("title"),
    {
      name: "excerpt",
      type: "textarea",
      required: true,
      maxLength: 240,
      admin: {
        description:
          "One or two sentences. Used on the listing, in search results and as the default meta description.",
      },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Also the fallback image when the post is shared.",
      },
    },
    { name: "body", type: "richText", required: true },
    {
      name: "author",
      type: "relationship",
      relationTo: "authors",
      required: true,
      admin: { position: "sidebar" },
    },
    {
      name: "categories",
      type: "relationship",
      relationTo: "categories",
      hasMany: true,
      admin: { position: "sidebar" },
    },
    {
      name: "publishedAt",
      type: "date",
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
        description:
          "Drives ordering, the sitemap's lastModified and the JSON-LD date.",
      },
    },
  ],
}
