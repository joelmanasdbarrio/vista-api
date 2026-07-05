import { AccountSchema } from 'src/modules/accounts/lib/account.validations'
import { CoordinatesSchema } from 'src/modules/establishments/addresses/lib/address.validations'
import { EstablishmentSchema } from 'src/modules/establishments/lib/establishments.validations'
import { ActivityLanguageEnum, ActivityTypeEnum } from 'src/types/vista-spec.types'
import z from 'zod'
import { ActivityCategorySchema } from '../activityCategories/lib/activityCategory.validations'

export const ActivitySchema = z.object({
  id: z.uuid().optional(),
  owner: z.union([z.uuid(), AccountSchema]),
  category: z.union([z.uuid(), ActivityCategorySchema]),
  title: z.string(),
  description: z.string(),
  images: z.array(z.string()).default([]),
  time: z.object({
    start: z.coerce.date(),
    end: z.coerce.date()
  }),
  price: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string().optional()
  }).optional(),
  participants: z.object({
    min: z.number().int().optional(),
    max: z.number().int().optional()
  }).optional(),
  language: z.enum(ActivityLanguageEnum).default(ActivityLanguageEnum.ENGLISH),
  website: z.string().optional(),
  isDraft: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
})

export const ActivityOnlineSchema = ActivitySchema.extend({
  location: z.object({
    url: z.string()
  }),
  type: z.literal(ActivityTypeEnum.ONLINE),
  activityType: z.literal('ActivityOnlineDTO')
})

export const ActivityOnsiteSchema = ActivitySchema.extend({
  location: z.union([
    z.uuid(),
    EstablishmentSchema,
    CoordinatesSchema
  ]),
  type: z.literal(ActivityTypeEnum.ONSITE),
  activityType: z.literal('ActivityOnsiteDTO')
})

export const GetActivitiesSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  accountId: z.uuid().optional(),
  type: z.enum(ActivityTypeEnum).optional().default(ActivityTypeEnum.ONSITE),
  title: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.uuid().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  timeStart: z.coerce.date().optional(),
  timeEnd: z.coerce.date().optional(),
  minParticipants: z.number().int().optional(),
  maxParticipants: z.number().int().optional(),
  minEntries: z.number().int().optional(),
  maxEntries: z.number().int().optional(),
  geolocation: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    radius: z.number().optional()
  }).optional(),
  language: z.enum(ActivityLanguageEnum).optional().default(ActivityLanguageEnum.ENGLISH)
})

export const GetActivitySchema = z.object({
  id: z.uuid()
})

export const PostActivitySchema = z.object({
  owner: z.union([z.uuid(), z.object({
    id: z.uuid()
  })]),
  category: z.union([z.uuid(), z.object({
    id: z.uuid()
  })]),
  title: z.string(),
  description: z.string(),
  images: z.array(z.string()).default([]),
  time: z.object({
    start: z.coerce.date(),
    end: z.coerce.date()
  }),
  price: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().optional()
  }).optional(),
  participants: z.object({
    min: z.number().int().optional(),
    max: z.number().int().optional()
  }).optional(),
  language: z.enum(ActivityLanguageEnum).default(ActivityLanguageEnum.ENGLISH),
  website: z.url().optional(),
  isDraft: z.boolean().optional().default(true),
  location: z.union([
    z.uuid(),
    EstablishmentSchema,
    CoordinatesSchema,
    z.url()
  ]),
  activityType: z.enum(ActivityTypeEnum).optional().default(ActivityTypeEnum.ONSITE)
})

export const PatchActivitySchema = z.object({
  id: z.uuid(),
  owner: z.union([z.uuid(), z.object({
    id: z.uuid()
  })]).optional(),
  category: z.union([z.uuid(), z.object({
    id: z.uuid()
  })]).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  time: z.object({
    start: z.coerce.date().optional(),
    end: z.coerce.date().optional()
  }).optional(),
  price: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().optional()
  }).optional(),
  participants: z.object({
    min: z.number().int().optional(),
    max: z.number().int().optional()
  }).optional(),
  language: z.enum(ActivityLanguageEnum).optional(),
  website: z.url().optional(),
  isDraft: z.boolean().optional(),
  location: z.union([
    z.uuid(),
    EstablishmentSchema,
    CoordinatesSchema,
    z.url()
  ]).optional(),
  activityType: z.enum(ActivityTypeEnum).optional()
})

export const DeleteActivitySchema = z.object({
  id: z.uuid()
})

export interface GetActivitiesInput {
  in: {
    query: z.infer<typeof GetActivitiesSchema>
  }
  out: {
    query: z.infer<typeof GetActivitiesSchema>
  }
}

export interface GetActivityInput {
  in: {
    param: z.infer<typeof GetActivitySchema>
  }
  out: {
    param: z.infer<typeof GetActivitySchema>
  }
}

export interface PostActivityInput {
  in: {
    json: z.infer<typeof PostActivitySchema>
  }
  out: {
    json: z.infer<typeof PostActivitySchema>
  }
}

export interface PatchActivityInput {
  in: {
    json: z.infer<typeof PatchActivitySchema>
  }
  out: {
    json: z.infer<typeof PatchActivitySchema>
  }
}

export interface DeleteActivityInput {
  in: {
    param: z.infer<typeof DeleteActivitySchema>
  }
  out: {
    param: z.infer<typeof DeleteActivitySchema>
  }
}

export type GetActivitiesQuery = z.infer<typeof GetActivitiesSchema>
export type GetActivityParam = z.infer<typeof GetActivitySchema>
export type PostActivityBody = z.infer<typeof PostActivitySchema>
export type PatchActivityBody = z.infer<typeof PatchActivitySchema>
export type DeleteActivityParam = z.infer<typeof DeleteActivitySchema>
