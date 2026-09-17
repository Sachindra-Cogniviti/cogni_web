import type { CollectionConfig } from "payload"

import { slugField } from "@/payload/fields/slug"

/**
 * Open roles, listed on /careers.
 *
 * In Payload rather than content/pages.ts because openings are the one thing
 * on this site with a natural expiry: a role that closed on Friday should
 * stop being advertised on Friday, without a deploy. Everything else about
 * the careers page - how we work, the four tracks we hire into - is stable
 * copy and stays in code.
 *
 * The page is built for this collection being empty, which is the state it
 * will be in most of the time. That is not a fallback, it is the normal
 * case: see `noRoles` in content/pages.ts.
 *
 * `discipline` matches the four tracks on the careers page. A select rather
 * than free text so the listing can group by it and so it cannot degrade
 * into three spellings of "integration".
 */
export const Roles: CollectionConfig = {
  slug: "roles",
  labels: { singular: "Role", plural: "Roles" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "discipline", "location", "type", "_status"],
    group: "Careers",
    description:
      "Open positions shown on /careers. Unpublish a role to take it down. There is no need to delete it.",
  },
  access: {
    read: ({ req }) =>
      Boolean(req.user) || { _status: { equals: "published" } },
  },
  versions: { drafts: true },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: { description: "As a candidate would search for it." },
    },
    slugField("title"),
    {
      type: "row",
      fields: [
        {
          name: "discipline",
          type: "select",
          required: true,
          options: [
            { value: "platform-consulting", label: "Platform consulting" },
            {
              value: "integration-data",
              label: "Integration and data engineering",
            },
            { value: "product-engineering", label: "Product engineering" },
            { value: "applied-ai", label: "Applied AI" },
          ],
          admin: { width: "50%" },
        },
        {
          name: "type",
          type: "select",
          required: true,
          defaultValue: "full-time",
          options: [
            { value: "full-time", label: "Full time" },
            { value: "contract", label: "Contract" },
            { value: "internship", label: "Internship" },
          ],
          admin: { width: "50%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "location",
          type: "text",
          required: true,
          admin: { width: "50%", placeholder: "Singapore" },
        },
        {
          name: "remote",
          type: "select",
          defaultValue: "hybrid",
          options: [
            { value: "onsite", label: "On site" },
            { value: "hybrid", label: "Hybrid" },
            { value: "remote", label: "Remote" },
          ],
          admin: { width: "50%" },
        },
      ],
    },
    {
      name: "summary",
      type: "textarea",
      required: true,
      maxLength: 320,
      admin: {
        description:
          "Two sentences, shown in the listing. What the person will own.",
      },
    },
    {
      name: "responsibilities",
      type: "array",
      labels: { singular: "Responsibility", plural: "Responsibilities" },
      fields: [{ name: "text", type: "text", required: true }],
    },
    {
      name: "requirements",
      type: "array",
      labels: { singular: "Requirement", plural: "Requirements" },
      fields: [{ name: "text", type: "text", required: true }],
    },
    {
      name: "body",
      type: "richText",
      admin: { description: "Optional longer detail below the lists." },
    },
    {
      name: "applyEmail",
      type: "email",
      admin: {
        position: "sidebar",
        description:
          "Where applications for this role go. Leave empty to use the site address.",
      },
    },
    {
      name: "postedAt",
      type: "date",
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: "sidebar", date: { pickerAppearance: "dayOnly" } },
    },
  ],
}
