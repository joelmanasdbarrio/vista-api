import z from 'zod'
import { AccountTypeEnum, GenderEnum } from '../../../types/vista-spec.types'

export const getAccountsSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  type: z.enum(AccountTypeEnum).optional(),
  name: z.string().optional(),
  username: z.string().optional()
})

export const getAccountSchema = z.object({
  id: z.union([z.uuid(), z.string()])
})

export const patchAccountSchema = z.object({
  id: z.uuid(),
  name: z.string().optional(),
  username: z.string().optional(),
  biography: z.string().optional(),
  avatar: z.string().optional(),
  website: z.url().optional(),
  isPrivate: z.boolean().optional(),
  gender: z.enum(GenderEnum).optional(),
  birthdate: z.date().optional(),
})

export type GetAccountsInput = {
  in: {
    query: z.infer<typeof getAccountsSchema>
  }
  out: {
    query: z.infer<typeof getAccountsSchema>
  }
}

export type PatchAccountInput = {
  in: {
    json: z.infer<typeof patchAccountSchema>
  }
  out: {
    json: z.infer<typeof patchAccountSchema>
  }
}