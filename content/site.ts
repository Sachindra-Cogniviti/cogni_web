// All copy and site-wide settings live here. Marketing edits happen in
// content/, not in JSX.
//
// Source of truth for this page is the Claude Design project
// "Cogniviti Labs v1" (see README). Wording below is transcribed from it.

// Production origin, no trailing slash. Feeds robots.txt, sitemap.xml and
// metadataBase.
export const siteUrl = "https://cognivitilabs.com"

export const site = {
  name: "Cogniviti Labs",
  title:
    "Cogniviti Labs — Engineering the systems behind modern procurement and finance",
  description:
    "Cogniviti Labs implements and supports enterprise procurement and EPM platforms, and builds proprietary products for master data, integrations, spend intelligence, cash-flow management, platform adoption and agentic operations.",
  locale: "en",
  email: "contact@cognivitilabs.com",
  logo: {
    src: "/cogniviti-labs-logo.webp",
    // Intrinsic size of the source file. Both are needed by next/image, which
    // runs unoptimised here (no server) but still uses them to reserve space.
    width: 2048,
    height: 384,
    alt: "Cogniviti Labs",
  },
} as const

/* ---------------------------------------------------------------------------
 * Navigation
 * ------------------------------------------------------------------------- */

export const nav = {
  links: [
    { label: "Services", href: "#services" },
    { label: "Products", href: "#products" },
    { label: "Platforms", href: "#platforms" },
    { label: "Coupa Training", href: "#training" },
    { label: "Resources", href: "#resources" },
    { label: "Company", href: "#company" },
    { label: "Careers", href: "#careers" },
  ],
  cta: { label: "Talk to Our Team", href: "#contact" },
} as const

/* ---------------------------------------------------------------------------
 * Hero
 * ------------------------------------------------------------------------- */

export const hero = {
  disciplines: ["Procurement", "Finance", "Data", "Integration"],
  // The headline is split so "systems" can be set in Newsreader italic. That
  // accent is the page's typographic signature - see components/hero.tsx.
  headline: {
    before: "Engineering the ",
    accent: "systems",
    after: " behind modern procurement and finance.",
  },
  body: "Cogniviti Labs implements and supports enterprise procurement and EPM platforms—and builds proprietary products for master data, integrations, spend intelligence, cash-flow management, platform adoption and agentic operations.",
  actions: [
    { label: "Explore Our Products", href: "#products", variant: "solid" },
    {
      label: "Explore Platform Services",
      href: "#services",
      variant: "outline",
    },
  ],
  footnote:
    "Operating across Singapore, India, Indonesia, the United Kingdom and South Africa — with partner-supported delivery in Thailand and other markets.",
} as const

/* ---------------------------------------------------------------------------
 * Trusted by
 *
 * PLACEHOLDER: the six logo slots are awaiting real client logos. Replace
 * `logoCount` with a `logos` array of { src, alt } once assets arrive.
 * ------------------------------------------------------------------------- */

export const trustedBy = {
  kicker: "Trusted by industry leaders",
  body: "Enterprise teams across industries and regions have worked with Cogniviti Labs to implement platforms, connect systems, improve data and support business adoption.",
  logoCount: 6,
  logoPlaceholder: "Client logo",
} as const

/* ---------------------------------------------------------------------------
 * Two sides of Cogniviti Labs (the flip card)
 * ------------------------------------------------------------------------- */

export const twoSides = {
  kicker: "Two sides of Cogniviti Labs",
  heading: "Enterprise expertise. Purpose-built technology.",
  body: "We combine hands-on enterprise delivery with products developed around problems we encounter in real operational environments.",
  flipLabel: "Flip the card",
  faces: [
    {
      index: "01 — Platform Services",
      title: "Enterprise Platform Services",
      body: "Specialist teams to design, implement, integrate, improve and support procurement and EPM platforms across complex enterprise environments.",
      cta: { label: "Explore Our Services", href: "#services" },
    },
    {
      index: "02 — Products",
      title: "Enterprise Products",
      body: "Software designed to address recurring challenges across data, integrations, analytics, cash flow, adoption and intelligent business operations.",
      cta: { label: "Explore Our Products", href: "#products" },
    },
  ],
} as const

