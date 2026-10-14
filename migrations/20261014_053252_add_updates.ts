import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres"

import { initialUpdates } from "./data/initial-updates"

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_updates_link_type" AS ENUM('post', 'story', 'url');
  CREATE TABLE "updates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"title" varchar NOT NULL,
  	"kind" varchar NOT NULL,
  	"date" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"image_id" integer,
  	"image_path" varchar,
  	"image_alt" varchar,
  	"link_type" "enum_updates_link_type" DEFAULT 'url' NOT NULL,
  	"post_id" integer,
  	"story_id" integer,
  	"url" varchar,
  	"link_label" varchar DEFAULT 'Read more' NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "updates_id" integer;
  ALTER TABLE "updates" ADD CONSTRAINT "updates_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "updates" ADD CONSTRAINT "updates_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "updates" ADD CONSTRAINT "updates_story_id_client_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."client_stories"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "updates__order_idx" ON "updates" USING btree ("_order");
  CREATE INDEX "updates_image_idx" ON "updates" USING btree ("image_id");
  CREATE INDEX "updates_post_idx" ON "updates" USING btree ("post_id");
  CREATE INDEX "updates_story_idx" ON "updates" USING btree ("story_id");
  CREATE INDEX "updates_updated_at_idx" ON "updates" USING btree ("updated_at");
  CREATE INDEX "updates_created_at_idx" ON "updates" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_updates_fk" FOREIGN KEY ("updates_id") REFERENCES "public"."updates"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_updates_id_idx" ON "payload_locked_documents_rels" USING btree ("updates_id");`)
  // Copy the three original announcements, retaining their original order and links.
  for (const [index, item] of initialUpdates.entries()) {
    await db.execute(sql`
      INSERT INTO "updates" ("_order", "title", "kind", "date", "body", "image_path", "image_alt", "link_type", "url", "link_label", "hidden")
      VALUES (${`a${index}`}, ${item.title}, ${item.kind}, ${item.date}, ${item.body}, ${item.image?.src ?? null}, ${item.image?.alt ?? null}, 'url', ${item.cta.href}, ${item.cta.label}, false)
    `)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "updates" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "updates" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_updates_fk";
  
  DROP INDEX "payload_locked_documents_rels_updates_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "updates_id";
  DROP TYPE "public"."enum_updates_link_type";`)
}


