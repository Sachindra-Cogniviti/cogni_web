// Copy for the pages that sit off the homepage: /contact, /careers,
// /products, /products/[slug], /experience, /blog and /work.
//
// Separate from content/site.ts for one reason: that file is the homepage,
// transcribed from the Claude Design project, and it is long enough already.
// These pages have no design file - they are built from the homepage's own
// vocabulary (hairline cells, oxblood rules, mono kickers, the night ground
// for the closing block) rather than a new visual language.
//
// Marketing edits happen here, not in JSX.

import { products, site } from "@/content/site"

/* ---------------------------------------------------------------------------
 * Shared
 * ------------------------------------------------------------------------- */

/**
 * The breadcrumb-and-title block every sub-page opens with. It is not a hero:
 * the homepage owns the only hero on the site, and a second one competing
 * with it would flatten the difference between the front door and a room.
 */
export type PageHeader = {
  /** Breadcrumb trail. The last entry is the current page and is not a link. */
  trail: readonly { label: string; href?: string }[]
  kicker: string
  heading: string
  body: string
}

/**
 * What a page says about itself in a search result, as against what it says
 * on the page.
 *
 * These were the same thing until they were measured: `header.body` is a
 * standfirst, written to be read under a heading that is already on screen,
 * and several of them ran past 200 characters. Google renders about 155, so
 * the tail - which is where the specifics usually are - was being cut. The
 * homepage was the worst of them, losing both "procurement" and "finance"
 * off the end of a 227-character description.
 *
 * So they are separate fields now. The standfirsts are unchanged and still
 * read as copy; these are written to the limit a result actually shows.
 *
 * `title` excludes the site name, which lib/metadata.ts appends through the
 * layout's title template. Keep it under ~45 characters so the whole thing
 * with " | Cogniviti Labs" stays under 60.
 */
export type PageSeo = {
  /** Under ~45 characters. The site name is added, so do not repeat it. */
  title: string
  /** Under ~155 characters, and complete as a sentence at that length. */
  description: string
}

/* ---------------------------------------------------------------------------
 * Contact
 *
 * Office addresses are the ones on the WordPress site. `mapId` keys each
 * office to a pin in globalPresence (content/site.ts), so the dotted map and
 * this list cannot drift apart - there is one set of coordinates on the site
 * and it is the map's.
 * ------------------------------------------------------------------------- */

export const contactPage = {
  seo: {
    title: "Contact",
    description:
      "Talk to a senior consultant about procurement and EPM delivery. Teams in Singapore, India, Indonesia, the UK and South Africa.",
  } satisfies PageSeo,
  header: {
    trail: [{ label: "Home", href: "/" }, { label: "Contact Us" }],
    kicker: "Contact Us",
    heading:
      "Turn your procurement and EPM investments into measurable results",
    body: "Structured to deliver consistently across regions, ensuring scalable and reliable execution. Tell us where you are and we'll connect you with a senior consultant.",
  } satisfies PageHeader,

  direct: {
    kicker: "Get in touch",
    heading: "Speak with a senior consultant",
    body: "About adoption, optimization and long-term value across procurement and finance.",
    channels: [
      {
        label: "Call us",
        value: "+65 6503 6189",
        href: "tel:+6565036189",
        note: "Singapore, business hours GMT+8",
      },
      {
        label: "Email us",
        value: site.email,
        href: `mailto:${site.email}`,
        note: "We reply within one business day",
      },
      {
        label: "Delivery",
        value: "Global model",
        note: "Singapore, India & Southeast Asia",
      },
    ],
  },

  /**
   * The enquiry form.
   *
   * `subjects` are the values stored on the Enquiries collection - keep them
   * in step with the select options in payload/collections/enquiries.ts, or a
   * submission will be rejected by the field's own validation.
   */
  form: {
    kicker: "Send an enquiry",
    heading: "Tell us what you are working on",
    body: "The more you can say about the platform, the region and the stage you are at, the more useful the first conversation will be.",
    fields: {
      name: { label: "Name", placeholder: "Your full name" },
      email: { label: "Company Email", placeholder: "you@company.com" },
      phone: { label: "Phone", placeholder: "+65 0000 0000" },
      company: { label: "Company", placeholder: "Your organisation" },
      subject: { label: "How can we help you?", placeholder: "Select a topic" },
      message: {
        label: "Message",
        placeholder:
          "Platform, region, timeline, and what you are trying to change.",
      },
    },
    subjects: [
      { value: "platform-implementation", label: "Platform implementation" },
      { value: "optimization", label: "Optimization of an existing platform" },
      { value: "integration", label: "Integration and data" },
      { value: "managed-services", label: "Managed services and support" },
      { value: "training", label: "Coupa training and enablement" },
      { value: "products", label: "A Cogniviti product" },
      { value: "careers", label: "Careers" },
      { value: "other", label: "Something else" },
    ],
    consent:
      "We use what you send here to answer your enquiry. We do not sell it or add you to a mailing list.",
    submit: "Submit",
    submitting: "Sending…",
    reassurance: "We'll reply within one business day.",
    success: {
      heading: "Thank you. Your enquiry is with us",
      body: "A senior consultant will reply within one business day. If it is urgent, call the Singapore line above.",
      again: "Send another enquiry",
    },
    error:
      "That didn't send. Please try again, or email us directly at the address above.",
    required: "Required",
    invalidEmail: "Enter a valid email address",
  },

  offices: {
    kicker: "Our locations",
    heading: "Where to find us",
    body: "We operate with a global delivery model, supporting clients across regions including Singapore, India and Southeast Asia. Don't see a local office near you? Our teams are equipped to support your business seamlessly, regardless of location.",
    items: [
      {
        mapId: "sg",
        city: "Singapore",
        role: "Headquarters",
        address: "81 Ayer Rajah Crescent, #01-67 LaunchPad, Singapore 139967",
      },
      {
        mapId: "in",
        city: "India",
        role: "Office",
        address:
          "Office No 807, 8th Floor, Sadanand Estate, Veerbhadra Nagar, Baner, Pune – 411045, Maharashtra, India",
      },
      {
        mapId: "id",
        city: "Indonesia",
        role: "Office",
        address:
          "World Capital Tower, Lt 17, East Kuningan, Setiabudi, South Jakarta City, Jakarta 12950, Indonesia",
      },
      {
        mapId: "za",
        city: "Africa",
        role: "Office",
        address:
          "29 Kings Gate, 552 Smuts Road, Midrand 1685, Republic of South Africa",
      },
    ],
  },

  close: {
    kicker: "Next step",
    heading: "Ready to turn strategy into measurable results?",
    body: "Book a discovery call and speak with a senior consultant about your procurement, finance or AI roadmap.",
    cta: {
      label: "Book a Call",
      href: `mailto:${site.email}?subject=Discovery%20call`,
    },
  },
} as const

