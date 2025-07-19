ALTER TABLE "activity_category" RENAME COLUMN "i18nkey" TO "i18nKey";--> statement-breakpoint
ALTER TABLE "activity_category" DROP CONSTRAINT "activity_category_i18nkey_unique";--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "type" SET DEFAULT 'personal'::text;--> statement-breakpoint
DROP TYPE "public"."account_type";--> statement-breakpoint
CREATE TYPE "public"."account_type" AS ENUM('personal', 'enterprise');--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "type" SET DEFAULT 'personal'::"public"."account_type";--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "type" SET DATA TYPE "public"."account_type" USING "type"::"public"."account_type";--> statement-breakpoint
DROP INDEX "activity_category_i18nkey_idx";--> statement-breakpoint
CREATE INDEX "activity_category_i18nkey_idx" ON "activity_category" USING btree ("i18nKey");--> statement-breakpoint
ALTER TABLE "activity_category" ADD CONSTRAINT "activity_category_i18nKey_unique" UNIQUE("i18nKey");