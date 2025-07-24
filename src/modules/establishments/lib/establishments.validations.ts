import z from 'zod'
import { patchAddressSchema, postAddressSchema } from '../addresses/lib/address.validations'

export const getEstablishmentsSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  name: z.string().optional(),
  address: z.string().optional(),
  owner: z.uuid().optional()
})

export const getEstablishmentSchema = z.object({
  id: z.uuid()
})

export const postEstablishmentSchema = z.object({
  name: z.string(),
  address: postAddressSchema
})

export const patchEstablishmentSchema = z.object({
  id: z.uuid(),
  name: z.string().optional(),
  address: patchAddressSchema.optional(),
  owner: z.object({
    id: z.uuid()
  }).optional()
})

export const deleteEstablishmentSchema = z.object({
  id: z.uuid()
})

export interface GetEstablishmentsInput {
  in: {
    query: z.infer<typeof getEstablishmentsSchema>
  }
  out: {
    query: z.infer<typeof getEstablishmentsSchema>
  }
}

export interface GetEstablishmentInput {
  in: {
    param: z.infer<typeof getEstablishmentSchema>
  }
  out: {
    param: z.infer<typeof getEstablishmentSchema>
  }
}

export interface PostEstablishmentInput {
  in: {
    json: z.infer<typeof postEstablishmentSchema>
  }
  out: {
    json: z.infer<typeof postEstablishmentSchema>
  }
}

export interface PatchEstablishmentInput {
  in: {
    json: z.infer<typeof patchEstablishmentSchema>
  }
  out: {
    json: z.infer<typeof patchEstablishmentSchema>
  }
}

export interface DeleteEstablishmentInput {
  in: {
    param: z.infer<typeof deleteEstablishmentSchema>
  }
  out: {
    param: z.infer<typeof deleteEstablishmentSchema>
  }
}

export type GetEstablishmentsQuery = z.infer<typeof getEstablishmentsSchema>
export type GetEstablishmentParam = z.infer<typeof getEstablishmentSchema>
export type PostEstablishmentBody = z.infer<typeof postEstablishmentSchema>
export type PatchEstablishmentBody = z.infer<typeof patchEstablishmentSchema>
export type DeleteEstablishmentParam = z.infer<typeof deleteEstablishmentSchema>
