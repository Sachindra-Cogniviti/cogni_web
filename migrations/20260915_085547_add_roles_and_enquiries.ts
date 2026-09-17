import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_roles_discipline" AS ENUM('platform-consulting', 'integration-data', 'product-engineering', 'applied-ai');
  CREATE TYPE "public"."enum_roles_type" AS ENUM('full-time', 'contract', 'internship');
  CREATE TYPE "public"."enum_roles_remote" AS ENUM('onsite', 'hybrid', 'remote');
  CREATE TYPE "public"."enum_roles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__roles_v_version_discipline" AS ENUM('platform-consulting', 'integration-data', 'product-engineering', 'applied-ai');
  CREATE TYPE "public"."enum__roles_v_version_type" AS ENUM('full-time', 'contract', 'internship');
  CREATE TYPE "public"."enum__roles_v_version_remote" AS ENUM('onsite', 'hybrid', 'remote');
  CREATE TYPE "public"."enum__roles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_enquiries_subject" AS ENUM('platform-implementation', 'optimization', 'integration', 'managed-services', 'training', 'products', 'careers', 'other');
  CREATE TYPE "public"."enum_enquiries_status" AS ENUM('new', 'in-progress', 'answered', 'spam');
  CREATE TABLE "roles_responsibilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "roles_requirements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "roles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"discipline" "enum_roles_discipline",
  	"type" "enum_roles_type" DEFAULT 'full-time',
  	"location" varchar,
  	"remote" "enum_roles_remote" DEFAULT 'hybrid',
  	"summary" varchar,
  	"body" jsonb,
  	"apply_email" varchar,
  	"posted_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_roles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_roles_v_version_responsibilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_roles_v_version_requirements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_roles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_discipline" "enum__roles_v_version_discipline",
  	"version_type" "enum__roles_v_version_type" DEFAULT 'full-time',
  	"version_location" varchar,
  	"version_remote" "enum__roles_v_version_remote" DEFAULT 'hybrid',
  	"version_summary" varchar,
  	"version_body" jsonb,
  	"version_apply_email" varchar,
  	"version_posted_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__roles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "enquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"company" varchar,
  	"email" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"subject" "enum_enquiries_subject" NOT NULL,
  	"message" varchar,
  	"status" "enum_enquiries_status" DEFAULT 'new',
  	"notes" varchar,
  	"source" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "roles_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "enquiries_id" integer;
  ALTER TABLE "roles_responsibilities" ADD CONSTRAINT "roles_responsibilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "roles_requirements" ADD CONSTRAINT "roles_requirements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_roles_v_version_responsibilities" ADD CONSTRAINT "_roles_v_version_responsibilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_roles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_roles_v_version_requirements" ADD CONSTRAINT "_roles_v_version_requirements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_roles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_roles_v" ADD CONSTRAINT "_roles_v_parent_id_roles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "roles_responsibilities_order_idx" ON "roles_responsibilities" USING btree ("_order");
  CREATE INDEX "roles_responsibilities_parent_id_idx" ON "roles_responsibilities" USING btree ("_parent_id");
  CREATE INDEX "roles_requirements_order_idx" ON "roles_requirements" USING btree ("_order");
  CREATE INDEX "roles_requirements_parent_id_idx" ON "roles_requirements" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "roles_slug_idx" ON "roles" USING btree ("slug");
  CREATE INDEX "roles_updated_at_idx" ON "roles" USING btree ("updated_at");
  CREATE INDEX "roles_created_at_idx" ON "roles" USING btree ("created_at");
  CREATE INDEX "roles__status_idx" ON "roles" USING btree ("_status");
  CREATE INDEX "_roles_v_version_responsibilities_order_idx" ON "_roles_v_version_responsibilities" USING btree ("_order");
  CREATE INDEX "_roles_v_version_responsibilities_parent_id_idx" ON "_roles_v_version_responsibilities" USING btree ("_parent_id");
  CREATE INDEX "_roles_v_version_requirements_order_idx" ON "_roles_v_version_requirements" USING btree ("_order");
  CREATE INDEX "_roles_v_version_requirements_parent_id_idx" ON "_roles_v_version_requirements" USING btree ("_parent_id");
  CREATE INDEX "_roles_v_parent_idx" ON "_roles_v" USING btree ("parent_id");
  CREATE INDEX "_roles_v_version_version_slug_idx" ON "_roles_v" USING btree ("version_slug");
  CREATE INDEX "_roles_v_version_version_updated_at_idx" ON "_roles_v" USING btree ("version_updated_at");
  CREATE INDEX "_roles_v_version_version_created_at_idx" ON "_roles_v" USING btree ("version_created_at");
  CREATE INDEX "_roles_v_version_version__status_idx" ON "_roles_v" USING btree ("version__status");
  CREATE INDEX "_roles_v_created_at_idx" ON "_roles_v" USING btree ("created_at");
  CREATE INDEX "_roles_v_updated_at_idx" ON "_roles_v" USING btree ("updated_at");
  CREATE INDEX "_roles_v_latest_idx" ON "_roles_v" USING btree ("latest");
  CREATE INDEX "enquiries_updated_at_idx" ON "enquiries" USING btree ("updated_at");
  CREATE INDEX "enquiries_created_at_idx" ON "enquiries" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_roles_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enquiries_fk" FOREIGN KEY ("enquiries_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_roles_id_idx" ON "payload_locked_documents_rels" USING btree ("roles_id");
  CREATE INDEX "payload_locked_documents_rels_enquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("enquiries_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "roles_responsibilities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "roles_requirements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "roles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_roles_v_version_responsibilities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_roles_v_version_requirements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_roles_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "enquiries" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "roles_responsibilities" CASCADE;
  DROP TABLE "roles_requirements" CASCADE;
  DROP TABLE "roles" CASCADE;
  DROP TABLE "_roles_v_version_responsibilities" CASCADE;
  DROP TABLE "_roles_v_version_requirements" CASCADE;
  DROP TABLE "_roles_v" CASCADE;
  DROP TABLE "enquiries" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_roles_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_enquiries_fk";
  
  DROP INDEX "payload_locked_documents_rels_roles_id_idx";
  DROP INDEX "payload_locked_documents_rels_enquiries_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "roles_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "enquiries_id";
  DROP TYPE "public"."enum_roles_discipline";
  DROP TYPE "public"."enum_roles_type";
  DROP TYPE "public"."enum_roles_remote";
  DROP TYPE "public"."enum_roles_status";
  DROP TYPE "public"."enum__roles_v_version_discipline";
  DROP TYPE "public"."enum__roles_v_version_type";
  DROP TYPE "public"."enum__roles_v_version_remote";
  DROP TYPE "public"."enum__roles_v_version_status";
  DROP TYPE "public"."enum_enquiries_subject";
  DROP TYPE "public"."enum_enquiries_status";`)
}
