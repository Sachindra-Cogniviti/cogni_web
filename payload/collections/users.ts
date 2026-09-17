import {
  APIError,
  type Access,
  type CollectionConfig,
  type FieldAccess,
} from "payload"

import { publicSiteUrl } from "@/lib/deployment"

/**
 * Admin accounts. Editors log in here; the site itself has no logged-in
 * visitor.
 *
 * Two roles. An admin runs the accounts - creates users, removes them, decides
 * who is an admin. An editor edits content and can change their own name and
 * password, and nothing about anyone else. The role field is what separates
 * the two, so only an admin can set it: for anyone else it is dropped from
 * the write and the stored value stands.
 *
 * Three things the rules refuse, and why:
 *
 *   - Deleting yourself. Not dangerous in itself, but a click away from
 *     locking the last person out, and never what anyone meant.
 *   - Deleting the last admin, by anyone. With no admin left nobody can
 *     create a user or promote one, and the only way back in is the
 *     database. Promote someone else first.
 *   - A first user who is not an admin. The very first account is made from
 *     the admin's create-first-user screen, before any access rule can apply,
 *     and the role select there defaults to editor. Left alone that would
 *     produce an installation with no admin at all, so the first account is
 *     always made an admin whatever the form said.
 *
 * Login is Payload's own: email and password at /admin/login, five wrong
 * guesses lock the account for ten minutes. Forgotten passwords go through
 * /admin/forgot, which mails a one-time link; that mail goes through whatever
 * email adapter payload.config.ts has - Resend once RESEND_API_KEY is set,
 * the console until then - and the link is built from the deployment's own
 * URL so it works from a preview as well as from the live site.
 */

const isAdmin: Access = ({ req }) => req.user?.role === "admin"
const isAdminField: FieldAccess = ({ req }) => req.user?.role === "admin"

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    forgotPassword: {
      generateEmailSubject: () => "Reset your Cogniviti Labs admin password",
      generateEmailHTML: (args) => {
        const url = `${publicSiteUrl()}/admin/reset/${args?.token ?? ""}`
        const name = (args?.user as { name?: string } | undefined)?.name
        return [
          `<p>Hello${name ? ` ${name}` : ""},</p>`,
          `<p>Someone asked to reset the password for this Cogniviti Labs admin account. If that was you, use the link below. It works once and expires in an hour.</p>`,
          `<p><a href="${url}">${url}</a></p>`,
          `<p>If you did not ask for this, ignore this email and your password stays as it is.</p>`,
        ].join("\n")
      },
    },
  },
  admin: {
    useAsTitle: "name",
    group: "Settings",
    defaultColumns: ["name", "email", "role"],
  },
  access: {
    // Anyone logged in can see who else has an account.
    read: ({ req }) => Boolean(req.user),
    create: isAdmin,
    // An admin can edit anyone; an editor only their own record.
    update: ({ req }) => {
      if (req.user?.role === "admin") return true
      if (req.user) return { id: { equals: req.user.id } }
      return false
    },
    // An admin can remove anyone but themselves.
    delete: ({ req, id }) =>
      req.user?.role === "admin" && (id === undefined || req.user.id !== id),
    admin: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        // The first account is always an admin. See the note above.
        if (operation === "create") {
          const { totalDocs } = await req.payload.count({
            collection: "users",
            overrideAccess: true,
          })
          if (totalDocs === 0) return { ...data, role: "admin" }
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const doc = await req.payload.findByID({
          collection: "users",
          id,
          depth: 0,
          overrideAccess: true,
        })
        if (doc.role !== "admin") return
        const { totalDocs } = await req.payload.count({
          collection: "users",
          where: { role: { equals: "admin" } },
          overrideAccess: true,
        })
        if (totalDocs <= 1) {
          throw new APIError(
            "This is the only admin account and cannot be removed. Make another user an admin first.",
            400
          )
        }
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "role",
      type: "select",
      defaultValue: "editor",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
      ],
      required: true,
      // Only an admin sets roles. For anyone else the field is dropped from
      // the write, so an editor cannot promote themselves.
      access: { create: isAdminField, update: isAdminField },
      admin: {
        description:
          "Admins manage accounts. Editors edit content and their own account only.",
      },
    },
  ],
}
