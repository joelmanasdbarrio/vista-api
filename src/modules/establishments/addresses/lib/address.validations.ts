import z from 'zod'

export const CoordinatesSchema = z.object({
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number()
  })
})

export const AddressSchema = z.object({
  id: z.uuid().optional(),
  country: z.string(),
  postalCode: z.string(),
  city: z.string(),
  street: z.string(),
  number: z.string(),
  block: z.string().optional(),
  floor: z.string().optional(),
  stair: z.string().optional(),
  door: z.string().optional(),
  CoordinatesSchema
})

export const GetAddressSchema = z.object({
  id: z.uuid()
})

export const PostAddressSchema = z.object({
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

export const PatchAddressSchema = z.object({
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

export type GetAddressParam = z.infer<typeof GetAddressSchema>
export type PostAddressBody = z.infer<typeof PostAddressSchema>
export type PatchAddressBody = z.infer<typeof PatchAddressSchema>
export type CoordinatesDTO = z.infer<typeof CoordinatesSchema>
