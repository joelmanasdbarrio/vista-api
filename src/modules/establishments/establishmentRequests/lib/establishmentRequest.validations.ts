import { ActivityOnsiteSchema } from 'src/modules/activites/lib/activity.validations'
import { EstablishmentRequestStatusEnum } from 'src/types/vista-spec.types'
import z from 'zod'
import { EstablishmentSchema } from '../../lib/establishments.validations'

export const EstablishmentRequestSchema = z.object({
  id: z.uuid().optional(),
  requestFromActivity: z.union([z.uuid(), ActivityOnsiteSchema]),
  requestToEstablishment: z.union([z.uuid(), EstablishmentSchema]),
  status: z.enum(EstablishmentRequestStatusEnum).default(EstablishmentRequestStatusEnum.PENDING),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
})

export const GetEstablishmentRequestsSchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1)).default(1),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).default(10),
  activityId: z.uuid().optional(),
  establishmentId: z.uuid().optional()
})

export const GetEstablishmentRequestSchema = z.object({
  id: z.uuid()
})

export const PostEstablishmentRequestSchema = z.object({
  requestFromActivity: z.union([z.uuid(), ActivityOnsiteSchema]),
  requestToEstablishment: z.union([z.uuid(), EstablishmentSchema]),
  status: z.enum(EstablishmentRequestStatusEnum).optional().default(EstablishmentRequestStatusEnum.PENDING)
})

export const PatchEstablishmentRequestSchema = z.object({
  id: z.uuid(),
  status: z.enum(EstablishmentRequestStatusEnum)
})

export const DeleteEstablishmentRequestSchema = z.object({
  id: z.uuid()
})

export interface GetEstablishmentRequestsInput {
  in: {
    query: z.infer<typeof GetEstablishmentRequestsSchema>
  }
  out: {
    query: z.infer<typeof GetEstablishmentRequestsSchema>
  }
}

export interface GetEstablishmentRequestInput {
  in: {
    param: z.infer<typeof GetEstablishmentRequestSchema>
  }
  out: {
    param: z.infer<typeof GetEstablishmentRequestSchema>
  }
}

export interface PostEstablishmentRequestInput {
  in: {
    json: z.infer<typeof PostEstablishmentRequestSchema>
  }
  out: {
    json: z.infer<typeof PostEstablishmentRequestSchema>
  }
}

export interface PatchEstablishmentRequestInput {
  in: {
    json: z.infer<typeof PatchEstablishmentRequestSchema>
  }
  out: {
    json: z.infer<typeof PatchEstablishmentRequestSchema>
  }
}

export interface DeleteEstablishmentRequestInput {
  in: {
    param: z.infer<typeof DeleteEstablishmentRequestSchema>
  }
  out: {
    param: z.infer<typeof DeleteEstablishmentRequestSchema>
  }
}

export type GetEstablishmentRequestsQuery = z.infer<typeof GetEstablishmentRequestsSchema>
export type GetEstablishmentRequestParam = z.infer<typeof GetEstablishmentRequestSchema>
export type PostEstablishmentRequestBody = z.infer<typeof PostEstablishmentRequestSchema>
export type PatchEstablishmentRequestBody = z.infer<typeof PatchEstablishmentRequestSchema>
export type DeleteEstablishmentRequestParam = z.infer<typeof DeleteEstablishmentRequestSchema>
