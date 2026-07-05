import z from 'zod'
import { AccountTypeEnum, GenderEnum } from '../../../types/vista-spec.types'

export const AccountSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  username: z.string(),
  email: z.email(),
  biography: z.string().optional(),
  avatar: z.string().optional(),
  website: z.url().optional(),
  isPrivate: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
})

export const AccountEnterpriseSchema = AccountSchema.extend({
  isVerified: z.boolean().default(false),
  type: z.literal(AccountTypeEnum.ENTERPRISE),
  accountType: z.literal('AccountEnterpriseDTO')
})

export const AccountPersonalSchema = AccountSchema.extend({
  gender: z.enum(GenderEnum).default(GenderEnum.OTHER),
  birthdate: z.date().optional(),
  type: z.literal(AccountTypeEnum.PERSONAL),
  accountType: z.literal('AccountPersonalDTO')
})

export const GetAccountsSchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1)).default(1),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).default(10),
  type: z.enum(AccountTypeEnum).optional().default(AccountTypeEnum.PERSONAL),
  name: z.string().optional(),
  username: z.string().optional()
})

export const GetAccountSchema = z.object({
  id: z.union([z.uuid(), z.string()])
})

export const PostAccountSchema = z.object({
  name: z.string(),
  username: z.string(),
  email: z.email(),
  biography: z.string().optional(),
  avatar: z.string().optional(),
  website: z.url().optional(),
  isPrivate: z.boolean().optional(),
  gender: z.enum(GenderEnum).optional().default(GenderEnum.OTHER),
  birthdate: z.date().optional(),
  accountType: z.enum(AccountTypeEnum).default(AccountTypeEnum.PERSONAL)
})

export const PatchAccountSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().optional(),
  username: z.string().optional(),
  biography: z.string().optional(),
  avatar: z.string().optional(),
  website: z.url().optional(),
  isPrivate: z.boolean().optional(),
  gender: z.enum(GenderEnum).optional(),
  birthdate: z.date().optional(),
  accountType: z.enum(AccountTypeEnum).optional()
})

export const DeleteAccountSchema = z.object({
  id: z.uuid()
})

export interface GetAccountsInput {
  in: {
    query: z.infer<typeof GetAccountsSchema>
  }
  out: {
    query: z.infer<typeof GetAccountsSchema>
  }
}

export interface GetAccountInput {
  in: {
    param: z.infer<typeof GetAccountSchema>
  }
  out: {
    param: z.infer<typeof GetAccountSchema>
  }
}

export interface PostAccountInput {
  in: {
    json: z.infer<typeof PostAccountSchema>
  }
  out: {
    json: z.infer<typeof PostAccountSchema>
  }
}

export interface PatchAccountInput {
  in: {
    json: z.infer<typeof PatchAccountSchema>
  }
  out: {
    json: z.infer<typeof PatchAccountSchema>
  }
}

export interface DeleteAccountInput {
  in: {
    param: z.infer<typeof DeleteAccountSchema>
  }
  out: {
    param: z.infer<typeof DeleteAccountSchema>
  }
}

export type GetAccountsQuery = z.infer<typeof GetAccountsSchema>
export type GetAccountParam = z.infer<typeof GetAccountSchema>
export type PostAccountBody = z.infer<typeof PostAccountSchema>
export type PatchAccountBody = z.infer<typeof PatchAccountSchema>
export type DeleteAccountParam = z.infer<typeof DeleteAccountSchema>