/* ---------------------------------------------------------------------------
 * Careers
 *
 * The roles list is not here. Openings live in the Payload `roles` collection
 * so they can be posted and closed without a deploy; this page renders them
 * when there are any and falls back to `noRoles` when there are none, which
 * is the state it will spend most of its life in.
 * ------------------------------------------------------------------------- */

export const careersPage = {
  seo: {
    title: "Careers in Procurement, Finance & AI",
    description:
      "Open roles across platform consulting, integration and data engineering, product engineering and applied AI, in five markets.",
  } satisfies PageSeo,
  header: {
    trail: [{ label: "Home", href: "/" }, { label: "Careers" }],
    kicker: "Careers",
    heading: "Build enterprise technology that businesses depend on",
    body: "Work across product engineering, procurement, finance, integrations, data and applied AI, solving problems that continue long after the initial implementation.",
  } satisfies PageHeader,

  /**
   * What the work is actually like, stated as trade-offs rather than perks.
   * A candidate who wants the opposite of these should be able to tell from
   * this page and not apply, which is the whole job of the section.
   */
  principles: {
    kicker: "How we work",
    heading: "Small teams, long horizons, real systems",
    items: [
      {
        title: "You own the problem, not a ticket",
        body: "Consultants and engineers here carry a piece of a client's business, from the process design through to the integration that runs it at 3am. That means more context to hold and fewer hand-offs to hide behind.",
      },
      {
        title: "Enterprise constraints are the interesting part",
        body: "Audit trails, approvals, data residency and twenty years of legacy are not obstacles to the work. They are the work. If you enjoy systems that have to be right rather than merely shipped, this is the right building.",
      },
      {
        title: "Delivery across time zones, not across a wall",
        body: "Teams run between Singapore, India and Southeast Asia on one delivery model. Written clarity matters more here than presence, because the person reading you is often asleep when you write it.",
      },
      {
        title: "Products and services feed each other",
        body: "Everything we build as a product started as a problem we hit on a client program. Consultants shape the roadmap; engineers see their work used by the people who asked for it.",
      },
    ],
  },

  disciplines: {
    kicker: "Where we hire",
    heading: "Disciplines",
    body: "We recruit into four broad tracks. Most people arrive deep in one and pick up a second on the way.",
    items: [
      {
        name: "Platform consulting",
        detail:
          "Coupa, Ivalua, GEP and OneStream. Process design, configuration, testing and go-live, then the optimization work that follows.",
      },
      {
        name: "Integration and data engineering",
        detail:
          "Middleware, APIs and file-based interfaces between procurement, ERP and finance systems. Master data modelling, validation and governance.",
      },
      {
        name: "Product engineering",
        detail:
          "TypeScript, Python and cloud infrastructure behind the Cogniviti suite. Built for enterprise deployment, audit and scale.",
      },
      {
        name: "Applied AI",
        detail:
          "Agentic workflows and copilots for procurement and finance operations, with the governance and traceability enterprise buyers require.",
      },
    ],
  },

  /**
   * Shown when the roles collection is empty. It is deliberately a real
   * invitation rather than "no current openings" - most of our hires have
   * come through open applications.
   */
  noRoles: {
    kicker: "Open roles",
    heading: "No advertised openings right now",
    body: "We hire continuously against the four tracks above rather than in bursts, so a strong open application is read properly and kept on file. Tell us which track fits you and what you have shipped.",
  },

  roles: {
    kicker: "Open roles",
    heading: "Current openings",
    body: "Apply with a note about the work you have done that is closest to the role. We read every application ourselves.",
    apply: "Apply for this role",
    /** To the role's own page, /careers/[slug]. */
    detail: "Full description",
    typeLabel: "Type",
    locationLabel: "Location",
    disciplineLabel: "Track",
    /** On the role's own page: back to the list. */
    backLabel: "All open roles",
    postedLabel: "Posted",
    ownLabel: "What you will own",
    bringLabel: "What you will bring",
  },

  close: {
    kicker: "Open application",
    heading: "Nothing listed that fits?",
    body: "Send us the track you belong in and one thing you have built or fixed that you are proud of. That is more useful to us than a covering letter.",
    cta: {
      label: "Send an Open Application",
      href: "/contact/?subject=careers",
    },
  },

  /**
   * The photo strip before the footer (components/careers-life.tsx).
   *
   * Files live in public/life and are imported statically in the component,
   * keyed by `id`, the way the client logos are. Order matters: the strip
   * alternates a low landscape print with a raised portrait one, and the
   * slots are sized for that - a portrait picture in a landscape slot would
   * run out of the top of the band. Keep the order landscape, portrait,
   * landscape, portrait, landscape, portrait when swapping pictures.
   */
  life: {
    kicker: "Life at Cogniviti Labs",
    heading: "The people behind the systems",
    body: "Offices in Singapore and India, a team that spans a dozen countries, and the odd afternoon away from the terminal.",
    cta: { label: "Join us", href: "#roles" },
    photos: [
      {
        id: "go-live-team",
        alt: "The Carsome, Coupa and Cogniviti Labs teams together at the Carsome go-live celebration",
      },
      {
        id: "indonesia-event",
        alt: "The PT Cogniviti Labs Indonesia team beside the Cogniviti Labs and Coupa banners at a Coupa event",
      },
      {
        id: "go-live-cake",
        alt: "Cutting the cake at the Carsome go-live celebration",
      },
      {
        id: "inspire-stage",
        alt: "On stage at Coupa Inspire, receiving an award",
      },
      {
        id: "event-kit",
        alt: "Cogniviti Labs bottles and Coupa notebooks laid out for an event",
      },
      {
        id: "partner-award",
        alt: "The Coupa New Breakout Partner of the Year award, International, presented to Cogniviti Labs at the Coupa Partner Summit",
      },
    ],
  },
} as const

