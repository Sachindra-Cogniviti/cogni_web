import { readFile } from "node:fs/promises"
import { randomBytes } from "node:crypto"
import path from "node:path"

import { getPayload } from "payload"

import config from "@/payload.config"

/**
 * Demo content for testing the blog and the client stories - three of each,
 * with the author, categories and photographs they hang off. Fictional
 * throughout: the client companies do not exist and the figures are
 * invented. It is here so the pages can be reviewed with something on them
 * before real copy exists, and so it can be taken out again cleanly.
 *
 * The bodies are deliberately long and use every node the editor can
 * produce - every inline format, headings at three levels, links of both
 * kinds, lists of every kind including nested and checklists, quotes,
 * rules, tables, inline images with captions, related-document cards and
 * code blocks - so that the article renderer (components/rich-text.tsx),
 * the table of contents and the share cards can all be seen working on
 * one page.
 *
 *   npm run seed:demo            create (skips anything already present)
 *   npm run seed:demo:remove     delete exactly what this file created
 *
 * Runs through Payload's local API with the same config the app uses, so
 * everything goes through the collections' own hooks and validation. Run
 * with tsx and the env file rather than `payload run`, which loads the
 * module but does not execute it.
 */

const AUTHOR = {
  name: "Cogniviti Labs Editorial",
  role: "Consulting and engineering team",
  bio: "Notes from the people who implement, integrate and support enterprise procurement and finance platforms for a living.",
}

const CATEGORIES = [
  { title: "Data and integration", slug: "data-and-integration" },
  { title: "Adoption", slug: "adoption" },
  { title: "Platform delivery", slug: "platform-delivery" },
]

/**
 * The photographs, from public/life. Uploaded under a `demo-life-` filename
 * so removal can find exactly these and nothing an editor uploaded.
 */
const PHOTOS = [
  { key: "desk", file: "1769611089031.jpg", alt: "Cogniviti Labs consultants working through a design session" },
  { key: "review", file: "1769611089114.jpg", alt: "A review of a process design on screen" },
  { key: "team", file: "1778560983877.jpg", alt: "Members of the Cogniviti Labs team together" },
  { key: "pair", file: "1778560983893.jpg", alt: "Two consultants pairing on an integration" },
  { key: "office", file: "1781084481055.jpg", alt: "The Cogniviti Labs office" },
  { key: "talk", file: "1781084481689.jpg", alt: "A team conversation in the office" },
] as const

type PhotoKey = (typeof PHOTOS)[number]["key"]
const DEMO_FILE_PREFIX = "demo-life-"

/* ---------------------------------------------------------------------------
 * Lexical helpers: the editor's JSON, built by hand.
 * ------------------------------------------------------------------------- */

const BOLD = 1
const ITALIC = 2
const STRIKE = 4
const UNDERLINE = 8
const CODE = 16
const SUB = 32
const SUP = 64

type Node = Record<string, unknown>
type Inline = string | Node

const text = (t: string, format = 0): Node => ({
  type: "text",
  text: t,
  format,
  detail: 0,
  mode: "normal",
  style: "",
  version: 1,
})
const b = (t: string) => text(t, BOLD)
const i = (t: string) => text(t, ITALIC)
const s = (t: string) => text(t, STRIKE)
const u = (t: string) => text(t, UNDERLINE)
const mono = (t: string) => text(t, CODE)
const sub = (t: string) => text(t, SUB)
const sup = (t: string) => text(t, SUP)
const br = (): Node => ({ type: "linebreak", version: 1 })

const inline = (parts: Inline[]) =>
  parts.map((part) => (typeof part === "string" ? text(part) : part))

const block = (type: string, children: Node[], extra: Node = {}): Node => ({
  type,
  children,
  direction: "ltr",
  format: "",
  indent: 0,
  version: 1,
  ...extra,
})

const para = (...parts: Inline[]) =>
  block("paragraph", inline(parts), { textFormat: 0, textStyle: "" })
const p = para
const centred = (...parts: Inline[]) =>
  block("paragraph", inline(parts), {
    format: "center",
    textFormat: 0,
    textStyle: "",
  })
const indented = (...parts: Inline[]) =>
  block("paragraph", inline(parts), { indent: 1, textFormat: 0, textStyle: "" })
const h2 = (t: string) => block("heading", [text(t)], { tag: "h2" })
const h3 = (t: string) => block("heading", [text(t)], { tag: "h3" })
const h4 = (t: string) => block("heading", [text(t)], { tag: "h4" })
const quote = (...parts: Inline[]) => block("quote", inline(parts))
const hr = (): Node => ({ type: "horizontalrule", version: 1 })

const link = (t: string, url: string): Node =>
  block("link", [text(t)], {
    version: 3,
    fields: { url, newTab: true, linkType: "custom" },
  })
const docLink = (
  t: string,
  relationTo: "posts" | "client-stories",
  id: number
): Node =>
  block("link", [text(t)], {
    version: 3,
    fields: { linkType: "internal", newTab: false, doc: { relationTo, value: id } },
  })

/** A list item: inline parts, optionally with a nested list under them. */
type Entry = { parts: Inline[]; nested?: Node }
type Item = Inline | Inline[] | Entry
const isEntry = (entry: Item): entry is Entry =>
  typeof entry === "object" && !Array.isArray(entry) && "parts" in entry
