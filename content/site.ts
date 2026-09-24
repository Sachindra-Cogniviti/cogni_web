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
    "Cogniviti Labs: Engineering the systems behind modern procurement and finance",
  description:
    "Cogniviti Labs implements and supports enterprise procurement and EPM platforms, and builds proprietary products for master data, integrations, spend intelligence, cash-flow management, platform adoption and agentic operations.",
  /**
   * The homepage in a search result, which is not the same job as `title`
   * and `description` above.
   *
   * Those two are the positioning statement, and they are the right length
   * for the tab and for a share card, where the whole string is shown. A
   * result listing is not: Google renders roughly 60 characters of title and
   * 155 of description. At 77 and 227 the pair lost "procurement" and
   * "finance" off the end of the title and everything past "spend
   * intelligence" off the description - the specifics, in both cases.
   *
   * See `PageSeo` in content/pages.ts, which does the same thing for every
   * other page.
   */
  seo: {
    title: "Procurement & Finance Systems Engineering",
    description:
      "Cogniviti Labs implements enterprise procurement and EPM platforms, and builds products for master data, integrations and spend intelligence.",
  },
  // en-GB, not en: the copy is written in British English and every market
  // the company operates in reads it. It was "en" against an og:locale of
  // "en_GB", which is the same claim made two different ways.
  locale: "en-GB",
  email: "contact@cognivitilabs.com",
  // The logo file itself is statically imported where it is rendered
  // (site-nav, site-footer). The import gives next/image the file's intrinsic
  // width and height, which is what lets it emit a srcset and reserve the
  // right box; a string src would give it neither.
  logo: { alt: "Cogniviti Labs" },
} as const

/* ---------------------------------------------------------------------------
 * Navigation
 * ------------------------------------------------------------------------- */

export const nav = {
  links: [
    { label: "Services", href: "/#services" },
    { label: "Products", href: "/products/" },
    { label: "Platforms", href: "/#platforms" },
    { label: "Experience", href: "/experience/" },
    { label: "Training", href: "/#training" },
    { label: "Company", href: "/#company" },
    { label: "Careers", href: "/careers/" },
  ],
  cta: { label: "Talk to Our Team", href: "/contact/" },
  /** The compact bar's toggle, read out by assistive technology. */
  menuLabel: "Open menu",
  closeLabel: "Close menu",
} as const

/**
 * Section rail (components/section-rail.tsx): the sections in page order.
 * `dark` marks sections on the night ground so the rail flips to light ink.
 */
export const rail = {
  label: "Page sections",
  sections: [
    { id: "two-sides", label: "Two sides" },
    { id: "products", label: "Products", dark: true },
    { id: "services", label: "Services" },
    { id: "platforms", label: "Platforms" },
    { id: "training", label: "Coupa Training" },
    { id: "company", label: "Company" },
    { id: "work", label: "Client work" },
    { id: "why", label: "Why Cogniviti" },
    { id: "resources", label: "Resources" },
    { id: "careers", label: "Careers" },
    { id: "contact", label: "Contact", dark: true },
  ],
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
  body: "Cogniviti Labs implements and supports enterprise procurement and EPM platforms, and builds proprietary products for master data, integrations, spend intelligence, cash-flow management, platform adoption and agentic operations.",
  actions: [
    { label: "Explore Our Products", href: "#products", variant: "solid" },
    {
      label: "Explore Platform Services",
      href: "#services",
      variant: "outline",
    },
  ],
  footnote:
    "Operating across Singapore, India, Indonesia, the United Kingdom and South Africa, with partner-supported delivery in Thailand and other markets.",
  // The galaxy in the hero's right-hand whitespace (components/hero-galaxy.tsx).
  // Five capability nodes orbit a core: `r` is orbit radius, `a` the angle in
  // radians, `product` marks Cogniviti products against platforms we serve.
  // Hovering a node blooms its `items` around it.
  galaxy: {
    nodes: [
      {
        label: "Agentic Operating System",
        product: true,
        r: 2.35,
        a: 0.35,
        items: ["Sourcing agent", "Invoice agent", "Supplier agent"],
      },
      {
        label: "Intelligence and adoption",
        product: true,
        r: 3.1,
        a: 1.55,
        items: ["Spend Analytics", "CogniFlow", "Adoption Copilot"],
      },
      {
        label: "Integration and data",
        product: true,
        r: 2.7,
        a: 2.85,
        items: ["Cogniviti Bridge", "Master Data Management"],
      },
      {
        label: "Procurement and EPM platforms",
        product: false,
        r: 3.3,
        a: 4.0,
        items: ["Coupa", "GEP", "Ivalua", "OneStream"],
      },
      {
        label: "Enterprise systems",
        product: false,
        r: 2.9,
        a: 5.2,
        items: ["SAP", "Oracle", "NetSuite", "Dynamics", "Enterprise APIs"],
      },
    ],
  },
} as const

/* ---------------------------------------------------------------------------
 * Trusted by
 * ------------------------------------------------------------------------- */