/* ---------------------------------------------------------------------------
 * Blog and client stories
 *
 * The articles and the stories themselves live in Payload; this is only the
 * furniture around them - the mastheads, the empty states, the labels and
 * the closing asks.
 * ------------------------------------------------------------------------- */

export const blogPage = {
  seo: {
    title: "Insights on Procurement & Finance Platforms",
    description:
      "Notes from implementation, integration and adoption work: what actually decides whether an enterprise platform delivers.",
  } satisfies PageSeo,
  header: {
    trail: [{ label: "Home", href: "/" }, { label: "Insights" }],
    kicker: "Insights",
    heading: "Practical insight for enterprise teams",
    body: "Notes from implementation, integration and adoption work: what actually decides whether an enterprise platform delivers, written by the people doing it.",
  } satisfies PageHeader,
  emptyCount: "Nothing published yet",
  empty: {
    heading: "The first articles are on their way",
    body: "Until then, the homepage's resources section carries the guides we point clients to most often.",
  },
  backLabel: "All insights",
  allLabel: "All insights",
  authorLabel: "Written by",
  shareLabel: "Share",
  contentsLabel: "Table of contents",
  moreHeading: "More insights",
  close: {
    kicker: "Talk to us",
    heading: "Bring us the problem behind the article",
    body: "Most of what we write starts as a question from a client program. If one of these is your question, the conversation is short.",
    cta: { label: "Talk to Our Team", href: "/contact/" },
  },
} as const

