// Side-effect import, and it has to stay first: it must run before the
// database adapter below opens a connection. See the file for why.
import "@/lib/pg-ipv4"

import path from "path"
import { fileURLToPath } from "url"

import { postgresAdapter } from "@payloadcms/db-postgres"
import { resendAdapter } from "@payloadcms/email-resend"
import { seoPlugin } from "@payloadcms/plugin-seo"
import {
  BlocksFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
  UploadFeature,
} from "@payloadcms/richtext-lexical"
import { s3Storage } from "@payloadcms/storage-s3"
import { buildConfig } from "payload"
import sharp from "sharp"

import { CodeBlock } from "@/payload/blocks/code"
import { Authors } from "@/payload/collections/authors"
import { Categories } from "@/payload/collections/categories"
import { ClientStories } from "@/payload/collections/client-stories"
import { Enquiries } from "@/payload/collections/enquiries"
import { Media } from "@/payload/collections/media"
import { Posts } from "@/payload/collections/posts"
import { Roles } from "@/payload/collections/roles"
import { Users } from "@/payload/collections/users"
import { publicSiteUrl } from "@/lib/deployment"
import { publicMediaBaseUrl } from "@/lib/media-url"

const mediaBaseUrl = publicMediaBaseUrl()

/**
 * Outbound mail: Resend, once there is a key for it.
 *
 * Two things go out. Password-reset links, from the admin's forgot-password
 * screen, and a notification for every enquiry the contact form writes (the
 * afterChange hook in payload/collections/enquiries.ts). Without a key
 * Payload falls back to its console adapter, which prints each email to the
 * server log instead of sending it - right for development, and the reason
 * a missing key is not an error here: the site must build and run before
 * the domain is verified.
 *
 * EMAIL_FROM has to be an address on a domain verified in Resend, or Resend
 * refuses the send. The default is only a reminder of the shape.
 */
const email = process.env.RESEND_API_KEY
  ? resendAdapter({
      apiKey: process.env.RESEND_API_KEY,
      defaultFromAddress:
        process.env.EMAIL_FROM || "no-reply@cognivitilabs.com",
      defaultFromName: "Cogniviti Labs",
    })
  : undefined

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Payload lives inside this Next app: the admin is a route group at /admin and
 * the schema below is the source of truth for it. Developers change the shape
 * here in a pull request; marketing changes the content in the browser. That
 * split is the reason Payload was chosen over a hosted CMS.
 *
 * Modelled here: the blog, the client stories, the open roles on /careers,
 * and the enquiries the contact form writes. Everything those four have in
 * common is a life independent of a deploy - a post is published, a role
 * closes, an enquiry arrives - which is exactly what a CMS is for.
 *
 * The homepage copy stays in content/site.ts on purpose - those fields are
 * layout instructions wearing a content costume (the headline is split three
 * ways so one word can be set in Newsreader italic, the galaxy nodes are
 * polar coordinates, the logo heights are hand-balanced pixel values). A
 * rich-text editor cannot express any of that, and exposing it would hand
 * marketing a way to break the layout.
 *
 * Media goes to Vercel Blob rather than the local disk. Payload writes uploads
 * to the filesystem by default, and a serverless filesystem does not survive
 * the request - uploads would appear to work and then vanish.
 */
export default buildConfig({
  // The origin absolute links are built from - above all the password-reset
  // link in the forgot-password email, which is useless as a relative path.
  // Per deployment, not hard-coded: a reset requested from a preview must
  // link back to that preview, and locally to localhost.
  serverURL: publicSiteUrl(),

  email,

  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: "· Cogniviti Labs",
    },
    // The site's logo on the login page and its dot mark in the admin
    // header, in place of Payload's. The palette and type that go with them
    // are in app/(payload)/custom.css and app/(payload)/layout.tsx.
    components: {
      graphics: {
        Logo: "@/components/admin/logo#Logo",
        Icon: "@/components/admin/logo#Icon",
      },
      // The front page: counts and the last edit per collection, and new
      // enquiries called out, in place of Payload's grid of cards.
      views: {
        dashboard: { Component: "@/components/admin/dashboard#Dashboard" },
      },
    },
  },

  collections: [
    Posts,
    ClientStories,
    Roles,
    Enquiries,
    Authors,
    Categories,
    Media,
    Users,
  ],

  // The rich-text editor for post bodies and story detail. Payload's
  // defaults - the inline formats, headings, lists including checklists,
  // links, quotes, uploads, relationships, rules, alignment and indent -
  // plus what an article here actually needs beyond them: a table, a code
  // block, and a caption on an inline image. The page renders every one of
  // these in its own type (components/rich-text.tsx); nothing is enabled
  // here that the page cannot draw.
  //
  // Headings start at h2: the page owns its h1. A fixed toolbar as well as
  // the floating one, because a table is not something you select text to
  // insert.
  //
  // Changing features here means regenerating the import map afterwards
  // (npm run generate:importmap); see the Payload section in CLAUDE.md.
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures.filter(
        (feature) => feature.key !== "heading" && feature.key !== "upload"
      ),
      HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] }),
      UploadFeature({
        collections: {
          media: {
            fields: [
              {
                name: "caption",
                type: "text",
                admin: {
                  description:
                    "Shown under the image. The alt text on the upload itself is what a screen reader gets.",
                },
              },
            ],
          },
        },
      }),
      FixedToolbarFeature(),
      EXPERIMENTAL_TableFeature(),
      BlocksFeature({ blocks: [CodeBlock] }),
    ],
  }),

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
      // node-postgres drops an idle connection after ten seconds, so a page
      // that queries once a minute paid for a fresh TLS handshake to Neon on
      // nearly every request - two seconds from here, a good part of a
      // second from Vercel. A minute keeps the connection through a reading
      // session locally and across the requests a warm function serves in
      // production; Neon's pooler is what makes holding it cheap.
      idleTimeoutMillis: 60_000,
      keepAlive: true,
    },
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
      // No " | Cogniviti Labs" here. This value becomes `meta.title`, which
      // generateMetadata passes to pageMetadata as the page title, and the
      // layout's title template appends the site name to that - so a suffix
      // here produced "Post | Cogniviti Labs | Cogniviti Labs" the moment an
      // editor pressed auto-generate. The site name is added exactly once,
      // downstream, for every page on the site.
      generateTitle: ({ doc }) => (doc?.title as string) ?? "",
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
