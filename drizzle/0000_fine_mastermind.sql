CREATE TYPE "public"."account_type" AS ENUM('personal_account', 'enterprise_account');--> statement-breakpoint
CREATE TYPE "public"."activity_language" AS ENUM('en', 'es');--> statement-breakpoint
CREATE TYPE "public"."establishment_request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."follow_request_status_enum" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('follow', 'follow_request', 'establishment_request', 'entry', 'activity', 'system');--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"biography" text,
	"gender" "gender" DEFAULT 'other' NOT NULL,
	"birthdate" timestamp with time zone,
	"avatar" text,
	"website" text,
	"is_private" boolean DEFAULT false NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"type" "account_type" DEFAULT 'personal_account' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_username_unique" UNIQUE("username"),
	CONSTRAINT "account_email_unique" UNIQUE("email"),
	CONSTRAINT "account_name_check" CHECK (char_length("account"."name") >= 2 AND char_length("account"."name") <= 50 AND "account"."name" ~ '^[a-zA-Zñ\s]+$'),
	CONSTRAINT "account_username_check" CHECK (char_length("account"."username") >= 3 AND char_length("account"."username") <= 30 AND "account"."username" ~ '^[a-z_0-9]+$'),
	CONSTRAINT "account_email_check" CHECK ("account"."email" ~ '^[A-Za-z0-9._%+-]+@(?:gmail|hotmail|outlook|yahoo|icloud|aol|zoho|mail|protonmail|inbox|gmx|yandex|mailinator|disroot|tutanota|fastmail|startmail|runbox|hushmail|mailfence|posteo|riseup|kolabnow|mailbox|openmailbox|airmail|comcast|att|verizon|shaw|telus|charter|frontier|cox|btinternet|talktalk|virginmedia|sky|o2|orange|free|sfr|numericable|laposte|bouyguestelecom|neuf|alice|libero)\.[A-Za-z]{2,}$'),
	CONSTRAINT "account_age_check" CHECK (("account"."birthdate" IS NULL OR "account"."birthdate" <= NOW() - INTERVAL '16 years'))
);
--> statement-breakpoint
CREATE TABLE "activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"images" text[] DEFAULT '{}' NOT NULL,
	"time_start" timestamp with time zone NOT NULL,
	"time_end" timestamp with time zone NOT NULL,
	"price_min" double precision DEFAULT 0,
	"price_max" double precision DEFAULT 0,
	"price_currency" text,
	"participants_min" integer,
	"participants_max" integer,
	"language" "activity_language" NOT NULL,
	"website" text,
	"is_draft" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "activity_time_check" CHECK (("activity"."time_start" < "activity"."time_end")),
	CONSTRAINT "activity_participants_check" CHECK (("activity"."participants_min" IS NULL OR "activity"."participants_min" >= 0) AND ("activity"."participants_max" IS NULL OR "activity"."participants_max" >= 0) AND ("activity"."participants_min" IS NULL OR "activity"."participants_max" IS NULL OR "activity"."participants_min" <= "activity"."participants_max")),
	CONSTRAINT "activity_price_check" CHECK (("activity"."price_min" >= 0) AND ("activity"."price_max" >= 0) AND ("activity"."price_min" <= "activity"."price_max"))
);
--> statement-breakpoint
CREATE TABLE "activity_online" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activity_id" uuid NOT NULL,
	"location_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_onsite" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activity_id" uuid NOT NULL,
	"location_coordinates" geometry(point) NOT NULL,
	"location_establishment_id" uuid
);
--> statement-breakpoint
CREATE TABLE "activity_participant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activity_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"name" text NOT NULL,
	"i18nkey" text NOT NULL,
	"icon" text,
	"color" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "activity_category_name_unique" UNIQUE("name"),
	CONSTRAINT "activity_category_i18nkey_unique" UNIQUE("i18nkey"),
	CONSTRAINT "activity_category_parent_id_check" CHECK (("activity_category"."parent_id" IS NULL OR "activity_category"."parent_id" != "activity_category"."id")),
	CONSTRAINT "activity_category_required_check" CHECK ((("activity_category"."parent_id" IS NOT NULL AND "activity_category"."icon" IS NOT NULL) OR ("activity_category"."parent_id" IS NULL AND "activity_category"."color" IS NOT NULL)))
);
--> statement-breakpoint
CREATE TABLE "address" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country" text NOT NULL,
	"postal_code" text NOT NULL,
	"city" text NOT NULL,
	"street" text NOT NULL,
	"number" text NOT NULL,
	"block" text,
	"floor" text,
	"stair" text,
	"door" text,
	"coordoinates" geometry(point) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "establishment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"address_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "establishment_address_id_unique" UNIQUE("address_id")
);
--> statement-breakpoint
CREATE TABLE "establishment_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_from_account_id" uuid NOT NULL,
	"request_for_activity_id" uuid NOT NULL,
	"request_to_establishment_id" uuid NOT NULL,
	"status" "establishment_request_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follow" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follower_id" uuid NOT NULL,
	"following_id" uuid NOT NULL,
	"is_muted" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follow_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_from_id" uuid NOT NULL,
	"request_to_id" uuid NOT NULL,
	"status" "follow_request_status_enum" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "notification_type" NOT NULL,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"owner_id" uuid NOT NULL,
	"related_account_id" uuid,
	"related_activity_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_owner_id_account_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_category_id_activity_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."activity_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_online" ADD CONSTRAINT "activity_online_activity_id_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_onsite" ADD CONSTRAINT "activity_onsite_activity_id_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_onsite" ADD CONSTRAINT "activity_onsite_location_establishment_id_establishment_id_fk" FOREIGN KEY ("location_establishment_id") REFERENCES "public"."establishment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_participant" ADD CONSTRAINT "activity_participant_activity_id_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_participant" ADD CONSTRAINT "activity_participant_participant_id_account_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_category" ADD CONSTRAINT "activity_category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."activity_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "establishment" ADD CONSTRAINT "establishment_owner_id_account_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "establishment" ADD CONSTRAINT "establishment_address_id_address_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."address"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "establishment_request" ADD CONSTRAINT "establishment_request_request_from_account_id_account_id_fk" FOREIGN KEY ("request_from_account_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "establishment_request" ADD CONSTRAINT "establishment_request_request_for_activity_id_activity_id_fk" FOREIGN KEY ("request_for_activity_id") REFERENCES "public"."activity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "establishment_request" ADD CONSTRAINT "establishment_request_request_to_establishment_id_establishment_id_fk" FOREIGN KEY ("request_to_establishment_id") REFERENCES "public"."establishment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow" ADD CONSTRAINT "follow_follower_id_account_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow" ADD CONSTRAINT "follow_following_id_account_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_request" ADD CONSTRAINT "follow_request_request_from_id_account_id_fk" FOREIGN KEY ("request_from_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_request" ADD CONSTRAINT "follow_request_request_to_id_account_id_fk" FOREIGN KEY ("request_to_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_owner_id_account_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_related_account_id_account_id_fk" FOREIGN KEY ("related_account_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_related_activity_id_activity_id_fk" FOREIGN KEY ("related_activity_id") REFERENCES "public"."activity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "account_username_idx" ON "account" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "account_email_idx" ON "account" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "activity_unique_idx" ON "activity" USING btree ("owner_id","title");--> statement-breakpoint