const normalise = (entry: Item): Entry => {
  if (isEntry(entry)) return entry
  return { parts: Array.isArray(entry) ? entry : [entry] }
}
const list = (listType: "bullet" | "number", entries: Item[]) => {
  const children: Node[] = []
  let value = 1
  for (const raw of entries) {
    const entry = normalise(raw)
    children.push(block("listitem", inline(entry.parts), { value }))
    if (entry.nested) {
      // Lexical nests a list as a list item of its own whose only child is
      // the inner list, after the item that introduces it.
      value += 1
      children.push(block("listitem", [entry.nested], { value }))
    }
    value += 1
  }
  return block("list", children, {
    listType,
    tag: listType === "number" ? "ol" : "ul",
    start: 1,
  })
}
const ul = (entries: Item[]) => list("bullet", entries)
const ol = (entries: Item[]) => list("number", entries)
const checklist = (entries: { done: boolean; parts: Inline[] }[]) =>
  block(
    "list",
    entries.map((entry, index) =>
      block("listitem", inline(entry.parts), {
        value: index + 1,
        checked: entry.done,
      })
    ),
    { listType: "check", tag: "ul", start: 1 }
  )

const cell = (parts: Inline[], header = false) =>
  block("tablecell", [para(...parts)], {
    headerState: header ? 1 : 0,
    colSpan: 1,
    rowSpan: 1,
    backgroundColor: null,
  })
const table = (headers: string[], rows: Inline[][][]) =>
  block("table", [
    block(
      "tablerow",
      headers.map((h) => cell([h], true))
    ),
    ...rows.map((row) =>
      block(
        "tablerow",
        row.map((parts) => cell(parts))
      )
    ),
  ])

const image = (id: number, caption: string): Node => ({
  type: "upload",
  relationTo: "media",
  value: id,
  fields: { caption },
  format: "",
  version: 3,
})
const related = (relationTo: "posts" | "client-stories", id: number): Node => ({
  type: "relationship",
  relationTo,
  value: id,
  format: "",
  version: 2,
})
const code = (language: string, source: string): Node => ({
  type: "block",
  format: "",
  version: 2,
  fields: {
    id: randomBytes(12).toString("hex"),
    blockName: "",
    blockType: "code",
    language,
    code: source,
  },
})

const doc = (...children: Node[]) => ({
  root: {
    type: "root",
    children,
    direction: "ltr",
    format: "",
    indent: 0,
    version: 1,
  },
})

const DEMO_NOTE = centred(
  i("This is a demo article, written to test the blog's layout and every kind of content the editor can produce. It will be replaced.")
)

/* ---------------------------------------------------------------------------
 * The content. Bodies are functions of the ids created before them, so a
 * post can point at a story and an image.
 * ------------------------------------------------------------------------- */

type Ids = {
  media: Record<PhotoKey, number>
  stories: Record<string, number>
  posts: Record<string, number>
}

