import z from 'zod'

export const ActivityCategorySchema = z.object({
  id: z.uuid(),
  parent: z.lazy((): z.ZodTypeAny => ActivityCategorySchema).optional(),
  name: z.string(),
  i18nKey: z.string(),
  icon: z.string().optional(),
  color: z.string().optional()
})

export const GetActivityCategorySchema = z.object({
  id: z.uuid()
})

export const PostActivityCategorySchema = z.object({
  id: z.uuid(),
  parent: z.union([z.uuid(), z.lazy((): z.ZodTypeAny => PostActivityCategorySchema)]).optional(),
  name: z.string(),
  i18nKey: z.string(),
  icon: z.string().optional(),
  color: z.string().optional()
})

export const PatchActivityCategorySchema: z.ZodType<any> = z.object({
  id: z.uuid().optional(),
  parent: z.union([z.uuid(), z.lazy((): z.ZodTypeAny => PatchActivityCategorySchema)]).optional(),
  name: z.string().optional(),
  i18nKey: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional()
})

export type GetActivityCategoryParam = z.infer<typeof GetActivityCategorySchema>
