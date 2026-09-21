import { Context, Next } from 'hono'
import AppError from 'src/utils/error_handling/AppError'
import '../../../types/hono.types'
import ActivityCategoryService from './activityCategory.service'

export const activityCategoryExists = async (c: Context, next: Next): Promise<void> => {
  const id = c.req.param('id')

  const activityCategoryService = new ActivityCategoryService()
  const activityCategory = await activityCategoryService.getOneActivityCategory(c, { id })

  if (activityCategory == null) {
    throw new AppError(404, `Activity Category with ID "${id}" not found`, {
      code: 'ACTIVITY_CATEGORY_NOT_FOUND',
      message: `Activity Category with ID "${id}" not found`,
      details: 'Please, check if the desired ID is typed correctly'
    })
  }

  c.set('activityCategory', activityCategory)

  await next()
}