const STORIES = [
  {
    client: "Northline Logistics",
    slug: "northline-logistics",
    title:
      "One procure-to-pay process across six countries, live in nine months",
    excerpt:
      "A regional shipping and logistics group replaced six local purchasing practices with one Coupa process integrated to SAP, without stopping a single port operation.",
    platform: ["coupa", "sap"],
    region: ["singapore", "indonesia", "thailand"],
    sector: "Shipping and logistics",
    stages: [
      "Process design",
      "Supplier master rebuild",
      "SAP integration",
      "Country rollouts",
    ],
    publishedAt: "2026-09-05T09:00:00.000Z",
    challenge:
      "Six operating companies bought the same fuel, parts and services from overlapping suppliers on six different processes, with no consolidated view of spend and a month-end reconciliation that took eleven days.",
    approach:
      "One global design with country-level variants only where regulation demanded them, a supplier master rebuilt and deduplicated before migration, and the SAP interfaces built and load-tested against a full quarter of real transactions before the first country went live.",
    outcomes: [
      { text: "All six countries on one process, with local tax and approval variants held in configuration rather than in separate designs." },
      { text: "Supplier master reduced from 14,200 records to 6,900 active suppliers, with duplicates merged before migration." },
      { text: "Month-end reconciliation from eleven days to two, with discrepancies surfacing in the process rather than at close." },
    ],
    metrics: [
      { value: "6", label: "countries live on one process" },
      { value: "38%", label: "faster invoice cycle" },
      { value: "92%", label: "of spend under purchase order" },
      { value: "9 mo", label: "from design to final go-live" },
    ],
    body: (ids: Ids) =>
      doc(
        h2("The landscape we walked into"),
        p(
          "Northline runs port services, trucking and warehousing in six countries, each acquired at a different time and each still buying the way it did before it was acquired. The group's finance team could produce a spend figure for any one company in a day. For the group it took a fortnight, and the answer changed depending on who compiled it."
        ),
        table(
          ["Country", "Purchasing before", "Active suppliers", "Share of group spend"],
          [
            [["Singapore"], ["SAP purchase requisitions, paper approvals"], ["3,100"], ["31%"]],
            [["Indonesia"], ["Email and a spreadsheet register"], ["4,700"], ["27%"]],
            [["Thailand"], ["Local ERP module, no approvals"], ["2,900"], ["18%"]],
            [["Malaysia"], ["Email"], ["1,600"], ["11%"]],
            [["Vietnam"], ["Email and a spreadsheet register"], ["1,200"], ["8%"]],
            [["Philippines"], ["Paper"], ["700"], ["5%"]],
          ]
        ),
        p(
          "The numbers in the third column are the ones that decided the program. Fourteen thousand supplier records for a group whose real supply base was a little over six thousand meant that every report, every contract and every payment run was working from a picture that was more than half wrong."
        ),
        h2("Rebuilding the supplier master"),
        p(
          "Migration was not allowed to start until the supplier master was fit to migrate. That decision cost three months at the front of the program and saved more than that at the back."
        ),
        ul([
          [b("Deduplicated by evidence, not by name. "), "Tax registration, bank account and address were matched before the name was, because the name was the field most often wrong."],
          [b("Classified before loading. "), "Every surviving supplier carried a category, a payment term and an owning company, so the platform's rules had something to act on from the first requisition."],
          {
            parts: [b("Governed after loading. "), "A new supplier is created once, in Coupa, and flows to SAP - never the other way round. Three roles own that flow:"],
            nested: ul([
              "The requester, who asks for the supplier and supplies the documents.",
              "Procurement, who checks the category and the contract position.",
              "Finance, who approves the bank details and releases the record.",
            ]),
          },
        ]),
        image(ids.media.review, "The consolidated supplier master under review before the first migration load."),
        h2("The SAP interfaces"),
        p(
          "Five flows carry the process between Coupa and SAP. Each was built with its reconciliation report before its happy path, so a discrepancy surfaces where someone can act on it rather than at period close."
        ),
        ol([
          "Requisition to purchase requisition, carrying the cost assignment SAP will accept.",
          "Purchase order out, with change orders that survive a partial amendment.",
          "Goods receipt back, so three-way match has something to match against.",
          "Invoice in, with tolerances and the exception queue agreed before the first one arrived.",
          "Payment status back, so a supplier sees the same truth as the buyer.",
        ]),
        p(
          "A purchase order leaves Coupa in the shape below and is acknowledged by SAP with its own document number, which is written back so that both systems can name the same order."
        ),
        code(
          "json",
          `{
  "order": "PO-SG-004821",
  "company": "NL-SG",
  "supplier": { "id": "S-006114", "sapVendor": "0000114233" },
  "lines": [
    { "line": 1, "item": "Marine gas oil", "qty": 1200, "uom": "L", "costCentre": "SG-PORT-01" }
  ],
  "acknowledged": { "sapDocument": "4500091277", "at": "2026-03-02T08:14:00+08:00" }
}`
        ),
        h2("Rollout sequence"),
        p(
          "Singapore first, because it had the cleanest data and the most demanding finance team, which meant that anything wrong would be found there. The remaining five followed at six-week intervals."
        ),
        checklist([
          { done: true, parts: ["Singapore - go-live, first full month-end closed on the platform"] },
          { done: true, parts: ["Indonesia and Thailand - together, sharing a regional support desk"] },
          { done: true, parts: ["Malaysia and Vietnam"] },
          { done: true, parts: ["Philippines - last, with the paper process retired the same week"] },
          { done: false, parts: ["Supplier portal for the long tail - planned for the next phase"] },
        ]),
        quote(
          "We stopped arguing about whose number was right. There is one number now, and it is in the platform."
        ),
        p(
          i("Group finance director"),
          br(),
          i("Northline Logistics (fictional)")
        ),
        DEMO_NOTE
      ),
  },
  {
    client: "Harbour & Vale Property",
    slug: "harbour-and-vale-property",
    title:
      "Sourcing and contracts brought under one roof for a property developer",
    excerpt:
      "A developer and asset manager moved its sourcing, contract management and supplier onboarding onto Ivalua, integrated to Oracle, and cut the time from tender to signed contract by half.",
    platform: ["ivalua", "oracle"],
    region: ["singapore", "india"],
    sector: "Property",
    stages: [
      "Sourcing design",
      "Contract capture",
      "Oracle integration",
      "Supplier onboarding",
    ],
    publishedAt: "2026-08-12T09:00:00.000Z",
    challenge:
      "Tenders ran in email and spreadsheets, contracts lived in a shared drive, and the finance team learned about a new supplier when the first invoice arrived. Nobody could say how many active contracts the group held.",
    approach:
      "Sourcing events, contract authoring and supplier onboarding configured as one connected flow, with Oracle as the system of record for suppliers and commitments. Legacy contracts were captured with their key dates so the platform could start managing renewals from day one.",
    outcomes: [
      { text: "Every active contract in one repository with owners, values and renewal dates, for the first time." },
      { text: "Supplier onboarding moved ahead of the first purchase, with finance approving before commitment rather than after." },
      { text: "Renewal notices issued automatically ninety days out, ending the auto-renewals that had been costing the group." },
    ],
    metrics: [
      { value: "51%", label: "shorter tender-to-contract cycle" },
      { value: "1,340", label: "contracts captured with renewal dates" },
      { value: "0", label: "surprise auto-renewals in the first year" },
    ],
    body: (ids: Ids) =>
      doc(
        h2("Where the contracts were"),
        p(
          "The first week of the program was spent finding out how many contracts the group held. The honest answer was that nobody knew, and the reason was structural: a contract was signed by whichever director ran the tender, filed by their assistant, and never seen again unless something went wrong."
        ),
        table(
          ["Where", "Contracts found", "With a renewal date", "Owner still employed"],
          [
            [["Shared drive, by project"], ["612"], ["190"], ["71%"]],
            [["Email attachments"], ["388"], ["44"], ["58%"]],
            [["Physical files, two offices"], ["267"], ["12"], ["-"]],
            [["Oracle, as a commitment only"], ["73"], ["73"], ["100%"]],
          ]
        ),
        p(
          "Capturing them was slow, unglamorous and the most valuable thing the program did: the platform can only manage a renewal it knows about."
        ),
        h2("One flow, three stages"),
        ul([
          [b("Sourcing. "), "Every tender above a threshold runs as an event, with the evaluation scored in the platform rather than in a spreadsheet emailed between three people."],
          [b("Contract. "), "The winning bid becomes the contract draft. Key dates, values and obligations are fields, not paragraphs, so the platform can act on them."],
          [b("Onboarding. "), "A supplier is onboarded - documents, bank details, finance approval - before the award is issued, and reaches Oracle as a vendor before its first invoice does."],
        ]),
        image(ids.media.pair, "Mapping the contract fields that Oracle needed as commitments."),
        h2("What changed for finance"),
        p(
          "Finance used to meet a supplier at the invoice. Now they meet it at onboarding, and the approval they give there carries through to the commitment in Oracle. The month-end accrual for open contracts, which took a week of chasing, comes off the platform."
        ),
        quote(
          "I used to find out we had a new supplier when their invoice landed. Now I approve them before we owe them anything."
        ),
        p(i("Head of finance, Harbour & Vale Property (fictional)")),
        DEMO_NOTE
      ),
  },
  {
    client: "Solaris Energy",
    slug: "solaris-energy",
    title:
      "A five-day financial close for an energy group with fourteen entities",
    excerpt:
      "A power generation and distribution group consolidated fourteen legal entities across two countries on OneStream, integrated to SAP, and closed its books in five working days instead of twelve.",
    platform: ["onestream", "sap"],
    region: ["india", "south-africa"],
    sector: "Energy",
    stages: [
      "Chart mapping",
      "Consolidation model",
      "Intercompany matching",
      "Close redesign",
    ],
    publishedAt: "2026-07-22T09:00:00.000Z",
    challenge:
      "Fourteen entities on three charts of accounts, consolidated in spreadsheets by a team that spent the first eight days of every month collecting numbers rather than reviewing them. Intercompany differences were found by the auditors as often as by finance.",
    approach:
      "One consolidation model with a common chart mapped from each entity's SAP ledger, intercompany matching automated at the transaction level, and the close calendar rebuilt around the platform so that reviews began on day two rather than day nine.",
    outcomes: [
      { text: "Close reduced from twelve working days to five, with review time up and collection time gone." },
      { text: "Intercompany differences matched automatically at source, with exceptions routed to the entity that owns them." },
      { text: "One set of numbers for statutory, management and board reporting, produced from the same close." },
    ],
    metrics: [
      { value: "5 days", label: "financial close, from twelve" },
      { value: "14", label: "entities consolidated on one model" },
      { value: "97%", label: "intercompany matched automatically" },
    ],
    body: (ids: Ids) =>
      doc(
        h2("The close before and after"),
        p(
          "The old close was not slow because anyone was slow. It was slow because the first eight days were spent assembling the numbers, which left four days for the work that a close is actually for."
        ),
        table(
          ["Working day", "Before", "After"],
          [
            [["1 - 2"], ["Entities send trial balances by email"], ["Ledgers load from SAP overnight; intercompany matched by day 2"]],
            [["3 - 5"], ["Group finance re-keys into the consolidation workbook"], ["Review, adjustments, sign-off"]],
            [["6 - 8"], ["Intercompany differences chased entity by entity"], ["-"]],
            [["9 - 12"], ["Review, adjustments, board pack"], ["-"]],
          ]
        ),
        h2("Three charts, one model"),
        p(
          "The three charts of accounts were the legacy of two acquisitions. Rather than force the entities onto one chart - a project in its own right - the model maps each ledger to a group chart on load, and the mapping is data that finance owns rather than code that we do."
        ),
        ol([
          "Every account in every ledger mapped once, with an owner and a review date.",
          "Unmapped accounts stop the load rather than falling into a suspense line.",
          "A mapping change is versioned, so a restated period can be rebuilt as it was.",
        ]),
        image(ids.media.desk, "Walking the consolidation model with the group finance team."),
        h2("Intercompany at the transaction"),
        p(
          "Matching at the balance level finds a difference; matching at the transaction level finds the transaction. The rule below is the heart of it - pairs are matched on reference, amount within tolerance and date within a window, and everything left over is routed to the entity whose posting is missing."
        ),
        code(
          "sql",
          `select a.entity, a.counterparty, a.reference, a.amount, b.amount as counter_amount
from ic_postings a
left join ic_postings b
  on b.entity = a.counterparty
 and b.counterparty = a.entity
 and b.reference = a.reference
 and abs(a.amount + b.amount) <= 1.00
 and abs(a.posted_on - b.posted_on) <= 3
where b.id is null
order by a.entity, a.reference;`
        ),
        quote(
          "The auditors used to bring us our intercompany differences. Now we bring them a list of the three that are still open, and why."
        ),
        p(i("Group financial controller, Solaris Energy (fictional)")),
        DEMO_NOTE
      ),
  },
] as const

