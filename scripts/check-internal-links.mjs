/**
 * Asserts that every internal link in the source carries the trailing slash
 * that `trailingSlash: true` in next.config.ts enforces.
 *
 * Without the slash the URL still works - Next answers 308 to the slashed
 * form - but every internal link then costs a redirect before it resolves,
 * and the internal link graph disagrees with app/sitemap.ts (which has always
 * been written with the slashes) about which URL is canonical. That is the
 * ambiguity canonicals exist to remove, so it is worth a check rather than a
 * comment nobody reads.
 *
 * Plain node over the file text rather than a test runner or a lint rule:
 * there is no test runner in this repo, the thing being checked is a string
 * literal, and a regex over the source catches it in content/ and in JSX
 * alike. Run by `npm run check:links`.
 *
 * What counts as internal and so needs the slash: a value starting "/" whose
 * path is not empty. Exempt: "/" and "/#section" (the path is already "/"),
 * anything with a file extension (/og.png, /llms.txt), and /api/ callers,
 * which are documented in CLAUDE.md as fine either way.
 */
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const ROOT = process.cwd()
const SEARCH = ["app", "components", "content", "lib"]
const EXTENSIONS = [".ts", ".tsx", ".jsx"]

/** href: "/x" and href="/x" and href={`/x`}, capturing the value. */
const PATTERNS = [/href[:=]\s*"([^"]*)"/g, /href=\{`([^`]*)`\}/g]

function sourceFiles(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) {
      out.push(...sourceFiles(path))
    } else if (EXTENSIONS.some((ext) => entry.endsWith(ext))) {
      out.push(path)
    }
  }
  return out
}

/** The complaint about one href, or null if it is fine. */
function problem(value) {
  if (!value.startsWith("/")) return null
  const cut = value.search(/[?#]/)
  const path = cut === -1 ? value : value.slice(0, cut)
  if (path === "/" || path.endsWith("/")) return null
  // A file, not a page: no redirect applies.
  if (/\.[a-z0-9]+$/i.test(path)) return null
  if (path.startsWith("/api/")) return null
  const rest = cut === -1 ? "" : value.slice(cut)
  return `${value}  ->  ${path}/${rest}`
}

const failures = []
for (const dir of SEARCH) {
  for (const file of sourceFiles(join(ROOT, dir))) {
    const source = readFileSync(file, "utf8")
    const lines = source.split("\n")
    lines.forEach((line, index) => {
      for (const pattern of PATTERNS) {
        for (const match of line.matchAll(pattern)) {
          const complaint = problem(match[1])
          if (complaint) {
            failures.push(
              `${relative(ROOT, file)}:${index + 1}  ${complaint}`
            )
          }
        }
      }
    })
  }
}

if (failures.length > 0) {
  console.error(
    `\n${failures.length} internal link${failures.length === 1 ? "" : "s"} missing the trailing slash:\n`
  )
  for (const failure of failures) console.error(`  ${failure}`)
  console.error(
    "\ntrailingSlash: true is set in next.config.ts, so each of these answers" +
      "\na 308 before the page loads. Add the slash before any ? or #.\n"
  )
  process.exit(1)
}

console.log("Internal links: all carry the trailing slash.")