/* ---------------------------------------------------------------------------
 * Product portfolio
 *
 * One list drives three surfaces: the dark portfolio table, the Raycast-style
 * explorer, and the footer product column. `glyph` is the two-letter mark used
 * by the explorer's app icons and dock.
 * ------------------------------------------------------------------------- */

export type Product = {
  name: string
  glyph: string
  kicker: string
  tag: string
  desc: string
  cta: string
  rows: readonly (readonly [string, string])[]
}

export const products: readonly Product[] = [
  {
    name: "Master Data Management",
    glyph: "MD",
    kicker: "Data foundation",
    tag: "Better data before it reaches your enterprise systems",
    desc: "Standardize, validate, enrich and govern master data for procurement, ERP, analytics and other operational platforms.",
    cta: "Explore MDM",
    rows: [
      ["Supplier records validated", "12,408 / 12,431"],
      ["Enrichment coverage", "96.4%"],
      ["Governance rules active", "214"],
      ["Sync targets", "ERP · P2P · Analytics"],
    ],
  },
  {
    name: "CogniFlow",
    glyph: "CF",
    kicker: "Project cash flow",
    tag: "See project cash flow before it becomes a problem",
    desc: "Track project inflows, outflows, billing, collections, committed costs and forward cash position through a unified operational view.",
    cta: "Explore CogniFlow",
    rows: [
      ["Forward cash position", "+13 weeks visible"],
      ["Committed costs tracked", "1,142 lines"],
      ["Collections outstanding", "38 invoices"],
      ["Billing milestones", "9 upcoming"],
    ],
  },
  {
    name: "Cogniviti Bridge",
    glyph: "BR",
    kicker: "Integration lifecycle",
    tag: "Move integrations from design to production with control",
    desc: "Design mappings, configure workflows, deploy across environments and monitor enterprise integrations through a governed delivery lifecycle.",
    cta: "Explore Cogniviti Bridge",
    rows: [
      ["Environments", "DEV → TEST → PROD"],
      ["Active mappings", "86"],
      ["Deployments this month", "14 governed"],
      ["Monitoring status", "All flows healthy"],
    ],
  },
  {
    name: "Spend Analytics",
    glyph: "SA",
    kicker: "Spend intelligence",
    tag: "A clearer view of enterprise spend",
    desc: "Analyse spend through pre-built dashboards and reports, identify patterns and exceptions, and ask questions of your data in natural language.",
    cta: "Explore Spend Analytics",
    rows: [
      ["Spend classified", "98.1%"],
      ["Exception alerts", "7 this week"],
      ["Categories analysed", "412"],
      ["Query", "“Top suppliers by variance”"],
    ],
  },
  {
    name: "Adoption Copilot",
    glyph: "AC",
    kicker: "Platform adoption",
    tag: "Make enterprise-platform adoption measurable",
    desc: "Provide users with contextual guidance while helping transformation teams identify questions, friction points and adoption gaps.",
    cta: "Explore Adoption Copilot",
    rows: [
      ["Guided journeys live", "32"],
      ["Friction points surfaced", "11"],
      ["Questions answered in-context", "2,847"],
      ["Adoption trend", "↑ steady"],
    ],
  },
  {
    name: "Agentic Operating System",
    glyph: "OS",
    kicker: "Agentic operations",
    tag: "Enterprise agents designed to operate together",
    desc: "A governed suite of agents for procurement and other business operations, designed to coordinate tasks, decisions and workflows across enterprise systems.",
    cta: "Explore Agentic Operating System",
    rows: [
      ["Agents coordinating", "6 governed"],
      ["Tasks orchestrated today", "318"],
      ["Human approvals pending", "4"],
      ["Audit trail", "Complete"],
    ],
  },
]

