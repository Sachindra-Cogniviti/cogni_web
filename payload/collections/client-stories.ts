import type { CollectionConfig } from "payload"

import { slugField } from "@/payload/fields/slug"
import { livePreview, previewUrl } from "@/lib/preview"

/**
 * Client stories, served at /work/[slug] - which is also where a draft is
 * previewed, through the Preview button and the Live Preview panel; see
 * lib/preview.ts.
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
    livePreview: livePreview("client-stories"),
    preview: (doc) => previewUrl("client-stories", doc.slug),
  },
  access: {
    read: ({ req }) =>
      Boolean(req.user) || { _status: { equals: "published" } },
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
          ].map((r) => ({
            label: r,
            value: r.toLowerCase().replace(/\s+/g, "-"),
          })),
          admin: { width: "50%" },
        },
      ],
    },
    {
      name: "sector",
      type: "text",
      admin: {
        description: "Telecoms, shipping, energy, property, and so on.",
      },
    },

    // The delivery path: the stages the program went through, in order, as
    // the editor would tell them - "Process design", "ERP integration",
    // "Country rollouts". The homepage and the story page lay them out as
    // stops ending at Production. Optional, because a story can be published
    // before anyone has written its path; the pages then fall back to the
    // story's platforms and regions (lib/cms.ts), which say what and where
    // rather than how.
    {
      name: "stages",
      type: "array",
      maxRows: 6,
      labels: { singular: "Stage", plural: "Stages" },
      admin: {
        description:
          "The delivery path, in order: the stages before production, two or three words each. Shown as stops on the homepage and the story page. Leave empty and the platforms and regions stand in.",
      },
      fields: [{ name: "label", type: "text", required: true, maxLength: 40 }],
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