export const workPage = {
  seo: {
    title: "Client Stories",
    description:
      "Selected client programs: the platform, the problem it was brought in for, what we did, and what changed. Figures are the client's own.",
  } satisfies PageSeo,
  header: {
    trail: [{ label: "Home", href: "/" }, { label: "Client work" }],
    kicker: "Client work",
    heading: "Programs that reached production",
    body: "Selected client stories: the platform, the problem it was brought in for, what we did, and what changed. Figures are the client's own.",
  } satisfies PageHeader,
  emptyCount: "Nothing published yet",
  empty: {
    heading: "The first stories are being written up",
    body: "The homepage's client work section carries three summaries in the meantime.",
  },
  beats: {
    challenge: "The challenge",
    approach: "What we did",
    outcomes: "What changed",
  },
  facts: {
    sector: "Sector",
    platform: "Platform",
    region: "Region",
  },
  detailLabel: "In detail",
  pathLabel: "Delivery path",
  pathEnd: "Production",
  shareLabel: "Share this story",
  contentsLabel: "In this story",
  /** The rail beside the story. */
  rail: {
    stories: "More stories like this",
    updates: "Latest insights",
    allUpdates: "All insights",
  },
  ctaLabel: "Talk to us about a program like this",
  allLabel: "All client stories",
  moreHeading: "More client work",
  close: {
    kicker: "Your program",
    heading: "Planning a platform program of your own?",
    body: "Tell us the platform, the landscape it has to fit and the outcome it is for, and we will connect you with a senior consultant who has done it before.",
    cta: { label: "Talk to Our Team", href: "/contact/" },
  },
} as const

/* ---------------------------------------------------------------------------
 * Experience centre
 *
 * A live demonstration surface: pick a product, run it in a framed viewport
 * at desktop, tablet or phone width.
 *
 * `demoUrl` is null on every product until the hosted demos exist. Rather
 * than an empty iframe, a product with no URL shows a request-access panel,
 * so the page is complete and usable today and each demo goes live by setting
 * one string here. Nothing else has to change.
 *
 * Demos must be same-origin or explicitly allow framing: a third-party app
 * sending X-Frame-Options: DENY or a restrictive frame-ancestors will render
 * a blank frame with no error the page can catch.
 * ------------------------------------------------------------------------- */

export type ProductDemo = {
  slug: string
  /** Hosted demo URL, or null while the demo does not exist yet. */
  demoUrl: string | null
  /** What a visitor is looking at, shown under the frame. */
  scenario: string
}

export const experiencePage = {
  seo: {
    title: "Experience Centre",
    description:
      "Run each Cogniviti product in a live sandbox with representative data. Nothing touches your systems, and nothing you do is saved.",
  } satisfies PageSeo,
  header: {
    trail: [{ label: "Home", href: "/" }, { label: "Experience Centre" }],
    kicker: "Experience Centre",
    heading: "Run the products, don't read about them",
    body: "Each product below runs in a live sandbox loaded with representative data. Nothing here touches your systems, and nothing you do in a demo is saved.",
  } satisfies PageHeader,

  chooseLabel: "Choose a product",
  viewportLabel: "Viewport",
  viewports: [
    { id: "desktop", label: "Desktop", width: null },
    { id: "tablet", label: "Tablet", width: 834 },
    { id: "phone", label: "Phone", width: 420 },
  ],
  openLabel: "Open in a new tab",
  reloadLabel: "Restart demo",
  scenarioLabel: "What you are looking at",

  /** Shown in place of the frame for any product with no demoUrl yet. */
  pending: {
    label: "Demo not yet public",
    body: "This product is demonstrated live by the team rather than through a public sandbox. We will walk you through it against your own scenario.",
    cta: {
      label: "Request a Demonstration",
      href: "/contact/?subject=products",
    },
  },

  notes: {
    kicker: "Before you start",
    items: [
      {
        title: "Sample data, not yours",
        body: "Every sandbox runs on synthetic suppliers, invoices and projects. No connection is made to any client system.",
      },
      {
        title: "Nothing is saved",
        body: "Sandboxes reset on a schedule. Anything you create in a demo disappears, so explore freely.",
      },
      {
        title: "A guided walk-through is better",
        body: "The sandboxes show what the products do. A consultant can show what they would do with your categories, your ERP and your approval chains.",
      },
    ],
  },

  close: {
    kicker: "Next step",
    heading: "Seen something that fits?",
    body: "Book a working session and we will run the same product against your own process, data shape and integration landscape.",
    cta: { label: "Book a Working Session", href: "/contact/?subject=products" },
  },

  demos: [
    {
      slug: "master-data-management",
      demoUrl: null,
      scenario:
        "A supplier master being validated, enriched and pushed to three downstream systems.",
    },
    {
      slug: "cogniflow",
      demoUrl: null,
      scenario:
        "A delivery portfolio with committed costs, billing milestones and a thirteen-week forward cash position.",
    },
    {
      slug: "cogniviti-bridge",
      demoUrl: null,
      scenario:
        "An integration moving from design through test to production, with the deployment record it leaves behind.",
    },
    {
      slug: "spend-analytics",
      demoUrl: null,
      scenario:
        "A year of classified spend, explored through dashboards and natural-language questions.",
    },
    {
      slug: "adoption-copilot",
      demoUrl: null,
      scenario:
        "A requisition being raised with contextual guidance, and the friction it reports back to the transformation team.",
    },
    {
      slug: "agentic-operating-system",
      demoUrl: null,
      scenario:
        "Several governed agents coordinating a procurement task, with the human approval points and the audit trail.",
    },
  ] satisfies readonly ProductDemo[],
} as const