const POSTS = [
  {
    title:
      "Most procurement problems are data problems wearing a process costume",
    slug: "procurement-problems-are-data-problems",
    category: "data-and-integration",
    cover: "desk" as PhotoKey,
    publishedAt: "2026-09-02T09:00:00.000Z",
    excerpt:
      "Approval loops, maverick spend and late invoices usually trace back to the same place: supplier and item records that were never made fit for the systems that depend on them.",
    body: (ids: Ids) =>
      doc(
        p(
          "When a procurement platform underperforms, the first instinct is to redesign the process. Add an approval step, tighten a threshold, retrain the requesters. It ",
          i("rarely"),
          " works for long, because the process was never the problem. ",
          b("The data was."),
        ),
        p(
          "This article is about the pattern we see most often across Coupa, Ivalua and GEP programs, and what it costs to ignore it. The short version: fix the record before you touch the workflow."
        ),
        h2("Where the friction actually starts"),
        p(
          "Walk any stalled purchase order back to its origin and you will usually find a record: a supplier that exists three times under three spellings, an item with no category, a cost centre that closed last year and was never retired. The platform is doing exactly what it was told to do with the data it was given."
        ),
        image(ids.media.desk, "Most of the work in a data cleanse is deciding, not typing: which of three records is the supplier."),
        p(
          "Three things happen next, and they compound. Each is easy to mistake for a process fault, because each shows up as a process symptom."
        ),
        h3("Three symptoms, one cause"),
        ul([
          {
            parts: [b("Duplicate suppliers"), " split spend and hide the real volume with a vendor, which means:"],
            nested: ul([
              "The contract you negotiated on half the volume is priced for half the volume.",
              "The spend report shows five small suppliers where there is one large one.",
              "Two invoices for the same delivery pass because they cite different vendor numbers.",
            ]),
          },
          [b("Uncategorised items"), " fall out of every report and every contract check. A rule that says \"office supplies over 500 need approval\" cannot see an item that has no category."],
          [b("Stale organisational data"), " routes approvals to people who have moved on. The requester waits; the approver's replacement never sees the request; someone escalates by email and the platform is now the slow way."],
        ]),
        h2("The cost of a bad record, in numbers"),
        p(
          "The figures below are typical of the programs we have audited, not from any one client. They are conservative."
        ),
        table(
          ["Symptom", "Where it surfaces", "Typical cost"],
          [
            [["Duplicate supplier"], ["Payment run, spend analysis"], [b("2-4%"), " of addressable spend in missed volume pricing"]],
            [["Uncategorised item"], ["Contract compliance, approvals"], ["Every rule that names a category does not fire"]],
            [["Retired cost centre"], ["Requisition, ERP posting"], ["Rejected on posting, re-keyed by AP"]],
            [["Wrong payment term"], ["Cash forecast"], ["Forecast error of the term difference, every invoice"]],
            [["Missing tax registration"], ["Invoice validation"], ["Manual hold and a call to the supplier"]],
          ]
        ),
        p(
          "None of these are exotic. The ",
          link("Coupa supplier record", "https://compass.coupa.com/"),
          " and its equivalents in the other platforms have a field for every one of them; the field was simply never filled, or was filled by a migration script that copied whatever the legacy system held. A ",
          mono("SUPPLIER_ID"),
          " that means one thing in the ERP and another in the platform is enough on its own to make the first month-end unreconcilable.",
        ),
        h2("Fix it before it multiplies"),
        p(
          "Every system downstream of procurement - the ERP, the analytics layer, the payment run - copies the record it is handed. A bad supplier record is not one problem but one problem per system, and each copy drifts on its own. The only economical place to fix it is before it enters the first one."
        ),
        quote("A platform cannot enforce a rule the data does not let it see."),
        p("The sequence we use, in the order that matters:"),
        ol([
          [b("Profile "), "every source before deciding anything. Count the duplicates, the empties, the impossible values. This takes days and prevents months."],
          [b("Standardise "), "the shape of a record: one address format, one tax-id format, one naming rule. Write it down; the platform's validation is only as good as the rule it is given."],
          [b("Deduplicate "), "on evidence - registration numbers and bank accounts - before names. Names are the field most often wrong."],
          [b("Enrich "), "with what the platform will need on day one: category, payment term, owning entity, contract reference."],
          [b("Govern "), "who may create and change a record afterwards, and in which system. One direction of flow, always."],
        ]),
        h3("A rule the platform can see"),
        p(
          "Here is the kind of validation that becomes possible once the record is right. It is unremarkable, which is the point: it only works because every field it names is reliably present."
        ),
        code(
          "json",
          `{
  "rule": "supplier-ready-for-po",
  "when": "requisition.submit",
  "require": {
    "supplier.status": "active",
    "supplier.taxRegistration": { "present": true },
    "supplier.bankAccount.verifiedBy": { "role": "finance" },
    "supplier.paymentTerm": { "in": ["NET30", "NET45", "NET60"] },
    "line.category": { "present": true }
  },
  "otherwise": { "route": "procurement-data-desk", "sla": "P1D" }
}`
        ),
        p(
          "The rule is enforced at submission, so a requester finds out immediately rather than after an approver has rejected it.",
          sup("1"),
          " That single change removes the most common approval loop we see.",
        ),
        h2("A checklist before migration"),
        p("If you are about to migrate a supplier master into a new platform, we would want every one of these to be true first:"),
        checklist([
          { done: true, parts: ["Every source system profiled, with duplicate and empty counts by field"] },
          { done: true, parts: ["One record standard written down and agreed by procurement and finance"] },
          { done: true, parts: ["Deduplication run on registration number and bank account, with the survivors chosen"] },
          { done: false, parts: ["Every surviving supplier categorised and assigned a payment term"] },
          { done: false, parts: ["Ownership of create and change decided, with one direction of flow between platform and ERP"] },
          { done: false, parts: ["Reconciliation report built before the first interface run, not after"] },
        ]),
        hr(),
        h2("What good looks like"),
        p(
          "Standardise the shape of a record, validate it against the rules the platform will apply, enrich it with what the platform will need, and govern who may change it. None of that is glamorous. All of it is cheaper than the approval step you were about to add."
        ),
        p("We did exactly this for a logistics group before their Coupa rollout; the supplier master went from fourteen thousand records to under seven thousand before a single one was migrated."),
        related("client-stories", ids.stories["northline-logistics"]),
        h4("Notes"),
        indented(
          sup("1"),
          " Submission-time validation is available in every platform we implement; where it is not configurable it can be done in the integration layer, at the cost of a slower message to the requester."
        ),
        p(
          "A word on what this article is ",
          s("not"),
          " ",
          u("not"),
          " about: it is not an argument against process design. It is an argument about order. Data first, then the workflow that depends on it.",
        ),
        DEMO_NOTE
      ),
  },
  {
    title: "What a go-live looks like when adoption is designed in",
    slug: "go-live-with-adoption-designed-in",
    category: "adoption",
    cover: "team" as PhotoKey,
    publishedAt: "2026-08-19T09:00:00.000Z",
    excerpt:
      "A platform nobody uses correctly is an expensive way to keep doing the old process. The go-lives that stick treat the first ninety days as part of the build, not what comes after it.",
    body: (ids: Ids) =>
      doc(
        p(
          "Go-live is usually treated as the finish line. The configuration is complete, the data is migrated, the cutover checklist is signed. Then the requesters open the platform on Monday morning and route around it, because nobody designed for them."
        ),
        h2("The Monday morning test"),
        p(
          "Here is the test we apply to a design before we will sign it off. Take the ten people who raise the most requests in the business. Sit with each of them on the Monday after go-live, and watch. Not train - watch. Every place they hesitate, ask a colleague, or open the old spreadsheet is a design fault, and it is cheaper to find it in a design review than on that Monday."
        ),
        image(ids.media.team, "The first week after go-live: the support desk and the requesters in one room, on purpose."),
        h2("Three questions to answer before cutover"),
        ol([
          "Who has to change what they do on day one, and what do they get in return?",
          "Which decisions is the platform now making that a person used to make?",
          "What will the first hundred support tickets be about, and can the answers be in the tool?",
        ]),
        p(
          "If those have answers, adoption is a matter of follow-through. If they do not, no amount of training decks will close the gap."
        ),
        h3("Who changes what"),
        p(
          "The answer to the first question is a table, and it should exist before the design is finished. ",
          s("Training"),
          " ",
          u("Enablement"),
          " is what you owe each row in return.",
        ),
        table(
          ["Role", "Day-one change", "What they get back"],
          [
            [["Requester"], ["Raises in the platform, not by email"], ["Sees where the request is without asking"]],
            [["Approver"], ["Approves in the platform, on a phone if they like"], ["One queue, with the context attached"]],
            [["Buyer"], ["Sources from the catalogue and the contract, not from memory"], ["Stops answering \"where is my order\""]],
            [["Accounts payable"], ["Matches against a receipt that exists"], ["Exceptions only; the rest posts itself"]],
            [["Supplier"], ["Invoices against a PO number"], ["Paid on the term, and can see when"]],
          ]
        ),
        h2("Measure it like a product"),
        p(
          "Adoption is not a feeling. It is the share of spend that goes through the platform, the share of requests that complete without a hand-off, the time from need to purchase order. Pick the three numbers that matter to the business case and publish them weekly from the first week."
        ),
        p("The first of those is a single query against the platform's reporting schema, and it should be on a wall by week two:"),
        code(
          "sql",
          `select date_trunc('week', invoice_date) as week,
       sum(amount) filter (where po_number is not null) / sum(amount) as po_coverage,
       count(*) filter (where po_number is null) as invoices_without_po
from invoices
where invoice_date >= date '2026-03-01'
group by 1
order by 1;`
        ),
        h3("The first ninety days"),
        p("What the program still owes the business after cutover, week by week. The unticked items are the ones most programs skip."),
        checklist([
          { done: true, parts: [b("Week 1: "), "floor-walking, every site, every day"] },
          { done: true, parts: [b("Week 2: "), "the three adoption numbers published, with last week's for comparison"] },
          { done: true, parts: [b("Week 4: "), "the top twenty support tickets read as design feedback and answered in the tool"] },
          { done: false, parts: [b("Week 8: "), "the catalogue reviewed against what was actually requested off-catalogue"] },
          { done: false, parts: [b("Week 12: "), "the business case revisited with real numbers, and the next phase decided on them"] },
        ]),
        quote(
          "The platform is live when the numbers move, not when the cutover email goes out."
        ),
        h2("Design the support in"),
        p("The support model is part of the design, not a service bought afterwards. Three things make the difference:"),
        ul([
          {
            parts: [b("Answers in the tool. "), "The first hundred tickets are predictable. Their answers belong on the form, not in a knowledge base:"],
            nested: ul([
              "Which category to pick, with examples of what falls in each.",
              "What happens next, and roughly when.",
              "Who to ask, by name, when the form cannot answer.",
            ]),
          },
          [b("A support desk that can change configuration. "), "A desk that can only log tickets teaches the business that the platform cannot be fixed."],
          [b("A named owner per site. "), "Not a champion - an owner, whose objectives include the adoption numbers for their site."],
        ]),
        image(ids.media.talk, "Site owners compare their adoption numbers in the weekly review."),
        p("The programs where this works have one thing in common: the data was right before the platform went live, so the platform's first impression was of something that worked. We wrote about that first."),
        related("posts", ids.posts["procurement-problems-are-data-problems"]),
        p(
          "And for a program where onboarding was designed so that finance met the supplier before the invoice did, see the ",
          docLink("Harbour & Vale story", "client-stories", ids.stories["harbour-and-vale-property"]),
          ".",
        ),
        hr(),
        DEMO_NOTE
      ),
  },
  {
    title:
      "The five S/4HANA interfaces that decide whether a source-to-pay rollout works",
    slug: "five-s4hana-interfaces-that-matter",
    category: "platform-delivery",
    cover: "pair" as PhotoKey,
    publishedAt: "2026-07-28T09:00:00.000Z",
    excerpt:
      "Requisitions, purchase orders, goods receipt, invoices and payment status. Get these five flows right, with reconciliation designed in, and the rest of the integration is detail.",
    body: (ids: Ids) =>
      doc(
        p(
          "Every source-to-pay platform promises a standard SAP connector. Every rollout discovers that the connector is where the project is actually decided. The platform is the easy half; the interfaces to the system of record are where the money and the risk sit."
        ),
        h2("The five that matter"),
        p("There are usually twenty or more interfaces on the design. Five of them carry the process; the rest carry reference data and can be batch, nightly and boring."),
        table(
          ["Flow", "Direction", "Breaks when"],
          [
            [[b("Requisition"), " to purchase requisition"], ["Platform to SAP"], ["The cost assignment is not one SAP will accept"]],
            [[b("Purchase order"), " out"], ["SAP to platform"], ["A partial change order arrives and the whole PO is re-sent"]],
            [[b("Goods receipt"), " back"], ["SAP to platform"], ["Receipt is posted against the wrong line, so three-way match fails"]],
            [[b("Invoice"), " in"], ["Platform to SAP"], ["Tolerances differ between the two systems"]],
            [[b("Payment status"), " back"], ["SAP to platform"], ["Nobody built it, so suppliers phone AP"]],
          ]
        ),
        h3("Requisition to purchase requisition"),
        p(
          "The first flow is where most programs learn what a cost assignment really is. A requester picks a cost centre; SAP wants a cost centre, a GL account derived from the material group, possibly an internal order or WBS element, and a company code that agrees with all of them. The platform must either know those rules or carry enough for SAP to derive them. Getting this wrong produces the most demoralising failure mode there is: a requisition approved by three people and rejected by a posting rule."
        ),
        h3("Purchase order out"),
        p(
          "The order itself is straightforward; the change order is not. A quantity reduced on one line, a price changed on another and a line closed should arrive as a change to that order, not as a new order, and the platform must keep its own version in step. We build this flow ",
          mono("delta-first"),
          " and test it with a change to every field that can change.",
        ),
        image(ids.media.pair, "Walking a change order through both systems, line by line."),
        h2("Design the reconciliation first"),
        p(
          "A discrepancy will surface. The only question is whether it surfaces in the process, where someone can act on it, or at period close, where it becomes a finance problem with a procurement cause. Reconciliation is not a report to add later; it is a design input for every one of the five flows."
        ),
        quote("If you cannot say, for every document, which system is right, you have two systems of record and no integration."),
        ol([
          "For each flow, name the system of record for each field. Write it in the design.",
          "For each flow, define the reconciliation: what is compared, how often, and who owns a difference.",
          "Build the reconciliation report before the happy path. It is the test harness for everything after.",
        ]),
        p("An acknowledgement carries enough for both sides to name the same document. Here is the shape we use for a purchase order acknowledgement, whatever the middleware:"),
        code(
          "xml",
          `<PurchaseOrderAck>
  <PlatformOrderId>PO-004821</PlatformOrderId>
  <SapDocument>4500091277</SapDocument>
  <CompanyCode>1000</CompanyCode>
  <Status>ACCEPTED</Status>
  <Lines>
    <Line number="1" sapItem="00010" status="ACCEPTED"/>
    <Line number="2" sapItem="00020" status="REJECTED" reason="Cost centre 4711 closed"/>
  </Lines>
  <ReceivedAt>2026-03-02T08:14:00+08:00</ReceivedAt>
</PurchaseOrderAck>`
        ),
        h3("Test at realistic volume"),
        p(
          "An interface that passes with ten purchase orders and fails with ten thousand has not been tested. Load the volumes the business runs at, including the month-end spike, before anyone signs."
        ),
        ul([
          "A full quarter of real transactions, anonymised, through every flow.",
          "The month-end day at three times its normal volume.",
          "Every failure mode in the table above, deliberately induced, with the reconciliation catching each one.",
        ]),
        h2("A cutover checklist"),
        checklist([
          { done: true, parts: ["System of record named for every field on every flow"] },
          { done: true, parts: ["Reconciliation report built and run against test volume"] },
          { done: true, parts: ["Change-order flow tested with every mutable field"] },
          { done: false, parts: ["Payment status flow live, and suppliers told where to look"] },
          { done: false, parts: ["Period-close rehearsed on the platform with finance in the room"] },
        ]),
        p(
          "Finance's interest in this is not abstract. In the consolidation program below, intercompany matching depended on the same discipline: a document both sides could name.",
        ),
        related("client-stories", ids.stories["solaris-energy"]),
        p(
          "The SAP-side detail - message types, IDoc versus API, the S/4HANA ",
          link("Business Partner", "https://help.sap.com/"),
          " model - is a separate article. Water is H",
          sub("2"),
          "O whichever way you spell it, and an interface is reconciliation whichever middleware carries it.",
        ),
        hr(),
        DEMO_NOTE
      ),
  },
] as const

