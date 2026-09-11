// Side-effect import, and it has to stay first: it must run before the
// database adapter below opens a connection. See the file for why.
import "@/lib/pg-ipv4"

import path from "path"
import { fileURLToPath } from "url"

import { postgresAdapter } from "@payloadcms/db-postgres"
import { seoPlugin } from "@payloadcms/plugin-seo"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
import { s3Storage } from "@payloadcms/storage-s3"
import { buildConfig } from "payload"
import sharp from "sharp"

import { Authors } from "@/payload/collections/authors"
import { Categories } from "@/payload/collections/categories"
import { ClientStories } from "@/payload/collections/client-stories"
import { Media } from "@/payload/collections/media"
import { Posts } from "@/payload/collections/posts"
import { Users } from "@/payload/collections/users"
import { publicMediaBaseUrl } from "@/lib/media-url"

const mediaBaseUrl = publicMediaBaseUrl()

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Payload lives inside this Next app: the admin is a route group at /admin and
 * the schema below is the source of truth for it. Developers change the shape
 * here in a pull request; marketing changes the content in the browser. That
 * split is the reason Payload was chosen over a hosted CMS.
 *
 * Only the blog and the client stories are modelled here. The homepage copy
 * stays in content/site.ts on purpose - those fields are layout instructions
 * wearing a content costume (the headline is split three ways so one word can
 * be set in Newsreader italic, the galaxy nodes are polar coordinates, the
 * logo heights are hand-balanced pixel values). A rich-text editor cannot
 * express any of that, and exposing it would hand marketing a way to break the
 * layout.
 *
 * Media goes to Vercel Blob rather than the local disk. Payload writes uploads
 * to the filesystem by default, and a serverless filesystem does not survive
 * the request - uploads would appear to work and then vanish.
 */
export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: "— Cogniviti Labs",
    },
  },

  collections: [Posts, ClientStories, Authors, Categories, Media, Users],

  editor: lexicalEditor(),

  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || "" },
  }),

  // Image processing for upload resizing. Payload requires it for the Media
  // collection's generated sizes.
  sharp,

  secret: process.env.PAYLOAD_SECRET || "",

  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },

  plugins: [
    // Adds a meta title / description / image group to both content types,
    // with live previews and length warnings in the admin. It supplies the
    // fields only - turning them into <meta> tags and JSON-LD is the front
    // end's job, in generateMetadata and the route's own markup.
    seoPlugin({
      collections: ["posts", "client-stories"],
      uploadsCollection: "media",
      generateTitle: ({ doc }) => `${doc?.title ?? ""} | Cogniviti Labs`,
      generateDescription: ({ doc }) => doc?.excerpt ?? "",
    }),

    // Cloudflare R2. It speaks the S3 API, so the S3 adapter drives it and no
    // R2-specific package is needed - only `region: "auto"` and R2's endpoint.
    //
    // R2 over Vercel Blob for one reason that grows with the site: R2 charges
    // nothing for egress. Every post cover and client logo served is free
    // bandwidth, and binding a custom domain to the bucket puts the files on
    // Cloudflare's CDN without putting Cloudflare in front of the whole app.
    s3Storage({
      enabled: Boolean(process.env.R2_BUCKET),
      collections: { media: true },
      bucket: process.env.R2_BUCKET || "",
      config: {
        region: "auto",
        endpoint: process.env.R2_ENDPOINT || "",
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
        },
        // R2 does not support virtual-hosted-style bucket addressing.
        forcePathStyle: true,
      },
      // Serve straight off the bucket's public domain rather than through
      // this app's /api/media route. Without it every image would round-trip
      // a serverless function, which is the opposite of the point.
      //
      // Only applied once there is a real public domain to serve from. Until
      // then media goes through the app, which is correct rather than merely
      // tolerable: it needs no public bucket and no CDN, so uploads work from
      // the first day and switching to the custom domain later changes only
      // the URL they are served at.
      ...(mediaBaseUrl
        ? {
            generateFileURL: ({
              filename,
              prefix,
            }: {
              filename: string
              prefix?: string
            }) => [mediaBaseUrl, prefix, filename].filter(Boolean).join("/"),
          }
        : {}),
    }),
  ],
})
