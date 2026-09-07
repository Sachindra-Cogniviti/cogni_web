import type { NextConfig } from "next"

// Optional subfolder deploy, e.g. BASE_PATH=/new. Unset for a domain-root deploy.
const basePath = process.env.BASE_PATH?.replace(/\/$/, "") || undefined

const nextConfig: NextConfig = {
  // Bluehost shared hosting: no Node runtime. Everything must be plain files.
  output: "export",
  basePath,
  // Emit /route/index.html so Apache serves folders without rewrite tricks.
  trailingSlash: true,
  // next/image optimisation needs a server. Serve files from public/ as-is.
  images: { unoptimized: true },
  // Do not upload source maps to the shared host.
  productionBrowserSourceMaps: false,
}

export default nextConfig
