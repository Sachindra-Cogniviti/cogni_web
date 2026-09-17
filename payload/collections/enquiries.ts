import type { CollectionConfig } from "payload"

import { site } from "@/content/site"

/**
 * Contact-form submissions.
 *
 * A record rather than an email, deliberately. A form that only sent mail
 * would accept an enquiry and drop it with no trace and no error anyone would
 * see if the mail failed. Writing to the database first means the enquiry is
 * never lost, and the notification is an addition rather than the mechanism.
 *
 * That notification is the `afterChange` hook below: on create, one email
 * to ENQUIRY_NOTIFY_TO (the site's contact address if unset) through
 * whatever adapter payload.config.ts has - Resend once its key is set, the
 * console until then. It is on the collection rather than in the form's
 * server action so that an enquiry created any other way - the admin, the
 * API - is notified too. A failed send is logged and swallowed: the record
 * is already written, and the sender must never see an error for it.
 *
 * Access is the whole security model of this collection:
 *
 * - `create` is open, because the form is public and unauthenticated. The
 *   server action is the only caller and it validates before it gets here,
 *   but the field-level `required` and `validate` rules below are what
 *   actually hold, since access control cannot inspect a payload.
 * - `read`, `update` and `delete` require a logged-in user. An enquiry
 *   carries a name, a work email and a phone number belonging to a real
 *   person, and it must never be readable through the public API.
 * - `status` and `notes` are for whoever picks the enquiry up. They are not
 *   part of what the form sends, and the form cannot set them: the server
 *   action writes a fixed field list.
 */
export const Enquiries: CollectionConfig = {
  slug: "enquiries",
  labels: { singular: "Enquiry", plural: "Enquiries" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "company", "subject", "status", "createdAt"],
    group: "Enquiries",
    description:
      "Submissions from the contact form. Nothing here was typed by us, so treat every field as untrusted input from the public internet.",
  },
  access: {
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== "create") return
        const to = process.env.ENQUIRY_NOTIFY_TO || site.email
        const from = [doc.name, doc.company].filter(Boolean).join(", ")
        const lines = [
          `From: ${from}`,
          `Email: ${doc.email}`,
          `Phone: ${doc.phone}`,
          `Subject: ${doc.subject}`,
          doc.source ? `Sent from: ${doc.source}` : "",
          "",
          doc.message || "(no message)",
          "",
          `Open it in the admin: ${req.payload.config.serverURL}/admin/collections/enquiries/${doc.id}`,
        ].filter((line) => line !== undefined)
        try {
          await req.payload.sendEmail({
            to,
            replyTo: doc.email,
            subject: `New enquiry from ${from}`,
            text: lines.join("\n"),
          })
        } catch (error) {
          req.payload.logger.error(
            { err: error, enquiry: doc.id },
            "Enquiry notification could not be sent"
          )
        }
      },
    ],
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          maxLength: 120,
          admin: { width: "50%" },
        },
        {
          name: "company",
          type: "text",
          maxLength: 160,
          admin: { width: "50%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "email",
          type: "email",
          required: true,
          admin: { width: "50%" },
        },
        {
          name: "phone",
          type: "text",
          required: true,
          maxLength: 40,
          admin: { width: "50%" },
        },
      ],
    },
    {
      name: "subject",
      type: "select",
      required: true,
      // Keep in step with contactPage.form.subjects in content/pages.ts. A
      // value the select does not know is rejected here, which is the point:
      // the form's own markup is not a control, since anyone can post to the
      // action with a value of their choosing.
      options: [
        { value: "platform-implementation", label: "Platform implementation" },
        {
          value: "optimization",
          label: "Optimization of an existing platform",
        },
        { value: "integration", label: "Integration and data" },
        { value: "managed-services", label: "Managed services and support" },
        { value: "training", label: "Coupa training and enablement" },
        { value: "products", label: "A Cogniviti product" },
        { value: "careers", label: "Careers" },
        { value: "other", label: "Something else" },
      ],
    },
    {
      name: "message",
      type: "textarea",
      maxLength: 4000,
    },

    {
      name: "status",
      type: "select",
      defaultValue: "new",
      options: [
        { value: "new", label: "New" },
        { value: "in-progress", label: "In progress" },
        { value: "answered", label: "Answered" },
        { value: "spam", label: "Spam" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "notes",
      type: "textarea",
      admin: {
        position: "sidebar",
        description: "Internal. Never shown to the sender.",
      },
    },
    {
      name: "source",
      type: "text",
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "The page the enquiry was sent from.",
      },
    },
  ],
  timestamps: true,
}