CREATE INDEX "activity_category_idx" ON "activity" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "spatial_index" ON "activity_onsite" USING gist ("location_coordinates");--> statement-breakpoint
CREATE UNIQUE INDEX "activity_participant_unique_idx" ON "activity_participant" USING btree ("activity_id","participant_id");--> statement-breakpoint
CREATE INDEX "activity_participant_activity_idx" ON "activity_participant" USING btree ("activity_id");--> statement-breakpoint
CREATE INDEX "activity_participant_participant_idx" ON "activity_participant" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "activity_category_i18nkey_idx" ON "activity_category" USING btree ("i18nkey");--> statement-breakpoint
CREATE UNIQUE INDEX "address_unique_idx" ON "address" USING btree ("country","postal_code","city","street","number","block","floor","stair","door");--> statement-breakpoint
CREATE INDEX "address_location_idx" ON "address" USING btree ("coordoinates");--> statement-breakpoint
CREATE UNIQUE INDEX "establishment_request_unique_idx" ON "establishment_request" USING btree ("request_from_account_id","request_for_activity_id","request_to_establishment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "follow_unique_idx" ON "follow" USING btree ("follower_id","following_id");--> statement-breakpoint
CREATE INDEX "follow_follower_idx" ON "follow" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "follow_following_idx" ON "follow" USING btree ("following_id");--> statement-breakpoint
CREATE UNIQUE INDEX "follow_request_unique_idx" ON "follow_request" USING btree ("request_from_id","request_to_id");--> statement-breakpoint
CREATE INDEX "follow_request_from_idx" ON "follow_request" USING btree ("request_from_id");--> statement-breakpoint
CREATE INDEX "follow_request_to_idx" ON "follow_request" USING btree ("request_to_id");--> statement-breakpoint
CREATE INDEX "Notification_recipient_idx" ON "Notification" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "Notification_type_idx" ON "Notification" USING btree ("type");