export const productPortfolio = {
  kicker: "Product portfolio",
  heading: "Products built from problems we know first-hand",
  body: "Our products are designed around enterprise requirements for control, integration, auditability and operational use.",
  links: [
    { label: "View All Products", href: "#contact", emphasis: "primary" },
    {
      label: "Request a Demonstration",
      href: "#contact",
      emphasis: "secondary",
    },
  ],
} as const

export const productExplorer = {
  kicker: "Product explorer",
  heading: "One suite. Six systems.",
  searchPlaceholder: "Search Cogniviti products…",
  scopeLabel: "All products",
  listLabel: "Suite",
  detailLabel: "Information",
  footerLabel: "Cogniviti Product Suite",
  footerAction: "Request a Demonstration",
} as const

/* ---------------------------------------------------------------------------
 * Platform services
 * ------------------------------------------------------------------------- */

export const services = {
  kicker: "Platform services",
  heading: "Platform expertise, carried through to production",
  body: "We work across the complete delivery lifecycle—from operating-model and process decisions to configuration, integration, deployment, adoption and ongoing support.",
  stages: [
    {
      num: "01",
      title: "Advisory and Process Design",
      body: "Operating models, process design, requirements, governance, platform assessment and implementation planning.",
    },
    {
      num: "02",
      title: "Platform Implementation",
      body: "Solution design, configuration, testing, migration, deployment and multi-country rollout.",
    },
    {
      num: "03",
      title: "Integration and Data",
      body: "ERP and third-party integration, APIs, master-data readiness, migration and reconciliation.",
    },
    {
      num: "04",
      title: "Adoption and Enablement",
      body: "Organizational change management, role-based learning, supplier enablement and adoption support.",
    },
    {
      num: "05",
      title: "Optimization and Managed Services",
      body: "Production support, monitoring, administration, enhancements and continuous improvement.",
    },
  ],
  experience: [
    {
      label: "Platform experience",
      items: ["Coupa", "GEP", "Ivalua", "OneStream"],
    },
    {
      label: "Integration experience",
      items: [
        "SAP",
        "Oracle",
        "Microsoft Dynamics",
        "NetSuite",
        "Enterprise APIs",
      ],
    },
  ],
  cta: { label: "Explore Platform Services", href: "#contact" },
} as const

/* ---------------------------------------------------------------------------
 * Coupa training
 * ------------------------------------------------------------------------- */

export const training = {
  badge: "Official Coupa Training Partner",
  heading: "Coupa training grounded in implementation experience",
  body: [
    "As an Official Coupa Training Partner, Cogniviti Labs provides structured learning for the people responsible for implementing, administering and using Coupa.",
    "Our trainers combine platform knowledge with practical delivery experience across procurement processes, integrations, data, testing, rollout and adoption.",
  ],
  actions: [
    { label: "Explore Coupa Training", href: "#contact", variant: "solid" },
    {
      label: "Discuss Your Training Requirements",
      href: "#contact",
      variant: "outline",
    },
  ],
  panelLabel: "Approved Coupa training offerings",
  offerings: [
    { title: "Platform administration", tag: "ADMIN" },
    { title: "Implementation teams", tag: "DELIVERY" },
    { title: "Business users and buyers", tag: "ADOPTION" },
    { title: "Suppliers and enablement", tag: "SUPPLIER" },
  ],
} as const

/* ---------------------------------------------------------------------------
 * Experience and credentials
 *
 * PLACEHOLDER: these four figures were illustrative in the design and have not
 * been confirmed. Replace with real numbers before cutover.
 * ------------------------------------------------------------------------- */

export const credentials = {
  kicker: "Experience and credentials",
  heading: "Enterprise delivery requires proven capability",
  stats: [
    {
      value: "60",
      suffix: "+",
      label: "Implementations and major platform engagements",
    },
    { value: "14", suffix: "", label: "Countries supported" },
    {
      value: "80",
      suffix: "+",
      label: "Years of combined leadership experience",
    },
    {
      value: "45",
      suffix: "+",
      label: "Professional and platform certifications",
    },
  ],
  // PLACEHOLDER: awaiting real certification artwork.
  certificationsLabel: "Certified expertise",
  certificationCount: 4,
  certificationPlaceholder: "Certification badge",
} as const

