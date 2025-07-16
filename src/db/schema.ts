import { sql } from 'drizzle-orm';
import { pgTable, pgEnum, uuid, text, boolean, timestamp, integer, doublePrecision, geometry, index, uniqueIndex, foreignKey, check } from 'drizzle-orm/pg-core';

// --- ENUMS ---

export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);
export const accountTypeEnum = pgEnum('account_type', ['personal', 'enterprise']);
export const followRequestStatusEnum = pgEnum('follow_request_status_enum', ['pending', 'approved', 'rejected']);
export const establishmentRequestStatusEnum = pgEnum('establishment_request_status', ['pending', 'approved', 'rejected']);
export const notificationTypeEnum = pgEnum('notification_type', ['follow', 'follow_request', 'establishment_request', 'entry', 'activity', 'system']);
export const activityLanguageEnum = pgEnum('activity_language', ['en', 'es']);

// --- TABLES ---

export const account = pgTable('account', {
  id: uuid('id').primaryKey(), // Supabase Auth user ID (UUID)
  name: text('name').notNull(),
  username: text('username').unique().notNull(),
  email: text('email').unique().notNull(),
  biography: text('biography'),
  gender: genderEnum('gender').notNull().default('other'),
  birthdate: timestamp('birthdate', { withTimezone: true }),
  avatar: text('avatar'),
  website: text('website'),
  is_private: boolean('is_private').notNull().default(false),
  is_verified: boolean('is_verified').notNull().default(false),
  type: accountTypeEnum('type').notNull().default('personal'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
},
  (table) => [
    uniqueIndex('account_username_idx').on(table.username),
    uniqueIndex('account_email_idx').on(table.email),
    check('account_name_check', sql`char_length(${table.name}) >= 2 AND char_length(${table.name}) <= 50 AND ${table.name} ~ '^[a-zA-Zñ\\s]+$'`),
    check('account_username_check', sql`char_length(${table.username}) >= 3 AND char_length(${table.username}) <= 30 AND ${table.username} ~ '^[a-z_0-9]+$'`),
    check('account_email_check', sql`${table.email} ~ '^[A-Za-z0-9._%+-]+@(?:gmail|hotmail|outlook|yahoo|icloud|aol|zoho|mail|protonmail|inbox|gmx|yandex|mailinator|disroot|tutanota|fastmail|startmail|runbox|hushmail|mailfence|posteo|riseup|kolabnow|mailbox|openmailbox|airmail|comcast|att|verizon|shaw|telus|charter|frontier|cox|btinternet|talktalk|virginmedia|sky|o2|orange|free|sfr|numericable|laposte|bouyguestelecom|neuf|alice|libero)\\.[A-Za-z]{2,}$'`),
    check('account_age_check', sql`(${table.birthdate} IS NULL OR ${table.birthdate} <= NOW() - INTERVAL '16 years')`),
  ]
);

export const follow = pgTable('follow', {
  id: uuid('id').primaryKey().defaultRandom(),
  follower_id: uuid('follower_id').notNull().references(() => account.id, { onDelete: 'cascade' }),
  following_id: uuid('following_id').notNull().references(() => account.id, { onDelete: 'cascade' }),
  is_muted: boolean('is_muted').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
},
  (table) => [
    uniqueIndex('follow_unique_idx').on(
      table.follower_id,
      table.following_id
    ),
    index('follow_follower_idx').on(table.follower_id),
    index('follow_following_idx').on(table.following_id),
  ]
);

export const followRequest = pgTable('follow_request', {
  id: uuid('id').primaryKey().defaultRandom(),
  request_from_id: uuid('request_from_id').notNull().references(() => account.id, { onDelete: 'cascade' }),
  request_to_id: uuid('request_to_id').notNull().references(() => account.id, { onDelete: 'cascade' }),
  status: followRequestStatusEnum('status').notNull().default('pending'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
},
  (table) => [
    uniqueIndex('follow_request_unique_idx').on(
      table.request_from_id,
      table.request_to_id
    ),
    index('follow_request_from_idx').on(table.request_from_id),
    index('follow_request_to_idx').on(table.request_to_id),
  ]
);

export const address = pgTable('address', {
  id: uuid('id').primaryKey().defaultRandom(),
  country: text('country').notNull(),
  postal_code: text('postal_code').notNull(),
  city: text('city').notNull(),
  street: text('street').notNull(),
  number: text('number').notNull(),
  block: text('block'),
  floor: text('floor'),
  stair: text('stair'),
  door: text('door'),
  coordinates: geometry('coordoinates', { type: 'point', mode: 'xy', srid: 4326 }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
},
  (table) => [
    uniqueIndex('address_unique_idx').on(
      table.country,
      table.postal_code,
      table.city,
      table.street,
      table.number,
      table.block,
      table.floor,
      table.stair,
      table.door
    ),
    index('address_location_idx').on(table.coordinates)
  ]
);

export const activity_category = pgTable('activity_category', {
  id: uuid('id').primaryKey().defaultRandom(),
  parent_id: uuid('parent_id'),
  name: text('name').unique().notNull(),
  i18nkey: text('i18nkey').unique().notNull(),
  icon: text('icon'),
  color: text('color'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
},
  (table) => [
    foreignKey({
      columns: [table.parent_id],
      foreignColumns: [table.id],
      name: 'activity_category_parent_id_fkey'
    }),
    index('activity_category_i18nkey_idx').on(table.i18nkey),
    check('activity_category_parent_id_check', sql`(${table.parent_id} IS NULL OR ${table.parent_id} != ${table.id})`),
    check('activity_category_required_check', sql`((${table.parent_id} IS NOT NULL AND ${table.icon} IS NOT NULL) OR (${table.parent_id} IS NULL AND ${table.color} IS NOT NULL))`),
  ]
);

export const establishment = pgTable('establishment', {
  id: uuid('id').primaryKey().defaultRandom(),
  owner_id: uuid('owner_id').notNull().references(() => account.id, { onDelete: 'cascade' }),
  address_id: uuid('address_id').notNull().unique().references(() => address.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const activity = pgTable('activity', {
  id: uuid('id').primaryKey().defaultRandom(),
  owner_id: uuid('owner_id').notNull().references(() => account.id, { onDelete: 'cascade' }),
  category_id: uuid('category_id').notNull().references(() => activity_category.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  images: text('images').array().notNull().default([]),
  time_start: timestamp('time_start', { withTimezone: true }).notNull(),
  time_end: timestamp('time_end', { withTimezone: true }).notNull(),
  price_min: doublePrecision('price_min').default(0),
  price_max: doublePrecision('price_max').default(0),
  price_currency: text('price_currency'),
  participants_min: integer('participants_min'),
  participants_max: integer('participants_max'),
  language: activityLanguageEnum('language').notNull(),
  website: text('website'),
  is_draft: boolean('is_draft').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
},
  (table) => [
    uniqueIndex('activity_unique_idx').on(
      table.owner_id,
      table.title
    ),
    index('activity_category_idx').on(table.category_id),
    check('activity_time_check', sql`(${table.time_start} < ${table.time_end})`),
    check('activity_participants_check', sql`(${table.participants_min} IS NULL OR ${table.participants_min} >= 0) AND (${table.participants_max} IS NULL OR ${table.participants_max} >= 0) AND (${table.participants_min} IS NULL OR ${table.participants_max} IS NULL OR ${table.participants_min} <= ${table.participants_max})`),
    check('activity_price_check', sql`(${table.price_min} >= 0) AND (${table.price_max} >= 0) AND (${table.price_min} <= ${table.price_max})`),
  ]
);

export const activityOnsite = pgTable('activity_onsite', {
  id: uuid('id').primaryKey().defaultRandom(),
  activity_id: uuid('activity_id').notNull().references(() => activity.id, { onDelete: 'cascade' }),
  location_coordinates: geometry('location_coordinates', { type: 'point', mode: 'xy', srid: 4326 }).notNull(),
  location_establishment_id: uuid('location_establishment_id').references(() => establishment.id, { onDelete: 'set null' }),
},
  (table) => [
    index('spatial_index').using('gist', table.location_coordinates),
  ]
);

export const activityOnline = pgTable('activity_online', {
  id: uuid('id').primaryKey().defaultRandom(),
  activity_id: uuid('activity_id').notNull().references(() => activity.id, { onDelete: 'cascade' }),
  location_url: text('location_url').notNull(),
});

export const activityParticipant = pgTable('activity_participant', {
  id: uuid('id').primaryKey().defaultRandom(),
  activity_id: uuid('activity_id').notNull().references(() => activity.id, { onDelete: 'cascade' }),
  participant_id: uuid('participant_id').notNull().references(() => account.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
},
  (table) => [
    uniqueIndex('activity_participant_unique_idx').on(
      table.activity_id,
      table.participant_id
    ),
    index('activity_participant_activity_idx').on(table.activity_id),
    index('activity_participant_participant_idx').on(table.participant_id),
  ]
);

export const establishmentRequest = pgTable('establishment_request', {
  id: uuid('id').primaryKey().defaultRandom(),
  request_from_account_id: uuid('request_from_account_id').notNull().references(() => account.id, { onDelete: 'cascade' }),
  request_for_activity_id: uuid('request_for_activity_id').notNull().references(() => activity.id, { onDelete: 'cascade' }),
  request_to_establishment_id: uuid('request_to_establishment_id').notNull().references(() => establishment.id, { onDelete: 'cascade' }),
  status: establishmentRequestStatusEnum('status').notNull().default('pending'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
},
  (table) => [
    uniqueIndex('establishment_request_unique_idx').on(
      table.request_from_account_id,
      table.request_for_activity_id,
      table.request_to_establishment_id
    ),
  ]
);

export const notification = pgTable('Notification', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: notificationTypeEnum('type').notNull(),
  content: text('content').notNull(),
  is_read: boolean('is_read').notNull().default(false),
  owner_id: uuid('owner_id').notNull().references(() => account.id, { onDelete: 'cascade' }),
  related_account_id: uuid('related_account_id').references(() => account.id, { onDelete: 'cascade' }),
  related_activity_id: uuid('related_activity_id').references(() => activity.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
},
  (table) => [
    index('Notification_recipient_idx').on(table.owner_id),
    index('Notification_type_idx').on(table.type),
  ]
);