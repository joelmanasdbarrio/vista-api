import { Context } from 'hono'
import BaseController from 'src/modules/base.controller'
import { ActivityParticipantResponse, ActivityParticipantsResponse } from 'src/types/vista-spec.types'
import AppError from 'src/utils/error_handling/AppError'
import Logger, { LogLabels } from 'src/utils/logger'
import { ActivityService } from '../activity.service'
import ActivityParticipantService from './activityParticipant.service'
import { DeleteActivityParticipantInput, GetActivityParticipantsInput, PostActivityParticipantInput } from './lib/activityParticipants.validations'

export default class ActivityParticipantController extends BaseController {
  protected resource = 'ActivityParticipant'
  protected activityParticipantService: ActivityParticipantService
  protected activityService: ActivityService

  constructor () {
    super()
    this.activityParticipantService = new ActivityParticipantService()
    this.activityService = new ActivityService()
  }

  async getActivityParticipants (c: Context<any, any, GetActivityParticipantsInput>): Promise<ActivityParticipantsResponse> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getActivityParticipants' }
    Logger.info('Get all ActivityParticipant documents paginated', labels)

    const { id: activityId } = c.req.param()
    const { data, _meta } = await this.activityParticipantService.getAllActivityParticipantsPaginated(c, { ...c.req.valid('query'), activityId })

    Logger.info(`Found ${data.length} activity participant(s)`, labels)
    Logger.debug(data)

    return {
      status: 'success',
      data,
      _meta
    }
  }

  async createActivityParticipant (c: Context<any, any, PostActivityParticipantInput>): Promise<ActivityParticipantResponse> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'createActivityParticipant' }
    Logger.info('Create a new ActivityParticipant document', labels)

    const { id: activityId } = c.req.param()
    const activity = await this.activityService.getOneActivity(c, { id: activityId })

    if (activity == null) {
      throw new AppError(404, `Activity with ID "${activityId}" not found`, {
        code: 'ACTIVITY_NOT_FOUND',
        message: `Activity with ID "${activityId}" not found`,
        details: 'Please, check if the desired ID is correctly typed'
      })
    }

    const { id: accountId } = c.get('user')
    const activityParticipant = await this.activityParticipantService.createActivityParticipant(c, { accountId, activityId })

    Logger.info(`Created ActivityParticipant with ID "${String(activityParticipant.id)}"`, labels)
    Logger.debug(activityParticipant)

    return {
      status: 'success',
      data: activityParticipant
    }
  }

  async deleteActivityParticipant (c: Context<any, any, DeleteActivityParticipantInput>): Promise<void> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'deleteActivityParticipant' }
    Logger.info('Delete ActivityParticipant document by composite key', labels)

    const { id: activityId } = c.req.param()
    const activity = await this.activityService.getOneActivity(c, { id: activityId })

    if (activity == null) {
      throw new AppError(404, `Activity with ID "${activityId}" not found`, {
        code: 'ACTIVITY_NOT_FOUND',
        message: `Activity with ID "${activityId}" not found`,
        details: 'Please, check if the desired ID is correctly typed'
      })
    }

    const { id: accountId } = c.get('user')
    await this.activityParticipantService.deleteActivityParticipant(c, { activityId, accountId })

    Logger.info(`Deleted ActivityParticipant for Activity ID "${activityId}" and Account ID "${accountId}"`, labels)
  }
}