/* ---------------------------------------------------------------------------
 * Create and remove.
 * ------------------------------------------------------------------------- */

async function main() {
  console.log(
    "seed-demo: starting",
    process.argv.slice(2).join(" ") || "(create)"
  )
  const remove = process.argv.includes("--remove")
  const payload = await getPayload({ config })
  const log = (msg: string) => payload.logger.info(msg)

  if (remove) {
    for (const post of POSTS) {
      const { docs } = await payload.delete({
        collection: "posts",
        where: { slug: { equals: post.slug } },
      })
      log(`posts: removed ${docs.length} (${post.slug})`)
    }
    for (const story of STORIES) {
      const { docs } = await payload.delete({
        collection: "client-stories",
        where: { slug: { equals: story.slug } },
      })
      log(`client-stories: removed ${docs.length} (${story.slug})`)
    }
    for (const category of CATEGORIES) {
      const { docs } = await payload.delete({
        collection: "categories",
        where: { slug: { equals: category.slug } },
      })
      log(`categories: removed ${docs.length} (${category.slug})`)
    }
    const authors = await payload.delete({
      collection: "authors",
      where: { name: { equals: AUTHOR.name } },
    })
    log(`authors: removed ${authors.docs.length} (${AUTHOR.name})`)
    const media = await payload.delete({
      collection: "media",
      where: { filename: { like: DEMO_FILE_PREFIX } },
    })
    log(`media: removed ${media.docs.length} (${DEMO_FILE_PREFIX}*)`)
    return
  }

  const ids: Ids = { media: {} as Ids["media"], stories: {}, posts: {} }

  // Photographs, once each.
  for (const [index, photo] of PHOTOS.entries()) {
    const name = `${DEMO_FILE_PREFIX}${index + 1}.jpg`
    const existing = (
      await payload.find({
        collection: "media",
        where: { filename: { like: name.replace(/\.jpg$/, "") } },
        limit: 1,
      })
    ).docs[0]
    if (existing) {
      ids.media[photo.key] = existing.id
      log(`media: already present (${name})`)
      continue
    }
    const data = await readFile(path.join(process.cwd(), "public/life", photo.file))
    const created = await payload.create({
      collection: "media",
      data: { alt: photo.alt, credit: "Cogniviti Labs" },
      file: { data, mimetype: "image/jpeg", name, size: data.byteLength },
    })
    ids.media[photo.key] = created.id
    log(`media: uploaded ${name}`)
  }

  // Author, once.
  let author = (
    await payload.find({
      collection: "authors",
      where: { name: { equals: AUTHOR.name } },
      limit: 1,
    })
  ).docs[0]
  if (!author) {
    author = await payload.create({
      collection: "authors",
      data: { ...AUTHOR, photo: ids.media.team },
    })
    log(`authors: created ${author.name}`)
  }

  // Categories, once each.
  const categoryIds: Record<string, number> = {}
  for (const category of CATEGORIES) {
    let doc = (
      await payload.find({
        collection: "categories",
        where: { slug: { equals: category.slug } },
        limit: 1,
      })
    ).docs[0]
    if (!doc) {
      doc = await payload.create({ collection: "categories", data: category })
      log(`categories: created ${doc.title}`)
    }
    categoryIds[category.slug] = doc.id
  }

  // Stories first: the posts point at them.
  for (const story of STORIES) {
    const exists = (
      await payload.find({
        collection: "client-stories",
        where: { slug: { equals: story.slug } },
        limit: 1,
      })
    ).docs[0]
    if (exists) {
      ids.stories[story.slug] = exists.id
      log(`client-stories: already present (${story.slug})`)
      continue
    }
    const created = await payload.create({
      collection: "client-stories",
      data: {
        client: story.client,
        slug: story.slug,
        title: story.title,
        excerpt: story.excerpt,
        platform: [...story.platform],
        region: [...story.region],
        sector: story.sector,
        stages: story.stages.map((label) => ({ label })),
        challenge: story.challenge,
        approach: story.approach,
        outcomes: [...story.outcomes],
        metrics: [...story.metrics],
        body: story.body(ids) as never,
        publishedAt: story.publishedAt,
        _status: "published",
      },
    })
    ids.stories[story.slug] = created.id
    log(`client-stories: created ${story.slug}`)
  }

  // Posts in order: the second points at the first.
  for (const post of POSTS) {
    const exists = (
      await payload.find({
        collection: "posts",
        where: { slug: { equals: post.slug } },
        limit: 1,
      })
    ).docs[0]
    if (exists) {
      ids.posts[post.slug] = exists.id
      log(`posts: already present (${post.slug})`)
      continue
    }
    const created = await payload.create({
      collection: "posts",
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: ids.media[post.cover],
        body: post.body(ids) as never,
        author: author.id,
        categories: [categoryIds[post.category]],
        publishedAt: post.publishedAt,
        _status: "published",
      },
    })
    ids.posts[post.slug] = created.id
    log(`posts: created ${post.slug}`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
