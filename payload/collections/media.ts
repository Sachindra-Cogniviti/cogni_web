import type { CollectionConfig } from "payload"

/**
 * Uploads. Alt text is required rather than optional: every image on this site
 * is either a client logo or editorial art, and a missing alt is a real
 * accessibility defect on a page that is otherwise careful about it.
 *
 * The generated sizes match how images are actually used - a card thumbnail, a
 * post's inline width, and a cover at the page's full measure. next/image
 * still picks between them with a `sizes` hint at the call site.
 */
export const Media: CollectionConfig = {
  slug: "media",
  admin: { group: "Content" },
  access: { read: () => true },
  upload: {
    mimeTypes: ["image/*"],
    imageSizes: [
      { name: "thumbnail", width: 480, height: undefined, position: "centre" },
      { name: "inline", width: 960, height: undefined, position: "centre" },
      { name: "cover", width: 1600, height: undefined, position: "centre" },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      admin: {
        description:
          "What the image shows, for screen readers and for when it fails to load.",
      },
    },
    {
      name: "credit",
      type: "text",
      admin: { description: "Photographer or source, if one needs crediting." },
    },
  ],
}
