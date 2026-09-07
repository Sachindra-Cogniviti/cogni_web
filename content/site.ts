// All copy and site-wide settings live here. Marketing edits happen in
// content/, not in JSX.

// Production origin, no trailing slash. Feeds robots.txt, sitemap.xml and
// metadataBase.
export const siteUrl = "https://cognivitilabs.com"

export const site = {
  name: "Cogniviti",
  title: "Cogniviti",
  description: "Cogniviti website.",
  locale: "en",
} as const

export const home = {
  heading: "Project ready!",
  body: [
    "You may now add components and start building.",
    "We've already added the button component for you.",
  ],
  cta: "Button",
  hint: "Press d to toggle dark mode",
} as const