/**
 * Client logos. Files live in public/logos and are imported statically in
 * components/trusted-by.tsx, keyed by `id`. `height` is the rendered height in
 * pixels, set per logo so wide wordmarks and stacked marks sit at the same
 * optical weight. `tone: "light"` marks a white logo, which is rendered dark
 * so it shows on the paper ground. Each logo links to `href`.
 */
export const trustedBy = {
  kicker: "Trusted by industry leaders",
  body: "Enterprise teams across industries and regions have worked with Cogniviti Labs to implement platforms, connect systems, improve data and support business adoption.",
  logos: [
    {
      id: "indosat",
      name: "Indosat Ooredoo Hutchison",
      href: "https://ioh.co.id/EN/home",
      height: 40,
    },
    { id: "nets", name: "NETS", href: "https://www.nets.com.sg/", height: 30 },
    {
      id: "carsome",
      name: "Carsome",
      href: "https://www.carsome.my/",
      height: 26,
    },
    {
      id: "pil",
      name: "Pacific International Lines",
      href: "https://www.pilship.com/",
      height: 34,
    },
    {
      id: "bangchak",
      name: "Bangchak",
      href: "https://www.bangchak.co.th/en/home",
      height: 60,
    },
    { id: "mirvac", name: "Mirvac", href: "https://mirvac.com/", height: 56 },
    {
      id: "dynapack",
      name: "Dynapack Asia",
      href: "https://www.dynapackasia.com/",
      height: 50,
    },
    {
      id: "wearnes",
      name: "Wearnes",
      href: "https://wearnes-preowned.com/",
      height: 30,
      tone: "light",
    },
    {
      id: "tfg",
      name: "TFG Limited",
      href: "https://tfglimited.co.za/",
      height: 46,
    },
    {
      id: "digitalEdge",
      name: "Digital Edge",
      href: "https://www.digitaledgedc.com/",
      height: 42,
    },
    {
      id: "fidelity",
      name: "Fidelity Services Group",
      href: "https://fidelity-services.com/",
      height: 32,
    },
    { id: "aeci", name: "AECI", href: "https://www.aeciworld.com/", height: 54 },
  ],
} as const

/* ---------------------------------------------------------------------------
 * Certifications
 *
 * Sits directly under the client wall, because the two read as one argument:
 * who trusts us, and what we are independently held to. That pairing is also
 * why this section reuses the wall's armature - the same label column and the
 * same hairline grid - rather than inventing a third layout.
 *
 * Typographic rather than a row of badge graphics, and that is deliberate.
 * ISO does not issue a logo to certified organisations; the mark belongs to
 * whichever body performed the audit, carries their accreditation, and its
 * use is governed by their rules. A generic "ISO 27001 certified" graphic off
 * the web is evidence of nothing, and to a procurement buyer it reads worse
 * than the plain designation set with confidence. `badge` is an optional slot
 * for the real certifier artwork once it exists - see components for how it
 * renders when present.
 *
 * `issuer` and `reference` are the two fields that turn a claim into a
 * checkable fact. Both are empty until the certificates are to hand.
 * ------------------------------------------------------------------------- */

export const certifications = {
  kicker: "Certified expertise",
  body: "Independently audited management systems, and platform accreditation held directly with the vendor.",
  // PLACEHOLDER: `issuer` and `reference` are blank pending the certificates.
  // Each renders only when filled, so the cards are complete without them.
  items: [
    {
      id: "iso-27001",
      eyebrow: "Information security",
      standard: "ISO/IEC 27001",
      body: "An audited information security management system, covering how client data is handled across delivery and support.",
      issuer: "",
      reference: "",
    },
    {
      id: "iso-9001",
      eyebrow: "Quality management",
      // ISO 9000 is the family's vocabulary document and is not certifiable.
      // Organisations are certified against ISO 9001; that is the claim to
      // make on a page enterprise buyers read.
      standard: "ISO 9001",
      body: "A quality management system audited against defined process, review and continual improvement requirements.",
      issuer: "",
      reference: "",
    },
    {
      id: "coupa-partner",
      eyebrow: "Procurement platform",
      standard: "Coupa Platform Partner",
      body: "Accredited by Coupa to implement and support the platform, and an Official Coupa Training Partner.",
      issuer: "",
      reference: "",
    },
  ],
} as const

/* ---------------------------------------------------------------------------
 * Updates
 *
 * The news carousel after the certifications: one announcement at a time,
 * each with a picture, paginated underneath (components/updates.tsx).
 *
 * DRAFT, and the one block on the site where that matters most. Every item
 * below is derived from something the site already says - AOS being in
 * development, the Experience Centre, the Coupa training partnership, the
 * offices in globalPresence - because a news feed is read as a record of
 * things that actually happened on the dates given. Nothing here should
 * announce a partner, a customer, a launch or a figure that has not been
 * confirmed, and the dates need setting to the real ones before launch.
 *
 * `kind` is the label over the headline, so keep it to one or two words.
 * `date` is display text, not a timestamp: it is never parsed, so "Q4 2026"
 * is as valid as a day.
 *
 * `image` is null until there is a real one, and a null renders the hatched
 * placeholder rather than an empty box - so the section is complete today and
 * each picture arrives by filling in one object. Files go in public/updates/.
 * Landscape, 16:10, at least 1120x700 so it is sharp on a 2x screen.
 *
 * This moves to Payload once the design is signed off - same shape as the
 * roles collection, see payload/collections/roles.ts - because announcements
 * are the one thing on this page with a natural expiry.
 * ------------------------------------------------------------------------- */

