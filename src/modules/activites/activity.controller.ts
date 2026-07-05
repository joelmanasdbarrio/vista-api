import { Context } from 'hono'
import { ActivitiesResponse, ActivityResponse } from 'src/types/vista-spec.types'
import AppError from 'src/utils/error_handling/AppError'
import Logger, { LogLabels } from 'src/utils/logger'
import BaseController from '../base.controller'
import { ActivityService } from './activity.service'
import { DeleteActivityInput, GetActivitiesInput, GetActivityInput, PatchActivityInput, PostActivityInput } from './lib/activity.validations'

export default class ActivityController extends BaseController {
  protected resource = 'Activity'
  protected activityService: ActivityService

  constructor () {
    super()
    this.activityService = new ActivityService()
  }

  async getActivities (c: Context<any, any, GetActivitiesInput>): Promise<ActivitiesResponse> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getActivities' }
    Logger.info('Get all Activity documents paginated', labels)

    const { data, _meta } = await this.activityService.getAllActivitiesPaginated(c, c.req.valid('query'))

    Logger.info(`Found ${data.length} activity(ies)`, labels)
    Logger.debug(data)

    return {
      status: 'success',
      data,
      _meta
    }
  }

  async getActivity (c: Context<any, any, GetActivityInput>): Promise<ActivityResponse> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getActivity' }
    Logger.info('Get Activity document by ID', labels)

    const { id } = c.req.param()
    const activity = await this.activityService.getOneActivity(c, { id })

    if (activity == null) {
      throw new AppError(404, `Activity with ID "${id}" not found`, {
        code: 'ACTIVITY_NOT_FOUND',
        message: `Activity with ID "${id}" not found`,
        details: 'Please, check if the desired ID is correctly typed'
      })
    }

    Logger.info(`Found Activity "${activity.title}" (${String(activity.id)})`, labels)
    Logger.debug(activity)

    return {
      status: 'success',
      data: activity
    }
  }

  async createActivity (c: Context<any, any, PostActivityInput>): Promise<ActivityResponse> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'createActivity' }
    Logger.info('Create a new Activity document', labels)

    const body = c.req.valid('json')
    const activity = await this.activityService.createActivity(c, body)

    Logger.info(`Created Activity (${String(activity.id)})`, labels)
    Logger.debug(activity)

    return {
      status: 'success',
      data: activity
    }
  }

  async updateActivity (c: Context<any, any, PatchActivityInput>): Promise<ActivityResponse> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateActivity' }
    Logger.info('Update an Activity document', labels)

    const { id } = c.req.param()
    const body = c.req.valid('json')
    const activity = await this.activityService.updateOneActivity(c, id, body)

    Logger.info(`Updated Activity (${String(activity.id)})`, labels)
    Logger.debug(activity)

    return {
      status: 'success',
      data: activity
    }
  }

  async deleteActivity (c: Context<any, any, DeleteActivityInput>): Promise<void> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'deleteActivity' }
    Logger.info('Delete an Activity document', labels)

    const { id } = c.req.param()
    await this.activityService.deleteOneActivity(c, { id })

    Logger.info(`Deleted Activity with ID "${id}"`, labels)
  }
}
