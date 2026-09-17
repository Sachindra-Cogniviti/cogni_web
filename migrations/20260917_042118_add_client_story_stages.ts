import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "client_stories_stages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "_client_stories_v_version_stages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "client_stories_stages" ADD CONSTRAINT "client_stories_stages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."client_stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_client_stories_v_version_stages" ADD CONSTRAINT "_client_stories_v_version_stages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_client_stories_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "client_stories_stages_order_idx" ON "client_stories_stages" USING btree ("_order");
  CREATE INDEX "client_stories_stages_parent_id_idx" ON "client_stories_stages" USING btree ("_parent_id");
  CREATE INDEX "_client_stories_v_version_stages_order_idx" ON "_client_stories_v_version_stages" USING btree ("_order");
  CREATE INDEX "_client_stories_v_version_stages_parent_id_idx" ON "_client_stories_v_version_stages" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "client_stories_stages" CASCADE;
  DROP TABLE "_client_stories_v_version_stages" CASCADE;`)
}
