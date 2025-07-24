ALTER TABLE "account" ALTER COLUMN "biography" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "birthdate" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "avatar" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "website" SET DEFAULT '';