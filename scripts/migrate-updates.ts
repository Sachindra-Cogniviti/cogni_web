import { getPayload, createLocalReq } from "payload"
import { type MigrateUpArgs, sql } from "@payloadcms/db-postgres"
import config from "@/payload.config"
import { up } from "../migrations/20261014_053252_add_updates"

// Never push the development schema or run unrelated pending migrations.
process.env.PAYLOAD_MIGRATING = "true"
const payload = await getPayload({ config })
try {
  const existing = await payload.db.drizzle.execute(
    sql`SELECT to_regclass('public.updates') AS name`
  )
  if (!existing.rows[0]?.name) {
    const history = await payload.find({
      collection: "payload-migrations",
      sort: "-batch",
      limit: 1,
    })
    const batch = Math.max(0, history.docs[0]?.batch ?? 0) + 1
    const transactionID = await payload.db.beginTransaction()
    if (!transactionID)
      throw new Error("A transaction is required to import updates.")
    const req = await createLocalReq({}, payload)
    req.transactionID = transactionID
    try {
      const db = payload.db.sessions?.[transactionID]?.db as
        MigrateUpArgs["db"] | undefined
      if (!db) throw new Error("Database transaction was not initialized.")
      await up({ db, payload, req })
      await payload.create({
        collection: "payload-migrations",
        req,
        data: { name: "20261014_053252_add_updates", batch },
      })
      await payload.db.commitTransaction(transactionID)
    } catch (error) {
      await payload.db.rollbackTransaction(transactionID)
      throw error
    }
  } else {
    console.log(
      "Updates table already exists. Use npm run seed:updates to import any missing original entries."
    )
  }
  const { docs } = await payload.find({
    collection: "updates",
    sort: "_order",
    depth: 0,
    pagination: false,
  })
  console.log(
    JSON.stringify(
      docs.map(({ title, hidden, url }) => ({ title, hidden, url })),
      null,
      2
    )
  )
} finally {
  await payload.destroy()
}