export type Update = {
  kind: string
  date: string
  title: string
  body: string
  /** 16:10 landscape, or null for the placeholder. */
  image: { src: string; alt: string } | null
  cta: { label: string; href: string }
}

export const updates: {
  kicker: string
  heading: string
  /** Seconds one item holds before the next arrives. */
  dwell: number
  pauseLabel: string
  playLabel: string
  /** Shown in place of a picture that does not exist yet. */
  imagePending: string
  items: readonly Update[]
} = {
  kicker: "Latest updates",
  heading: "What is moving right now",
  dwell: 7,
  pauseLabel: "Pause",
  playLabel: "Play",
  imagePending: "Image to come",
  items: [
    {
      kind: "Product",
      date: "In development",
      title: "Agentic Operating System",
      body: "The governance layer that lets enterprises scale AI agents with the trust, transparency and auditability that mission-critical operations demand.",
      image: null,
      cta: {
        label: "What we are building",
        href: "/products/agentic-operating-system/",
      },
    },
    {
      kind: "Platform",
      date: "Now live",
      title: "The Experience Centre is open",
      body: "Run the products yourself against representative data, at desktop, tablet or phone width, before you speak to anybody.",
      image: null,
      cta: { label: "Open the Experience Centre", href: "/experience/" },
    },
    {
      kind: "Partnership",
      date: "Ongoing",
      title: "Official Coupa Training Partner",
      body: "Accredited by Coupa to implement and support the platform, and to deliver its training programme across the region.",
      image: null,
      cta: { label: "Explore Coupa Training", href: "/#training" },
    },
    {
      kind: "Delivery",
      date: "Ongoing",
      title: "Cross-border delivery across five markets",
      body: "Teams operating from Singapore, India, Indonesia, the United Kingdom and South Africa, with partner coverage into Thailand.",
      image: null,
      cta: { label: "Where to find us", href: "/contact/" },
    },
  ],
}

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
      index: "01 · Platform Services",
      title: "Enterprise Platform Services",
      body: "Specialist teams to design, implement, integrate, improve and support procurement and EPM platforms across complex enterprise environments.",
      cta: { label: "Explore Our Services", href: "#services" },
    },
    {
      index: "02 · Products",
      title: "Enterprise Products",
      body: "Software designed to address recurring challenges across data, integrations, analytics, cash flow, adoption and intelligent business operations.",
      cta: { label: "Explore Our Products", href: "#products" },
    },
  ],
} as const

/* ---------------------------------------------------------------------------
 * Product portfolio
 *
 * One list drives three surfaces: the portfolio table (hidden for now), the
 * product desktop, and the footer product column. `glyph` is the two-letter
 * mark used by the desktop's app icons and dock.
 * ------------------------------------------------------------------------- */

export type Product = {
  name: string
  /** URL segment under /products. Also the key into productPages. */
  slug: string
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
    slug: "master-data-management",
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
    slug: "cogniflow",
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
    slug: "cogniviti-bridge",
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
    slug: "spend-analytics",
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
    slug: "adoption-copilot",
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
    slug: "agentic-operating-system",
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
    { label: "View All Products", href: "/products/", emphasis: "primary" },
    {
      label: "Request a Demonstration",
      href: "/experience/",
      emphasis: "secondary",
    },
  ],
} as const

/**
 * Product desktop (components/product-desktop.tsx): the suite shown as a
 * small operating system. `menuBar` holds the menu titles and items ({name}
 * is replaced by the open product), `spotlight` the search panel's copy, and
 * `dock.contact` the extra Dock item that links to the contact section.
 */
export const productDesktop = {
  kicker: "Product portfolio",
  heading: "One suite. Six systems.",
  body: "Every product runs on the same foundation, so data, integrations and agents work together rather than side by side.",
  brand: "Cogniviti",
  menuBar: {
    app: {
      open: "Open {name}",
      zoom: "Zoom",
      unzoom: "Restore size",
      minimise: "Minimise",
      quit: "Quit {name}",
    },
    window: "Window",
    help: "Help",
    helpItems: [
      { label: "Talk to our team", href: "/contact/?subject=products" },
      { label: "Request a demonstration", href: "/experience/" },
    ],
  },
  spotlight: {
    label: "Search products",
    placeholder: "Search Cogniviti products…",
    results: "Products",
    empty: "No products match",
    open: "Open",
    close: "Close search",
  },
  windowTitleSuffix: "Cogniviti Suite",
  detailLabel: "Information",
  closedHint: "Choose a product from the Dock to open it",
  /** Seconds each product holds on the phone before the next slides in. */
  dwell: 5,
  dock: {
    label: "Dock",
    contact: { label: "Talk to our team", href: "/contact/?subject=products" },
  },
  controls: {
    close: "Close window",
    minimise: "Minimise window",
    zoom: "Zoom window",
  },
} as const

