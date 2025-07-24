import z from 'zod'

export const getAddressSchema = z.object({
  id: z.uuid()
})

export const postAddressSchema = z.object({
  country: z.string(),
  postalCode: z.string(),
  city: z.string(),
  street: z.string(),
  number: z.string(),
  block: z.string().optional(),
  floor: z.string().optional(),
  stair: z.string().optional(),
  door: z.string().optional(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number()
  })
})

export const patchAddressSchema = z.object({
  id: z.uuid(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  block: z.string().optional(),
  floor: z.string().optional(),
  stair: z.string().optional(),
  door: z.string().optional(),
  coordinates: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional()
  }).optional()
})

export type GetAddressParam = z.infer<typeof getAddressSchema>
export type PostAddressBody = z.infer<typeof postAddressSchema>
export type PatchAddressBody = z.infer<typeof patchAddressSchema>
