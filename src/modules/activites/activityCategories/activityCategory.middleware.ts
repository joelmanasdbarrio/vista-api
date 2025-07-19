import { getOneActivityCategory } from '../services/activityCategory.service'
import { Context, Next } from 'hono'

export const activityCategoryExists = async (c: Context, next: Next) => {
  const id = c.req.param('id')

  const { activityCategory } = await getOneActivityCategory(id)

  if (!activityCategory) return c.json({ status: 'fail', message: 'Activity category not found' }, 404)

  c.set('activityCategory', activityCategory)

  await next()
}