/* ---------------------------------------------------------------------------
 * Product pages
 *
 * DRAFT. Extrapolated from the one-line descriptions in content/site.ts and
 * the services copy, not supplied by the business. Every claim below needs a
 * read before launch - particularly the named integrations, the compliance
 * language, and anything that reads as a number.
 * ------------------------------------------------------------------------- */

export type ProductPage = {
  /** One sentence under the product name. Sets up everything below it. */
  lede: string
  /** The situation the product exists to fix, in the buyer's own terms. */
  problem: { heading: string; body: string; symptoms: readonly string[] }
  /** What it does, as capabilities rather than features. */
  capabilities: {
    heading: string
    items: readonly { title: string; body: string }[]
  }
  /** Where it sits in a landscape the buyer already has. */
  fit: {
    heading: string
    body: string
    rows: readonly (readonly [string, string])[]
  }
  /** Who it is for, stated plainly enough to exclude people. */
  audience: readonly string[]
}

export const productPages: Record<string, ProductPage> = {
  "master-data-management": {
    lede: "Most procurement problems are data problems wearing a process costume. This fixes them before they reach the systems that will multiply them.",
    problem: {
      heading: "Bad master data is expensive downstream, cheap upstream",
      body: "A duplicate supplier is a rounding error the day it is created and a payment-fraud exposure two years later. By the time the ERP, the P2P platform and the analytics warehouse each hold their own version of the truth, nobody can say which one is right, and every report carries an asterisk.",
      symptoms: [
        "The same supplier under four spellings, three tax IDs and two payment terms",
        "Category spend that cannot be trusted because classification is manual",
        "Onboarding that stalls because nobody owns the validation rules",
        "Analytics rebuilt each quarter because the source data moved underneath it",
      ],
    },
    capabilities: {
      heading: "What it does",
      items: [
        {
          title: "Validate at the point of entry",
          body: "Rules run when a record is created, not in a monthly clean-up. A record that cannot pass does not enter the estate.",
        },
        {
          title: "Enrich from external sources",
          body: "Registry identifiers, sanctions and tax status appended automatically, with the source and timestamp kept against the field.",
        },
        {
          title: "Govern who may change what",
          body: "Field-level ownership with an approval path, so a payment-detail change is not the same event as a phone-number change.",
        },
        {
          title: "Publish to every downstream system",
          body: "One governed record syndicated to ERP, P2P and analytics, so the systems stop keeping private copies.",
        },
      ],
    },
    fit: {
      heading: "Where it sits",
      body: "Upstream of everything. It does not replace your ERP's vendor master. It decides what is allowed to become one.",
      rows: [
        ["Sits upstream of", "ERP · P2P · Analytics"],
        ["Typical first domain", "Supplier master"],
        ["Also modelled", "Material, cost centre, chart of accounts"],
        [
          "Integration shape",
          "API and file, event-driven where the target supports it",
        ],
      ],
    },
    audience: [
      "Procurement operations teams carrying a supplier onboarding backlog",
      "Finance teams whose spend reporting needs an asterisk",
      "Programs about to migrate onto a new procurement platform",
    ],
  },

  cogniflow: {
    lede: "Project cash is usually discovered late, in a spreadsheet, by the person least able to act on it. This puts it in front of the people who can.",
    problem: {
      heading: "Project margin erodes quietly and is reported slowly",
      body: "Committed cost sits in one system, billing milestones in another and collections in a third. The forward position is reconstructed by hand each month, which means it is always a description of what already happened rather than a warning about what is about to.",
      symptoms: [
        "Cash position known monthly, decisions needed weekly",
        "Committed costs invisible until the invoice lands",
        "Billing milestones missed because nobody owned the trigger",
        "Collections chased by whoever remembered",
      ],
    },
    capabilities: {
      heading: "What it does",
      items: [
        {
          title: "One forward position",
          body: "Inflows, outflows, commitments and collections resolved into a single rolling view, refreshed as the source systems move.",
        },
        {
          title: "Commitments tracked from raising",
          body: "A purchase order becomes a cash event the moment it is committed, not the moment it is invoiced.",
        },
        {
          title: "Billing milestones with owners",
          body: "Each milestone carries a date, a trigger and a named person, so a slipped bill is visible before the period closes.",
        },
        {
          title: "Collections in the same frame",
          body: "Outstanding invoices sit against the forward position they affect, rather than in a separate ageing report.",
        },
      ],
    },
    fit: {
      heading: "Where it sits",
      body: "Alongside your ERP and project systems. It reads them; it does not ask you to run your projects inside it.",
      rows: [
        ["Reads from", "ERP · Project systems · P2P"],
        ["Horizon", "Thirteen weeks, configurable"],
        ["Granularity", "Project, portfolio, entity"],
        ["Refresh", "Scheduled, or on source events"],
      ],
    },
    audience: [
      "Delivery organisations running project-based revenue",
      "Finance teams rebuilding a cash forecast by hand each month",
      "CFOs who learn about margin erosion a quarter late",
    ],
  },

  "cogniviti-bridge": {
    lede: "Integrations are usually built once and then maintained by archaeology. This gives them a lifecycle, a record and an owner.",
    problem: {
      heading: "Nobody can say what your integrations currently do",
      body: "The mapping lives in a developer's head, the deployment history lives in an email thread, and the only monitoring is a user reporting that something is missing. Changing anything means finding the one person who remembers why it was built that way.",
      symptoms: [
        "Interfaces documented in a spreadsheet last updated at go-live",
        "No reliable record of what changed, when, or by whom",
        "Failures discovered by the business rather than the platform",
        "Environment drift between test and production",
      ],
    },
    capabilities: {
      heading: "What it does",
      items: [
        {
          title: "Design mappings as artefacts",
          body: "Field mappings and transformations are versioned objects, reviewable and diffable, rather than code comments.",
        },
        {
          title: "Promote through environments",
          body: "The same definition moves DEV → TEST → PROD under an approval, so environments cannot quietly diverge.",
        },
        {
          title: "Monitor flows, not servers",
          body: "Health is reported per business flow, so an alert says which interface is failing and what it carries.",
        },
        {
          title: "Keep the record automatically",
          body: "Every deployment, mapping change and approval is written down as it happens, because documentation written afterwards never is.",
        },
      ],
    },
    fit: {
      heading: "Where it sits",
      body: "Between the platforms, as a governed lifecycle around the integrations you already need to run.",
      rows: [
        [
          "Connects",
          "Coupa · Ivalua · GEP · OneStream · SAP · Oracle · NetSuite",
        ],
        ["Environments", "DEV → TEST → PROD, approval-gated"],
        ["Interfaces", "API, file, event"],
        ["Audit", "Full change and deployment history"],
      ],
    },
    audience: [
      "Teams inheriting integrations they did not build",
      "Programs with more than a handful of live interfaces",
      "Anyone facing an audit question about interface change control",
    ],
  },

  "spend-analytics": {
    lede: "Spend analysis usually answers the question you asked last quarter. This answers the one you have now.",
    problem: {
      heading: "The analysis is finished by the time it is relevant",
      body: "Classification is manual, so the taxonomy lags. The dashboard answers a fixed set of questions, so anything new is a request to a reporting team. By the time the answer arrives, the negotiation is over.",
      symptoms: [
        "Category coverage good enough for a board slide, not for a negotiation",
        "Exceptions found in review rather than as they happen",
        "Every new question is a ticket",
        "Two teams quoting different numbers for the same category",
      ],
    },
    capabilities: {
      heading: "What it does",
      items: [
        {
          title: "Classify continuously",
          body: "Spend is classified as it lands, with the confidence level visible, so the taxonomy does not decay between refreshes.",
        },
        {
          title: "Surface exceptions, not just totals",
          body: "Maverick spend, price variance and duplicate payments are raised as events rather than waiting to be noticed in a chart.",
        },
        {
          title: "Ask in plain language",
          body: "Natural-language questions over the same governed model the dashboards use, so an ad-hoc answer and the official one agree.",
        },
        {
          title: "Pre-built where it should be",
          body: "The standard procurement views ship ready, so the first month is spent on findings rather than on building charts.",
        },
      ],
    },
    fit: {
      heading: "Where it sits",
      body: "On top of your transactional data, and on top of governed master data if you have it, because the classification is only as good as the supplier record underneath.",
      rows: [
        ["Reads from", "ERP · P2P · Contract systems"],
        ["Pairs with", "Master Data Management"],
        ["Delivery", "Dashboards, exception alerts, natural-language query"],
        ["Refresh", "Scheduled or event-driven"],
      ],
    },
    audience: [
      "Category managers preparing for negotiation",
      "Procurement leaders reporting savings they have to defend",
      "Finance teams reconciling spend across entities",
    ],
  },

  "adoption-copilot": {
    lede: "A platform nobody uses correctly is an expensive way to keep doing the old process. This makes adoption something you can see and act on.",
    problem: {
      heading: "Adoption is asserted at go-live and never measured again",
      body: "Training happens once, to people who are not yet doing the task. Afterwards, the questions go to a colleague rather than a system, so the transformation team never learns where the process is actually failing.",
      symptoms: [
        "Support tickets that are really training gaps",
        "Workarounds that spread faster than the process did",
        "No evidence for which parts of the journey cause the drop-off",
        "Training material that ages out within a release",
      ],
    },
    capabilities: {
      heading: "What it does",
      items: [
        {
          title: "Guidance in the task, not in a PDF",
          body: "Contextual help sits inside the platform at the step where people hesitate, in the words the organisation actually uses.",
        },
        {
          title: "Capture the questions",
          body: "What people ask, where, and how often, becomes a dataset the transformation team can act on.",
        },
        {
          title: "Locate the friction",
          body: "Drop-off points in a journey are reported as journeys, not as page views, so a fix can be targeted at a step.",
        },
        {
          title: "Measure adoption over time",
          body: "Adoption is reported as a trend per process and per group, rather than as a single number at go-live.",
        },
      ],
    },
    fit: {
      heading: "Where it sits",
      body: "Over the platform your users already work in, without changing its configuration.",
      rows: [
        ["Overlays", "Coupa · Ivalua · GEP · OneStream"],
        ["Deployment", "No change to the host platform's configuration"],
        ["Reporting", "Per process, per user group"],
        ["Typical use", "Post-go-live, and through each release"],
      ],
    },
    audience: [
      "Transformation teams three months past go-live",
      "Process owners defending a platform business case",
      "Organisations rolling one platform across several regions",
    ],
  },

  "agentic-operating-system": {
    lede: "Enterprise AI agents are easy to demonstrate and hard to trust. AOS is the governance layer that makes them deployable.",
    problem: {
      heading: "The gap is not capability, it is accountability",
      body: "An agent that can raise a requisition is a demo. An agent that raises a requisition inside an organisation that must explain, audit and reverse it is a system, and that is the part that is missing from almost every agent stack on the market.",
      symptoms: [
        "Agents that cannot show why they did what they did",
        "No approval point between an agent's decision and its effect",
        "No record an auditor would accept",
        "Pilots that cannot leave the pilot because nobody will sign them off",
      ],
    },
    capabilities: {
      heading: "What it does",
      items: [
        {
          title: "Coordinate agents deliberately",
          body: "Agents are given scopes and hand-offs rather than a shared free rein, so responsibility for a task is always locatable.",
        },
        {
          title: "Put humans at the right points",
          body: "Approval gates sit where the organisation's own delegation rules say they should, not wherever the model happens to pause.",
        },
        {
          title: "Record the reasoning, not just the result",
          body: "Each action carries its inputs, its justification and its approvals, in a form that survives an audit.",
        },
        {
          title: "Constrain by policy",
          body: "What an agent may touch is governed centrally, so extending the fleet does not mean re-auditing everything.",
        },
      ],
    },
    fit: {
      heading: "Where it sits",
      body: "Across your operational systems, as the layer agents act through rather than around.",
      rows: [
        ["Status", "In development"],
        ["Acts across", "Procurement and finance operations"],
        ["Controls", "Scope, approval gates, policy, audit"],
        ["Foundation", "Shares the suite's data and integration layer"],
      ],
    },
    audience: [
      "Organisations whose agent pilots cannot get past risk review",
      "Procurement operations exploring automation beyond RPA",
      "Anyone who has to sign off on what an agent is allowed to do",
    ],
  },
}

