import type { Update } from "../../content/site"

export const initialUpdates: readonly Update[] = [
  /* ---------------------------------------------------------------
   * Every item here is CONFIRMED: each is a post on the company's own
   * LinkedIn page, with the photograph from that post. The block used
   * to carry four items derived from things the site already says -
   * AOS being in development, the Experience Centre, the Coupa
   * training partnership, the five markets - and those are gone. A
   * news feed is read as a record of things that happened, so an item
   * that was inferred rather than announced does not belong in one,
   * and two of the four had drifted into saying something the site
   * could not support: the Experience Centre was announced as live
   * while every demoUrl was still null, and "Official Coupa Training
   * Partner" is an accreditation nobody had confirmed.
   *
   * `date` is display text and never parsed, so each is anchored to
   * something factual from the post - the event, the go-live, the city
   * - rather than to a month. LinkedIn shows relative timestamps only,
   * and turning "4 months ago" into a month is a guess that would then
   * read as a matter of record. The exact dates are in the filenames
   * of the originals in public/life, which are LinkedIn's own epoch
   * timestamps: the Jakarta session 28 January 2026, the award 12 May
   * 2026, the Carsome go-live 10 June 2026.
   *
   * The photographs are 16:10 crops of those originals, in
   * public/updates. public/life keeps the uncropped versions because
   * components/careers-life.tsx draws them at a different shape. Two
   * of the three are 800x500, under the 1120x700 this block asks for,
   * because the originals are only 800px wide - sharp at 1x and soft
   * on a 2x screen. If higher-resolution files exist from whoever took
   * them, replacing those two is a straight swap.
   * ------------------------------------------------------------- */
  {
    kind: "Award",
    date: "Coupa Inspire 2026",
    title: "Coupa New Breakout Partner of the Year, International",
    body: "Chosen from a global field of partners for implementation discipline and the technical glue around it - integrations, data readiness and applied AI.",
    image: {
      src: "/updates/coupa-breakout-partner-award.jpg",
      alt: "Cogniviti Labs and Coupa teams with the Breakout Partner award at Inspire 2026",
    },
    cta: { label: "Our Coupa practice", href: "/#platforms" },
  },
  {
    kind: "Client",
    date: "Live on Coupa",
    title: "Carsome is live on Coupa",
    body: "Delivered as implementation partner alongside the Carsome and Coupa teams, streamlining Source-to-Pay and setting the foundation for what follows.",
    image: {
      src: "/updates/carsome-coupa-go-live.jpg",
      alt: "The Carsome, Coupa and Cogniviti Labs teams at the go-live celebration, in front of a screen carrying the three logos.",
    },
    cta: { label: "Client work", href: "/work/" },
  },
  {
    kind: "Event",
    date: "Jakarta, 2026",
    title: "AI in spend management, with Coupa in Jakarta",
    body: "A session with finance and procurement leaders on why close to 95% of AI proofs of concept fail - not on the model, but on the data and the operating model underneath it.",
    image: {
      src: "/updates/jakarta-coupa-ai-session.jpg",
      alt: "The Cogniviti Labs and Coupa teams in Jakarta, between a Cogniviti Labs banner and a Coupa total spend management banner.",
    },
    cta: {
      label: "Data readiness",
      href: "/products/master-data-management/",
    },
  },
]

