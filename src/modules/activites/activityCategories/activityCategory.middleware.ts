import { Context, Next } from 'hono'
import ActivityCategoryService from './activityCategory.service'
import '../../../types/hono.types'

export const activityCategoryExists = async (c: Context, next: Next) => {
  const id = c.req.param('id')

  const activityCategoryService = new ActivityCategoryService()
  const activityCategory = await activityCategoryService.getOneActivityCategory(c, id)

  if (!activityCategory) return c.json({ status: 'fail', message: 'Activity category not found' }, 404)

  c.set('activityCategory', activityCategory)

  await next()
}
