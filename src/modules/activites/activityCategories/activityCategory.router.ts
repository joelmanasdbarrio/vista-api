import { Hono } from 'hono'
import { protectedRoute } from '../../auth/auth.middleware'
import ActivityCategoryController from './activityCategory.controller'

export default class ActivityCategoryRouter {
  public router: Hono
  protected activityCategoryController: ActivityCategoryController

  constructor () {
    this.router = new Hono()
    this.activityCategoryController = new ActivityCategoryController()

    this.router
      .use('*', protectedRoute)
      .get('/',
        async (c) => {
          const res = await this.activityCategoryController.getActivityCategories(c)
          return c.json({ ...res }, 200)
        })
  }
}