/* ---------------------------------------------------------------------------
 * Products index
 * ------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
 * 404
 * ------------------------------------------------------------------------- */

/**
 * The page for a URL that does not exist.
 *
 * There was none, so a bad link - and every `notFound()` from the three
 * [slug] routes - rendered Next's bare default: correct status code, no nav,
 * no footer, nothing to click. The status was never the problem; the dead
 * end was. This is the same shell as every other page, with the four places
 * worth sending someone who mistyped or followed a link that has moved.
 */
export const notFoundPage = {
  header: {
    trail: [{ label: "Home", href: "/" }, { label: "Not found" }],
    kicker: "404",
    heading: "That page is not here",
    body: "The link may be out of date, or the address may have a typo in it. Everything below is one step away.",
  } satisfies PageHeader,
  seo: {
    title: "Page not found",
    description:
      "That page could not be found. Products, client stories, insights and contact are all one step away.",
  } satisfies PageSeo,
  linksLabel: "Try one of these",
  links: [
    {
      label: "Products",
      href: "/products/",
      detail: "Six systems for procurement, finance and data.",
    },
    {
      label: "Client stories",
      href: "/work/",
      detail: "Programs that reached production, with the client's figures.",
    },
    {
      label: "Insights",
      href: "/blog/",
      detail: "Notes from implementation, integration and adoption work.",
    },
    {
      label: "Careers",
      href: "/careers/",
      detail: "Open roles across five markets.",
    },
  ],
  close: {
    kicker: "Still stuck",
    heading: "Tell us what you were looking for",
    body: "If you followed a link from somewhere on this site, we would like to know which one, so it can be fixed.",
    cta: { label: "Talk to Our Team", href: "/contact/" },
  },
} as const

