import { AccountEnterpriseSchema } from 'src/modules/accounts/lib/account.validations'
import z from 'zod'
import { AddressSchema, PatchAddressSchema, PostAddressSchema } from '../addresses/lib/address.validations'

export const EstablishmentSchema = z.object({
  id: z.uuid().optional(),
  name: z.string(),
  owner: z.union([
    z.uuid(),
    AccountEnterpriseSchema
  ]),
  address: AddressSchema,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
})

export const GetEstablishmentsSchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1)).default(1),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).default(10),
  name: z.string().optional(),
  address: z.string().optional(),
  owner: z.uuid().optional()
})

export const GetEstablishmentSchema = z.object({
  id: z.uuid()
})

export const PostEstablishmentSchema = z.object({
  name: z.string(),
  owner: z.union([z.uuid(), z.object({
    id: z.uuid()
  })]),
  address: PostAddressSchema
})

export const PatchEstablishmentSchema = z.object({
  id: z.uuid(),
  name: z.string().optional(),
  address: PatchAddressSchema.optional(),
  owner: z.union([z.uuid(), z.object({
    id: z.uuid()
  })]).optional()
})

export const DeleteEstablishmentSchema = z.object({
  id: z.uuid()
})

export interface GetEstablishmentsInput {
  in: {
    query: z.infer<typeof GetEstablishmentsSchema>
  }
  out: {
    query: z.infer<typeof GetEstablishmentsSchema>
  }
}

export interface GetEstablishmentInput {
  in: {
    param: z.infer<typeof GetEstablishmentSchema>
  }
  out: {
    param: z.infer<typeof GetEstablishmentSchema>
  }
}

export interface PostEstablishmentInput {
  in: {
    json: z.infer<typeof PostEstablishmentSchema>
  }
  out: {
    json: z.infer<typeof PostEstablishmentSchema>
  }
}

export interface PatchEstablishmentInput {
  in: {
    json: z.infer<typeof PatchEstablishmentSchema>
  }
  out: {
    json: z.infer<typeof PatchEstablishmentSchema>
  }
}

export interface DeleteEstablishmentInput {
  in: {
    param: z.infer<typeof DeleteEstablishmentSchema>
  }
  out: {
    param: z.infer<typeof DeleteEstablishmentSchema>
  }
}

export type GetEstablishmentsQuery = z.infer<typeof GetEstablishmentsSchema>
export type GetEstablishmentParam = z.infer<typeof GetEstablishmentSchema>
export type PostEstablishmentBody = z.infer<typeof PostEstablishmentSchema>
export type PatchEstablishmentBody = z.infer<typeof PatchEstablishmentSchema>
export type DeleteEstablishmentParam = z.infer<typeof DeleteEstablishmentSchema>