/* ---------------------------------------------------------------------------
 * Platform services
 * ------------------------------------------------------------------------- */

export const services = {
  kicker: "Platform services",
  heading: "Platform expertise, carried through to production",
  body: "We work across the complete delivery lifecycle, from operating-model and process decisions to configuration, integration, deployment, adoption and ongoing support.",
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
  /**
   * Experience lists. An item with a `logo` renders as a logo tile (file in
   * public/logos/platforms, imported in components/experience-rows.tsx and
   * keyed by id; `height` is the rendered height in px). Items without one
   * render as text chips, so a logo can be added per item as files arrive.
   *
   * An item with a `detail` becomes clickable and opens a panel under its row
   * (components/experience-rows.tsx). Items without one are not interactive at
   * all - no cursor, no hover, no focus stop - so a tile never invites a click
   * that does nothing. Adding a `detail` is all it takes to switch one on.
   *
   * Keep `capabilities` at six per item. It is what makes the two groups read
   * as one system rather than two lists that happen to sit near each other,
   * and the panel's right-hand column is sized for six rows against the prose
   * beside it.
   *
   * `summary` is the one-paragraph position; `body` is the how. They were two
   * disclosure levels in the source copy, behind a "Show more". Here the tile
   * click is already the disclosure, and a second toggle inside a panel the
   * reader has just deliberately opened is a door behind a door.
   */
  experience: [
    {
      label: "Platform experience",
      // Shown under the label only while nothing is open. A grid of logos does
      // not read as clickable on its own, and the tiles carry no text of their
      // own to hint with.
      hint: "Select a platform",
      items: [
        {
          name: "Coupa",
          logo: "coupa",
          height: 28,
          detail: {
            tag: "Source-to-Pay",
            summary:
              "We support organizations across the full lifecycle of Coupa initiatives, from assessment through implementation and optimization, enabling clear spend visibility, efficient Source-to-Pay workflows and consistent supplier management.",
            body: "We configure Coupa to align with your procurement processes, approval structures and compliance requirements. Integrations with ERP and related systems are handled carefully to maintain data accuracy and operational continuity. Post go-live, we support adoption and incremental improvements to help you realize sustained value.",
            capabilities: [
              "Spend visibility & analytics",
              "Source-to-Pay workflows",
              "Supplier management",
              "ERP integration",
              "Approval & compliance structures",
              "Adoption & optimization",
            ],
          },
        },
        {
          name: "GEP",
          logo: "gep",
          height: 30,
          detail: {
            tag: "SMART Suite",
            summary:
              "We implement and evolve GEP platforms across sourcing, procurement, supplier management, spend analysis and supply chain, with a structured approach to assessment, configuration, integration and data readiness.",
            body: "Our work spans the GEP SMART suite, ensuring solutions are aligned with business operations and governance needs. We follow a structured approach covering assessment, configuration, integration and data readiness for stable, scalable deployments, with continued optimization post go-live.",
            capabilities: [
              "Sourcing & contracts",
              "Procurement",
              "Supplier management",
              "Spend analysis",
              "Supply chain",
              "Data readiness",
            ],
          },
        },
        {
          name: "Ivalua",
          logo: "ivalua",
          height: 36,
          detail: {
            tag: "Unified Procurement",
            summary:
              "We implement and optimize Ivalua to strengthen control, visibility and consistency across Source-to-Pay, spanning sourcing, procurement, supplier, contract, invoicing and spend management on a configurable platform.",
            body: "We take a structured approach covering requirements assessment, configuration, integration and data migration to enable stable deployments. The focus is on improving process efficiency, transparency and user adoption using Ivalua's configurable capabilities, with ongoing support post go-live.",
            capabilities: [
              "Strategic sourcing",
              "Contract management",
              "Supplier management",
              "Procurement",
              "Invoicing",
              "Spend management",
            ],
          },
        },
        {
          name: "OneStream",
          logo: "onestream",
          height: 24,
          detail: {
            tag: "EPM Unified",
            summary:
              "We implement and optimize OneStream to simplify consolidation, reporting and planning in a single governed platform, built for complex, multi-entity and multi-currency finance environments.",
            body: "We work with complex, multi-entity and multi-currency environments to align the solution with finance processes, controls and regulatory requirements. A structured approach covering assessment, configuration, integration and data readiness enables reliable close and reporting cycles, with ongoing optimization.",
            capabilities: [
              "Consolidation & close",
              "Financial reporting",
              "Planning & budgeting",
              "Forecasting",
              "Multi-entity / currency",
              "Data governance",
            ],
          },
        },
      ],
    },
    {
      label: "Integration experience",
      // Five items rather than the four above, so this row runs five columns.
      // Heights are optical, not arithmetic: Oracle's wordmark is 7.7:1 and
      // has to sit far shorter than SAP's near-square block to carry the same
      // weight in the row. Names are the alt text, so they match what each
      // mark actually reads - the Microsoft lockup says "Dynamics 365" and
      // the current NetSuite mark is an Oracle NetSuite lockup.
      //
      //
      // DRAFT COPY. Unlike the platform blocks above, which came from approved
      // marketing text, these five were written to the shape of the delivery
      // work described in stage 03 and need review before launch - particularly
      // the named technologies, which are the normal furniture of each
      // integration but are still a claim about what we have actually built.
      hint: "Select a system",
      items: [
        {
          name: "SAP",
          logo: "sap",
          height: 32,
          detail: {
            tag: "ERP Integration",
            summary:
              "We connect Source-to-Pay and EPM platforms to SAP so procurement and finance work from one set of records, covering master data, the transactional flows between them and the reconciliation that keeps both sides in agreement.",
            body: "Our work covers interface design, master-data alignment and the day-to-day flows between S/4HANA or ECC and the platform being deployed: requisitions, purchase orders, goods receipt, invoices and payment status. Interfaces are tested against realistic volumes and reconciliation is designed in from the start, so a discrepancy surfaces in the process rather than at period close.",
            capabilities: [
              "S/4HANA & ECC",
              "Master data alignment",
              "Purchase order & invoice flows",
              "IDoc, BAPI & OData interfaces",
              "Reconciliation & controls",
              "Migration & cutover",
            ],
          },
        },
        {
          name: "Oracle",
          logo: "oracle",
          height: 15,
          detail: {
            tag: "Fusion & E-Business Suite",
            summary:
              "We integrate procurement and EPM platforms with Oracle Fusion Cloud and E-Business Suite, aligning supplier, item and accounting structures so spend recorded in one system reconciles cleanly in the other.",
            body: "We design interfaces around Oracle's supplier, item, purchasing and payables structures, mapping chart-of-accounts and approval data so transactions post correctly the first time. Migration and cutover get the same attention as the steady-state flows, because the first period after go-live is where integration problems actually surface.",
            capabilities: [
              "Fusion Cloud & EBS",
              "Supplier & item master",
              "Purchasing & payables",
              "Chart of accounts mapping",
              "Migration & cutover",
              "Reconciliation",
            ],
          },
        },
        {
          name: "Microsoft Dynamics 365",
          logo: "dynamics",
          height: 28,
          detail: {
            tag: "Finance & Operations",
            summary:
              "We connect Source-to-Pay and EPM platforms to Dynamics 365 Finance and Operations, keeping procurement activity, vendor records and financial postings consistent across both.",
            body: "We work through Dynamics' data entities and integration services to move vendor, purchase order and invoice data reliably in both directions, and align posting and approval rules so nothing is left stranded between systems. Where the wider estate already runs on Microsoft services, the integration is designed to fit what is in place rather than beside it.",
            capabilities: [
              "Finance & Operations",
              "Vendor & catalogue data",
              "Purchase order & invoice sync",
              "Data entities & APIs",
              "Posting & approval rules",
              "Environment management",
            ],
          },
        },
        {
          name: "Oracle NetSuite",
          logo: "netsuite",
          height: 28,
          detail: {
            tag: "Cloud ERP",
            summary:
              "We integrate NetSuite with procurement and finance platforms, giving multi-subsidiary organizations a single consistent view of spend, suppliers and results without losing the speed that took them to NetSuite in the first place.",
            body: "We align NetSuite's vendor, item and subsidiary structures with the platform being implemented, and design the purchase-to-pay flows to hold up across multiple subsidiaries and currencies. Configuration is kept as close to standard as the requirement allows, so future upgrades stay routine rather than becoming projects of their own.",
            capabilities: [
              "Vendor & item records",
              "Purchase-to-pay flows",
              "Multi-subsidiary & currency",
              "SuiteTalk & REST APIs",
              "Saved searches & reporting",
              "Upgrade-safe configuration",
            ],
          },
        },
        {
          name: "Enterprise APIs",
          logo: "api",
          height: 36,
          detail: {
            tag: "Integration Architecture",
            summary:
              "Where no packaged connector exists, we build the interface: APIs, file exchanges and middleware flows designed around real volumes, real failure modes and the people who will support them afterwards.",
            body: "We design to the interface each system actually offers rather than forcing one pattern across the estate: REST and SOAP services, scheduled file transfers, or middleware where an organization already runs one. Error handling, retries, logging and monitoring are part of the build rather than a later addition, so a failed run is visible and recoverable without pulling in a developer.",
            capabilities: [
              "REST & SOAP interfaces",
              "Middleware & iPaaS",
              "File-based exchange",
              "Error handling & retries",
              "Monitoring & alerting",
              "Security & authentication",
            ],
          },
        },
      ],
    },
  ],
  cta: { label: "Explore Platform Services", href: "/contact/?subject=platform-implementation" },
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
    { label: "Explore Coupa Training", href: "/contact/?subject=training", variant: "solid" },
    {
      label: "Discuss Your Training Requirements",
      href: "/contact/?subject=training",
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
 * Our story
 *
 * Opens the #company block. It is the only thing on the site that explains how
 * a platform-implementation practice came to be building an Agentic Operating
 * System - which already sits in `products` above with no stated origin.
 *
 * The four stages are a causal chain, not a list of equal capabilities: each
 * one is the consequence of the one before, and 04 is a problem statement that
 * `close` answers. That is why they are numbered here and drawn as a spine
 * rather than as a grid of matching cells - see components/our-story.tsx.
 * ------------------------------------------------------------------------- */

export const story = {
  kicker: "Our story",
  heading: "From implementing platforms to governing AI at scale",
  body: "We didn't set out to build an AI operating system. We arrived here by following a problem, one our clients kept running into as AI moved from promise to production.",
  stages: [
    {
      num: "01",
      label: "Where we began",
      title: "Mastering enterprise platform implementation.",
      body: "We launched as a team of senior experts dedicated to implementing top-tier finance and procurement platforms: Coupa, Ivalua, GEP and OneStream. We didn't just configure software: we integrated ERPs, cleaned data, and ensured high adoption.",
    },
    {
      num: "02",
      label: "The shift",
      title: "Platforms transitioned to AI-native ecosystems.",
      body: "With the rise of native AI agents and agent studios, our work shifted from basic configuration to intelligent composition, building agents that reason and act across the entire source-to-pay lifecycle.",
    },
    {
      num: "03",
      label: "The response",
      title: "Engineering custom agents for complex enterprise workflows.",
      body: "We followed the technology, building bespoke AI agents tailored to our clients' exact data and workflows. But as we deployed more agents, a massive infrastructure gap became obvious.",
    },
    {
      num: "04",
      label: "The solution",
      title:
        "Bridging the gap between agent scaling and enterprise governance.",
      body: "Enterprise AI rarely fails due to a shortage of agents; it fails due to a deficit of control. As companies scale from a few isolated agents to hundreds, they face a critical need for centralized orchestration, continuous monitoring, and rigorous risk safeguards.",
    },
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
  // The certification strip that used to sit here - four hatched placeholders
  // under the presence map - is now its own section directly beneath the
  // client wall, with real content. See `certifications` above.
} as const

/* ---------------------------------------------------------------------------
 * Global presence
 *
 * Rendered as a dotted map (components/presence-map.tsx). `region` is the
 * whole world less Antarctica and the polar fringe. `anchor` says which side
 * of a pin its label sits on, chosen so the Southeast Asian cluster does not
 * collide. `tz` is an IANA zone - the clock is formatted in the browser on
 * mount. `hub` is the office the arcs radiate from, and `bow` is how high
 * each office's arc rises above its straight line (1 is the default),
 * varied so the arcs leave the hub at different angles.
 * ------------------------------------------------------------------------- */

export const globalPresence = {
  kicker: "Global presence",
  heading: "Regional presence. Cross-border delivery.",
  body: "Cogniviti Labs supports enterprise programs through teams operating across Singapore, India, Indonesia and South Africa. Our partner network extends delivery into Thailand and other markets, with local coordination alongside consistent program governance.",
  region: { lat: { min: -56, max: 78 }, lng: { min: -170, max: 180 } },
  hub: "sg",
  locations: [
    {
      id: "za",
      name: "South Africa",
      offset: "GMT+2",
      tz: "Africa/Johannesburg",
      lat: -26.2,
      lng: 28.05,
      anchor: "bottom",
      bow: 1,
    },
    {
      id: "in",
      name: "India",
      offset: "GMT+5:30",
      tz: "Asia/Kolkata",
      lat: 19.1,
      lng: 72.9,
      anchor: "left",
      bow: 0.85,
    },
    {
      id: "id",
      name: "Indonesia",
      offset: "GMT+7",
      tz: "Asia/Jakarta",
      lat: -6.2,
      lng: 106.8,
      anchor: "bottom",
      bow: 0.5,
    },
    {
      id: "sg",
      name: "Singapore",
      offset: "GMT+8",
      tz: "Asia/Singapore",
      lat: 1.35,
      lng: 103.8,
      anchor: "right",
      bow: 0,
    },
  ],
  partner: {
    id: "th",
    lat: 13.75,
    lng: 100.5,
    anchor: "right",
    bow: 0.8,
    label: "Partner-supported",
    detail: "Thailand + other markets",
  },
} as const

/* ---------------------------------------------------------------------------
 * Founders and team
 *
 * Closes the #company block. `photo` is an id, not a path: the files live in
 * public/founders and public/team and are statically imported and keyed in
 * components/people.tsx, the same arrangement the platform logos use, so this
 * file stays plain data.
 *
 * `role` and `tenure` are separate fields and `previously` is a list, because
 * the "·" between them is punctuation the component draws. Storing
 * "Director · 15+ yrs" as one string would bake a separator into the copy and
 * make it impossible to set the two halves differently, which is exactly what
 * the design does.
 *
 * Team members carry no `tenure` - it was not supplied for them, and inventing
 * years of experience for a named individual is not a gap to fill in with a
 * plausible number.
 * ------------------------------------------------------------------------- */

export const people = {
  kicker: "Founders and team",
  heading: "The people behind it",
  body: "A boutique team of senior practitioners, with the hands-on experience to implement, the engineering depth to build, and the judgment to govern AI at enterprise scale.",
  connectLabel: "Connect",
  /** The hint beside the row on large screens, where scrolling drives it. */
  scrollHint: "Scroll to meet everyone",
  groups: [
    {
      label: "Our founders",
      members: [
        {
          name: "Mohammed Zafar Ali",
          photo: "zafar",
          role: "Executive Director",
          tenure: "25+ yrs",
          previously: ["Accenture", "Deloitte", "KPMG"],
          body: "Large-scale procurement transformation programs.",
          linkedin: "https://www.linkedin.com/in/mdzafarali/",
        },
        {
          name: "John Philip",
          photo: "john",
          role: "Executive Director",
          tenure: "22+ yrs",
          previously: ["SAP", "KPMG", "BCT"],
          body: "Tech consulting, value selling and enterprise delivery.",
          linkedin: "https://www.linkedin.com/in/john-philip-07a29416/",
        },
        {
          name: "Sushil Yerunkar",
          photo: "sushil",
          role: "Director",
          tenure: "14+ yrs",
          previously: ["Coupa"],
          body: "25+ source-to-pay implementations across APAC.",
          linkedin: "https://www.linkedin.com/in/sushil-yerunkar-8a852820/",
        },
        {
          name: "Robin Garg",
          photo: "robin",
          role: "Director",
          tenure: "15+ yrs",
          previously: ["BCG"],
          body: "Procurement strategy across BCG's global offices.",
          linkedin: "https://www.linkedin.com/in/robingarg15/",
        },
        {
          name: "Kriti Gaurav",
          photo: "kriti",
          role: "Director",
          tenure: "15+ yrs",
          previously: ["EY", "PwC", "KPMG"],
          body: "Transformation and change management at Big-Four scale.",
          linkedin: "https://www.linkedin.com/in/kriti-gaurav-64850a11/",
        },
        {
          name: "Manav Sachdeva",
          photo: "manav",
          role: "Managing Director, Africa",
          tenure: "15+ yrs",
          previously: ["PSA Group", "Letsema"],
          body: "Enterprise transformation and delivery leadership.",
          linkedin: "https://www.linkedin.com/in/manav-sachdeva-b191212/",
        },
      ],
    },
    {
      label: "Our team",
      members: [
        {
          name: "Niko Sutiono",
          photo: "niko",
          role: "Senior Manager",
          previously: ["Deloitte", "EY"],
          body: "Tech-enabled transformation in finance and procurement.",
          linkedin: "https://www.linkedin.com/in/niko-sutiono/",
        },
        {
          name: "Animesh Singhal",
          photo: "animesh",
          role: "Product Manager",
          previously: ["Bahwan CyberTek", "IBM"],
          body: "AI-powered products across procurement, data and automation.",
          linkedin: "https://www.linkedin.com/in/animsin/",
        },
        {
          name: "Sandesh Jagtap",
          photo: "sandesh",
          role: "Manager",
          previously: ["Bahwan CyberTek", "Zycus"],
          body: "Digital transformation and eProcurement practice across S2P.",
          linkedin: "https://www.linkedin.com/in/sandesh-jagtap-4a1221103/",
        },
        {
          name: "Rahul Pawar",
          photo: "rahul",
          role: "Senior Solution Consultant",
          previously: ["Bahwan CyberTek", "Zycus"],
          body: "Solution design and delivery across procurement platforms.",
          linkedin: "https://www.linkedin.com/in/rahul-pawar-88993ba0/",
        },
        {
          name: "Leroy Vieira",
          photo: "leroy",
          role: "Solution Consultant",
          previously: ["Bahwan CyberTek", "Decathlon"],
          body: "End-to-end Source-to-Pay delivery across global clients.",
          linkedin: "https://www.linkedin.com/in/leroy-vieira/",
        },
        {
          name: "Joyce Kuppekar",
          photo: "joyce",
          role: "Solutions Consultant",
          previously: ["Bahwan CyberTek", "WNS"],
          body: "Supply chain management, Coupa-certified P2P & S2P.",
          linkedin: "https://www.linkedin.com/in/joyce-kuppekar-7bb7491b8/",
        },
        {
          name: "Valentina Aranjo",
          photo: "valentina",
          role: "Software Implementation Consultant",
          previously: ["Bahwan CyberTek"],
          body: "SaaS implementation and supply-chain optimization, S2P & P2P.",
          linkedin: "https://www.linkedin.com/in/valentina-aranjo-b11892131/",
        },
      ],
    },
  ],
} as const

/* ---------------------------------------------------------------------------
 * Selected client work
 * ------------------------------------------------------------------------- */

export const clientWork = {
  kicker: "Selected client work",
  heading: "Work that reaches production",
  cta: { label: "View All Client Stories", href: "/work/" },
  readLabel: "Read the Client Story",
  /** Seconds a story stays open before the index turns to the next. */
  dwell: 6,
  pauseLabel: "Pause",
  playLabel: "Play",
  /** The delivery path lays each story's tags out as stops ending here. */
  pathLabel: "Delivery path",
  pathEnd: "Production",
  /**
   * FALLBACK ONLY. The section shows the three most recent client stories
   * from Payload (app/(frontend)/page.tsx); these summaries appear only
   * while nothing is published there.
   */
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
      href: "/work/",
    },
    {
      num: "02",
      title: "Enterprise integration and data readiness",
      tags: ["Master data", "Governed workflows", "Third-party systems"],
      body: "Prepared master data and connected procurement processes with ERP and third-party systems through governed integration workflows.",
      href: "/work/",
    },
    {
      num: "03",
      title: "Post-go-live support and optimization",
      tags: ["Stabilization", "Issue resolution", "Managed support"],
      body: "Stabilized production operations, resolved process and integration issues, and established ongoing platform support and improvement.",
      href: "/work/",
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
  /** The six things the body names; drawn as a grid with the gaps between. */
  boundaries: [
    "Business processes",
    "Data",
    "Integrations",
    "Controls",
    "Users",
    "Operational ownership",
  ],
  betweenLabel: "Cogniviti Labs works here",
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
  heading: "Use our products independently, or as part of a wider program",
  body: "Every Cogniviti product can address a defined business requirement on its own. Where appropriate, we also combine our products with platform implementation, integration and managed services. This gives clients the flexibility to solve an immediate problem or establish a broader transformation capability.",
  cta: { label: "Discuss Your Requirements", href: "/contact/" },
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
  cta: { label: "Explore Resources", href: "/blog/" },
  readLabel: "Read",
  /**
   * FALLBACK ONLY. The row shows the three most recent blog posts from
   * Payload (app/(frontend)/page.tsx); these cards appear only while nothing
   * is published there.
   */
  items: [
    {
      eyebrow: "Featured client story",
      title:
        "Preparing master data for an enterprise procurement implementation",
      image: "editorial photo · data infrastructure",
      href: "/blog/",
    },
    {
      eyebrow: "Featured guide",
      title:
        "Designing controlled integrations across development, test and production",
      image: "editorial photo · systems architecture",
      href: "/blog/",
    },
    {
      eyebrow: "Featured insight",
      title: "Measuring adoption after an enterprise-platform rollout",
      image: "editorial photo · modern workplace",
      href: "/blog/",
    },
  ],
} as const

/* ---------------------------------------------------------------------------
 * Careers
 * ------------------------------------------------------------------------- */

export const careers = {
  kicker: "Careers",
  heading: "Build enterprise technology that businesses depend on",
  body: "Work across product engineering, procurement, finance, integrations, data and applied AI, solving problems that continue beyond the initial implementation.",
  cta: { label: "Explore Careers", href: "/careers/" },
} as const

/* ---------------------------------------------------------------------------
 * Contact
 * ------------------------------------------------------------------------- */

export const contact = {
  disciplines: ["Procurement", "Finance", "Data", "Integration"],
  heading:
    "Planning an enterprise platform program, or evaluating one of our products?",
  body: "Speak with our team about your business processes, technology landscape and operational requirements.",
  actions: [
    {
      label: "Discuss a Services Requirement",
      href: "/contact/?subject=platform-implementation",
      variant: "solid",
    },
    {
      label: "Request a Product Demonstration",
      href: "/contact/?subject=products",
      variant: "outline",
    },
  ],
} as const

/* ---------------------------------------------------------------------------
 * Footer
 * ------------------------------------------------------------------------- */

export const footer = {
  tagline: "Engineering the systems behind modern procurement and finance.",
  /** The markets, on the row above the legal rule. */
  offices: "Singapore | India | Indonesia | South Africa",
  /**
   * Social links, on the right of that row. An entry with no href is not
   * rendered, so a network can be listed before its page exists and appears
   * the moment the link is filled in.
   */
  social: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/cognivitilabs/posts/?feedView=all",
    },
    { label: "X", href: "" },
  ],
  /** The wordmark set across the foot of the page (components/site-footer.tsx). */
  wordmark: "COGNIVITI LABS",
  columns: [
    {
      label: "Services",
      links: [
        { label: "Advisory and Process Design", href: "/#services" },
        { label: "Platform Implementation", href: "/#services" },
        { label: "Integration and Data", href: "/#services" },
        { label: "Adoption and Enablement", href: "/#services" },
        { label: "Managed Services", href: "/#services" },
      ],
    },
    {
      label: "Products",
      links: [
        {
          label: "Master Data Management",
          href: "/products/master-data-management/",
        },
        { label: "CogniFlow", href: "/products/cogniflow/" },
        { label: "Cogniviti Bridge", href: "/products/cogniviti-bridge/" },
        { label: "Spend Analytics", href: "/products/spend-analytics/" },
        { label: "Adoption Copilot", href: "/products/adoption-copilot/" },
        { label: "Experience Centre", href: "/experience/" },
      ],
    },
    {
      label: "Platforms",
      links: [
        { label: "Coupa", href: "/#platforms" },
        { label: "GEP", href: "/#platforms" },
        { label: "Ivalua", href: "/#platforms" },
        { label: "OneStream", href: "/#platforms" },
      ],
    },
    {
      label: "Company",
      links: [
        { label: "Our Story", href: "/#company" },
        { label: "Client Stories", href: "/work/" },
        { label: "Resources", href: "/blog/" },
        { label: "Careers", href: "/careers/" },
        { label: "Contact", href: "/contact/" },
      ],
    },
  ],
  legal: [
    { label: "Privacy Policy", href: "/#top" },
    { label: "Terms and Conditions", href: "/#top" },
  ],
} as const