export const productsPage = {
  seo: {
    title: "Procurement & EPM Products",
    description:
      "Six products for master data, integrations, spend analytics, project cash flow, platform adoption and agentic operations.",
  } satisfies PageSeo,
  header: {
    trail: [{ label: "Home", href: "/" }, { label: "Products" }],
    kicker: "Products",
    heading: "Six systems on one foundation",
    body: "Every product below started as a problem we hit on a client program. They share a data layer, an integration layer and a governance model, so they work together rather than merely alongside each other.",
  } satisfies PageHeader,
  count: products.length,
  close: {
    kicker: "Next step",
    heading: "Run them before you talk to us",
    body: "The Experience Centre puts each product in front of you with representative data, so the first conversation can be about your landscape rather than about what the software does.",
    cta: { label: "Open the Experience Centre", href: "/experience/" },
  },
} as const

/* ---------------------------------------------------------------------------
 * FAQ
 *
 * Buyer questions, written for the search they are actually typed into:
 * "procurement platform implementation partner APAC" and its variants. Each
 * answer is rendered in full on the page - FAQPage structured data that
 * describes an answer a reader cannot see is precisely what Google's spam
 * guidance is aimed at, so lib/schema.ts builds the JSON-LD from this same
 * array rather than from a second copy.
 *
 * A page of its own rather than a section of the homepage. Everything off
 * the homepage is assembled by PageShell, which needs no design decision,
 * whereas a twelfth homepage section would change the narrative order and
 * the section rail that CLAUDE.md describes as deliberate. It can be moved
 * or repeated on /contact/ later without touching the copy.
 *
 * THREE CHANGES were made to the copy as supplied, all flagged rather than
 * silent, and all trivially reversible:
 *
 * 1. "CogniPurge" was named twice as the data-quality product. No such
 *    product exists anywhere on this site - the data-quality product is
 *    Master Data Management, at /products/master-data-management/ - so a
 *    reader would have hit a name with nothing behind it. The answers name
 *    Master Data Management and link to it. If CogniPurge is a real product,
 *    or a rename of MDM, this needs changing back AND a product page.
 * 2. The third question asked about APAC timezone-aligned delivery and
 *    multi-country rollout, and the answer supplied for it was a list of
 *    what buyers should assess when evaluating any partner - a different
 *    subject. The list is kept, under a question it answers; the timezone
 *    question is answered separately, from the markets and offsets already
 *    in globalPresence, so nothing is claimed that the site does not say.
 * 3. "avIntegration capability" was a typo for "Integration capability".
 * ------------------------------------------------------------------------- */

