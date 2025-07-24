import z from 'zod'

export const getActivityCategorySchema = z.object({
  id: z.uuid()
})

export type GetActivityCategoryParam = z.infer<typeof getActivityCategorySchema>
