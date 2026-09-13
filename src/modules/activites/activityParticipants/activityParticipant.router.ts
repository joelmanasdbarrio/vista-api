import { Context, Hono } from 'hono'
import { protectedRoute } from 'src/modules/auth/auth.middleware'
import validate from 'src/utils/error_handling/middlewares/validator.middleware'
import { GetActivitySchema } from '../lib/activity.validations'
import ActivityParticipantController from './activityParticipant.controller'
import { DeleteActivityParticipantInput, GetActivityParticipantsInput, GetActivityParticipantsSchema, PostActivityParticipantInput } from './lib/activityParticipants.validations'

export default class ActivityParticipantRouter {
  public router: Hono
  protected activityParticipantController: ActivityParticipantController

  constructor () {
    this.router = new Hono()
    this.activityParticipantController = new ActivityParticipantController()

    this.router
      .use('*',
        protectedRoute,
        validate('param', GetActivitySchema)
      )
      .get('/',
        validate('query', GetActivityParticipantsSchema),
        async (c: Context<any, any, GetActivityParticipantsInput>) => {
          const res = await this.activityParticipantController.getActivityParticipants(c)
          return c.json({ ...res }, 200)
        })
      .post('/',
        async (c: Context<any, any, PostActivityParticipantInput>) => {
          const res = await this.activityParticipantController.createActivityParticipant(c)
          return c.json({ ...res }, 201)
        })
      .delete('/',
        async (c: Context<any, any, DeleteActivityParticipantInput>) => {
          await this.activityParticipantController.deleteActivityParticipant(c)
          return c.body(null, 204)
        })
  }
}
