import type { CollectionConfig } from "payload"

/** Admin accounts. Editors log in here; the site itself has no logged-in visitor. */
export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "name",
    group: "Settings",
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
    },
  ],
}
