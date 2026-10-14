import { getPayload } from "payload"
import { generateNKeysBetween } from "payload/shared"
import config from "@/payload.config"
import { initialUpdates } from "../migrations/data/initial-updates"

const payload = await getPayload({ config })
const keys = generateNKeysBetween(null, null, initialUpdates.length)
try {
  for (const [index, item] of initialUpdates.entries()) {
    const existing = await payload.find({
      collection: "updates",
      where: { title: { equals: item.title } },
      limit: 1,
    })
    if (existing.totalDocs) continue
    await payload.create({
      collection: "updates",
      data: {
        title: item.title,
        kind: item.kind,
        date: item.date,
        body: item.body,
        imagePath: item.image?.src,
        imageAlt: item.image?.alt,
        linkType: "url",
        url: item.cta.href,
        linkLabel: item.cta.label,
        hidden: false,
        _order: keys[index],
      },
    })
    console.log(`Imported: ${item.title}`)
  }
} finally {
  await payload.destroy()
}