/* ---------------------------------------------------------------------------
 * Global presence
 *
 * `left` is the percentage position along the meridian rule; `above` puts the
 * label over the line rather than under it, so adjacent labels do not collide.
 * `tz` is an IANA zone - the clock is formatted in the browser on mount.
 * ------------------------------------------------------------------------- */

export const globalPresence = {
  kicker: "Global presence",
  heading: "Regional presence. Cross-border delivery.",
  body: "Cogniviti Labs supports enterprise programs through teams operating across Singapore, India, Indonesia, the United Kingdom and South Africa. Our partner network extends delivery into Thailand and other markets, with local coordination alongside consistent program governance.",
  locations: [
    {
      name: "United Kingdom",
      offset: "GMT+1",
      tz: "Europe/London",
      left: 4,
      above: true,
    },
    {
      name: "South Africa",
      offset: "GMT+2",
      tz: "Africa/Johannesburg",
      left: 20,
      above: false,
    },
    {
      name: "India",
      offset: "GMT+5:30",
      tz: "Asia/Kolkata",
      left: 52,
      above: true,
    },
    {
      name: "Indonesia",
      offset: "GMT+7",
      tz: "Asia/Jakarta",
      left: 72,
      above: false,
    },
    {
      name: "Singapore",
      offset: "GMT+8",
      tz: "Asia/Singapore",
      left: 88,
      above: true,
    },
  ],
  partner: {
    left: 66,
    label: "Partner-supported",
    detail: "Thailand + other markets",
  },
} as const

/* ---------------------------------------------------------------------------
 * Selected client work
 * ------------------------------------------------------------------------- */

export const clientWork = {
  kicker: "Selected client work",
  heading: "Work that reaches production",
  cta: { label: "View All Client Stories", href: "#contact" },
  readLabel: "Read the Client Story",
  stories: [
    {
      num: "01",
      title: "Multi-country procurement-platform implementation",
      tags: [
        "Process design",
        "ERP integration",
        "Data migration",
        "Multi-entity rollout",
      ],
      body: "Designed and delivered enterprise procurement processes, platform configuration, ERP integration, data migration, testing and business rollout across multiple operating entities.",
      href: "#contact",
    },
    {
      num: "02",
      title: "Enterprise integration and data readiness",
      tags: ["Master data", "Governed workflows", "Third-party systems"],
      body: "Prepared master data and connected procurement processes with ERP and third-party systems through governed integration workflows.",
      href: "#contact",
    },
    {
      num: "03",
      title: "Post-go-live support and optimization",
      tags: ["Stabilization", "Issue resolution", "Managed support"],
      body: "Stabilized production operations, resolved process and integration issues, and established ongoing platform support and improvement.",
      href: "#contact",
    },
  ],
} as const

/* ---------------------------------------------------------------------------
 * Why Cogniviti Labs
 * ------------------------------------------------------------------------- */

export const why = {
  kicker: "Why Cogniviti Labs",
  // Split for the Newsreader italic accent, as with the hero headline.
  heading: {
    before: "Built for the work ",
    accent: "between",
    after: " the platforms",
  },
  body: "Enterprise programs rarely fail because of one configuration decision. Difficulties emerge between business processes, data, integrations, controls, users and operational ownership. Cogniviti Labs works across these boundaries.",
  pillars: [
    {
      title: "Business-process understanding",
      body: "Procurement and finance expertise that informs platform and product decisions.",
    },
    {
      title: "Engineering discipline",
      body: "Structured approaches to integration, data, testing, deployment and production control.",
    },
    {
      title: "Practical adoption",
      body: "Training and adoption support connected to real roles, processes and system usage.",
    },
    {
      title: "Long-term accountability",
      body: "Support extending beyond go-live into stabilization, optimization and ongoing operations.",
    },
  ],
} as const

/* ---------------------------------------------------------------------------
 * Products and services, working together
 * ------------------------------------------------------------------------- */

