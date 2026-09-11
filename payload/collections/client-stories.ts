import type { CollectionConfig } from "payload"

import { slugField } from "@/payload/fields/slug"

/**
 * Client stories, served at /work/[slug].
 *
 * "work" rather than "clients" because the homepage rail already labels that
 * section "Client work" at id="work", and the eight logos in
 * content/site.ts `trustedBy` should link straight through to their story.
 * One name for one thing.
 *
 * The taxonomy is not generic. `platform` and `region` are the axes this
 * business is actually sold on - a procurement lead searching for an Ivalua
 * implementation in Singapore is the reader these pages exist for - so they
 * are constrained selects rather than free text, which keeps them usable as
 * filters and as structured data instead of degrading into eight spellings of
 * "OneStream".
 */
export const ClientStories: CollectionConfig = {
  slug: "client-stories",
  labels: { singular: "Client story", plural: "Client stories" },
  admin: {
    useAsTitle: "client",
    defaultColumns: ["client", "platform", "region", "publishedAt", "_status"],
    group: "Content",
  },
  access: {
    read: ({ req }) => Boolean(req.user) || { _status: { equals: "published" } },
  },
  versions: { drafts: true },
  fields: [
    {
      name: "client",
      type: "text",
      required: true,
      admin: { description: "The company name, as they write it." },
    },
    slugField("client"),
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description:
          "The headline for the story itself, not the client name. What was achieved.",
      },
    },
    {
      name: "excerpt",
      type: "textarea",
      required: true,
      maxLength: 240,
    },
    { name: "logo", type: "upload", relationTo: "media" },
    {
      type: "row",
      fields: [
        {
          name: "platform",
          type: "select",
          hasMany: true,
          options: [
            "Coupa",
            "GEP",
            "Ivalua",
            "OneStream",
            "SAP",
            "Oracle",
            "NetSuite",
            "Dynamics",
          ].map((p) => ({ label: p, value: p.toLowerCase() })),
          admin: { width: "50%" },
        },
        {
          name: "region",
          type: "select",
          hasMany: true,
          options: [
            "Singapore",
            "India",
            "Indonesia",
            "United Kingdom",
            "South Africa",
            "Thailand",
          ].map((r) => ({ label: r, value: r.toLowerCase().replace(/\s+/g, "-") })),
          admin: { width: "50%" },
        },
      ],
    },
    {
      name: "sector",
      type: "text",
      admin: { description: "Telecoms, shipping, energy, property, and so on." },
    },

    // The three beats every case study needs, as separate fields rather than
    // one rich-text blob: it stops a story being published with the outcome
    // missing, which is the only part a prospect reads.
    { name: "challenge", type: "textarea", required: true },
    { name: "approach", type: "textarea", required: true },
    {
      name: "outcomes",
      type: "array",
      required: true,
      minRows: 1,
      labels: { singular: "Outcome", plural: "Outcomes" },
      fields: [{ name: "text", type: "text", required: true }],
    },
    {
      name: "metrics",
      type: "array",
      maxRows: 4,
      labels: { singular: "Metric", plural: "Metrics" },
      admin: {
        description:
          "The headline figures. Keep the value short - it is set at display size.",
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "value",
              type: "text",
              required: true,
              admin: { width: "40%", placeholder: "42%" },
            },
            {
              name: "label",
              type: "text",
              required: true,
              admin: { width: "60%", placeholder: "faster invoice cycle" },
            },
          ],
        },
      ],
    },

    {
      name: "body",
      type: "richText",
      admin: { description: "Optional long-form detail below the summary." },
    },
    {
      name: "publishedAt",
      type: "date",
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: "sidebar", date: { pickerAppearance: "dayAndTime" } },
    },
  ],
}
