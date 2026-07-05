import { Context, Hono } from 'hono'
import { protectedRoute } from 'src/modules/auth/auth.middleware'
import validate from 'src/utils/error_handling/middlewares/validator.middleware'
import ActivityController from './activity.controller'
import ActivityCategoryRouter from './activityCategories/activityCategory.router'
import { DeleteActivityInput, DeleteActivitySchema, GetActivitiesInput, GetActivitiesSchema, GetActivityInput, GetActivitySchema, PatchActivityInput, PatchActivitySchema, PostActivityInput, PostActivitySchema } from './lib/activity.validations'

export default class ActivityRouter {
  public router: Hono
  protected activityController: ActivityController

  constructor () {
    this.router = new Hono()
    this.activityController = new ActivityController()

    this.router
      .all('/', protectedRoute)
      .get('/',
        validate('query', GetActivitiesSchema),
        async (c: Context<any, any, GetActivitiesInput>) => {
          const res = await this.activityController.getActivities(c)
          return c.json({ ...res }, 200)
        })
      .get('/:id',
        validate('param', GetActivitySchema),
        async (c: Context<any, any, GetActivityInput>) => {
          const res = await this.activityController.getActivity(c)
          return c.json({ ...res }, 200)
        })
      .post('/',
        validate('json', PostActivitySchema),
        async (c: Context<any, any, PostActivityInput>) => {
          const res = await this.activityController.createActivity(c)
          return c.json({ ...res }, 201)
        })
      .patch('/:id',
        validate('json', PatchActivitySchema),
        async (c: Context<any, any, PatchActivityInput>) => {
          const res = await this.activityController.updateActivity(c)
          return c.json({ ...res }, 200)
        })
      .delete('/:id',
        validate('param', DeleteActivitySchema),
        async (c: Context<any, any, DeleteActivityInput>) => {
          await this.activityController.deleteActivity(c)
          return c.body(null, 204)
        })

      .route('/categories', new ActivityCategoryRouter().router)
      .route('/:id/participants', new ActivityCategoryRouter().router)
  }
}