export const together = {
  kicker: "Products and services, working together",
  heading: "Use our products independently—or as part of a wider program",
  body: "Every Cogniviti product can address a defined business requirement on its own. Where appropriate, we also combine our products with platform implementation, integration and managed services. This gives clients the flexibility to solve an immediate problem or establish a broader transformation capability.",
  cta: { label: "Discuss Your Requirements", href: "#contact" },
} as const

/* ---------------------------------------------------------------------------
 * Resources
 *
 * PLACEHOLDER: `image` describes the art direction for a slot that is still
 * awaiting real editorial photography. Swap for a { src, alt } pair.
 * ------------------------------------------------------------------------- */

export const resources = {
  kicker: "Resources",
  heading: "Practical insight for enterprise teams",
  body: "Guidance based on the realities of platform delivery, integration, data management and business adoption.",
  cta: { label: "Explore Resources", href: "#contact" },
  readLabel: "Read",
  items: [
    {
      eyebrow: "Featured client story",
      title:
        "Preparing master data for an enterprise procurement implementation",
      image: "editorial photo — data infrastructure",
      href: "#contact",
    },
    {
      eyebrow: "Featured guide",
      title:
        "Designing controlled integrations across development, test and production",
      image: "editorial photo — systems architecture",
      href: "#contact",
    },
    {
      eyebrow: "Featured insight",
      title: "Measuring adoption after an enterprise-platform rollout",
      image: "editorial photo — modern workplace",
      href: "#contact",
    },
  ],
} as const

/* ---------------------------------------------------------------------------
 * Careers
 * ------------------------------------------------------------------------- */

export const careers = {
  kicker: "Careers",
  heading: "Build enterprise technology that businesses depend on",
  body: "Work across product engineering, procurement, finance, integrations, data and applied AI—solving problems that continue beyond the initial implementation.",
  cta: { label: "Explore Careers", href: "#contact" },
} as const

/* ---------------------------------------------------------------------------
 * Contact
 * ------------------------------------------------------------------------- */

export const contact = {
  disciplines: ["Procurement", "Finance", "Data", "Integration"],
  heading:
    "Planning an enterprise platform program—or evaluating one of our products?",
  body: "Speak with our team about your business processes, technology landscape and operational requirements.",
  actions: [
    { label: "Discuss a Services Requirement", variant: "solid" },
    { label: "Request a Product Demonstration", variant: "outline" },
  ],
} as const

/* ---------------------------------------------------------------------------
 * Footer
 * ------------------------------------------------------------------------- */

export const footer = {
  tagline: "Engineering the systems behind modern procurement and finance.",
  offices: "Singapore | India",
  columns: [
    {
      label: "Services",
      links: [
        { label: "Advisory and Process Design", href: "#services" },
        { label: "Platform Implementation", href: "#services" },
        { label: "Integration and Data", href: "#services" },
        { label: "Adoption and Enablement", href: "#services" },
        { label: "Managed Services", href: "#services" },
      ],
    },
    {
      label: "Products",
      links: [
        { label: "Master Data Management", href: "#products" },
        { label: "CogniFlow", href: "#products" },
        { label: "Cogniviti Bridge", href: "#products" },
        { label: "Spend Analytics", href: "#products" },
        { label: "Adoption Copilot", href: "#products" },
        { label: "Agentic Operating System", href: "#products" },
      ],
    },
    {
      label: "Platforms",
      links: [
        { label: "Coupa", href: "#platforms" },
        { label: "GEP", href: "#platforms" },
        { label: "Ivalua", href: "#platforms" },
        { label: "OneStream", href: "#platforms" },
      ],
    },
    {
      label: "Company",
      links: [
        { label: "Our Story", href: "#company" },
        { label: "Client Stories", href: "#work" },
        { label: "Resources", href: "#resources" },
        { label: "Careers", href: "#careers" },
        { label: "Contact", href: "#contact" },
      ],
    },
  ],
  legal: [
    { label: "Privacy Policy", href: "#top" },
    { label: "Terms and Conditions", href: "#top" },
  ],
} as const