export const faqPage = {
  seo: {
    title: "Procurement Partner FAQ",
    description:
      "Common questions about working with Cogniviti Labs on Coupa, Ivalua and GEP delivery across APAC: scope, lifecycle support and regional coverage.",
  } satisfies PageSeo,
  header: {
    trail: [{ label: "Home", href: "/" }, { label: "FAQ" }],
    kicker: "FAQ",
    heading: "Questions buyers ask before they engage us",
    body: "What we cover, how long we stay, and where we deliver from. If your question is not here, it is a short conversation.",
  } satisfies PageHeader,

  items: [
    {
      question:
        "Are you a fit for organizations looking for a trusted procurement platform implementation partner in APAC?",
      answer: [
        "Cogniviti Labs is a strong fit for organizations seeking a procurement transformation partner in APAC that can support implementation, integration, rollout, data readiness, hypercare, and optimization across Coupa, Ivalua, and GEP — with procurement data quality support through Master Data Management.",
        "Buyers typically engage us when they want a partner that can address platform delivery and data quality together.",
      ],
    },
    {
      question:
        "Do you support both implementation and ongoing support, or only project-based delivery?",
      answer: ["We support both:"],
      list: [
        "Project-based implementation and rollout engagements",
        "Post-go-live hypercare and stabilization",
        "Optimization and enhancement initiatives",
        "Ongoing support and AMS-style services, depending on scope and engagement model",
      ],
      after: [
        "This allows clients to continue with one partner through multiple lifecycle phases.",
      ],
    },
    {
      question:
        "What should you look for in a Coupa, Ivalua or GEP implementation partner?",
      answer: [
        "When evaluating a Coupa, Ivalua, or GEP implementation partner, buyers should assess:",
      ],
      list: [
        "Procurement process expertise, not only technical configuration",
        "Integration capability across SAP, Oracle, NetSuite, Dynamics and custom APIs",
        "Data migration readiness and master data quality support",
        "Change management and supplier enablement support",
        "Hypercare, AMS, and post-go-live optimization capability",
        "Governance, controls, and auditability",
        "Regional delivery capability, including APAC, Singapore, India and multi-country rollout support",
      ],
      after: [
        "Cogniviti Labs combines platform implementation support with Master Data Management, which strengthens data quality readiness and reduces downstream adoption and reporting issues.",
      ],
    },
    {
      question:
        "Do you support APAC timezone-aligned delivery and multi-country rollout coordination?",
      answer: [
        "Yes. Teams operate from Singapore (GMT+8), India (GMT+5:30), Indonesia (GMT+7) and South Africa (GMT+2), with partner-supported delivery into Thailand and other markets.",
        "That spread is what makes a multi-country rollout coordinable from inside the working day rather than across it: a programme running in Southeast Asia and one running in Europe are both covered by a team already awake, under one delivery model and one set of programme governance.",
      ],
    },
  ],

  close: {
    kicker: "Next step",
    heading: "Ask us the question that is not on this page",
    body: "Most evaluations come down to one specific thing — a platform, an integration, a data set or a timeline. Tell us which, and we will put the person who has done it on the call.",
    cta: { label: "Talk to Our Team", href: "/contact/" },
  },
} as const
