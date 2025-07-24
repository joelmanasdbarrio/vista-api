import { Context } from 'hono'
import BaseController from '../../base.controller'
import logger, { LogLabels } from '../../../utils/logger'
import { ActivityCategoriesResponse } from '../../../types/vista-spec.types'
import ActivityCategoryService from './activityCategory.service'

export default class ActivityCategoryController extends BaseController {
  protected resource = 'ActivityCategory'
  protected activityCategoryService: ActivityCategoryService

  constructor () {
    super()
    this.activityCategoryService = new ActivityCategoryService()
  }

  async getActivityCategories (c: Context): Promise<ActivityCategoriesResponse> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getActivityCategories' }
    logger.info('Get all Activity Categories', labels)

    const activityCategories = await this.activityCategoryService.getAllActivityCategories(c)

    logger.info(`Found ${activityCategories.length} category(s)`, labels)
    logger.debug(activityCategories)

    return {
      status: 'success',
      data: activityCategories
    }
  }
}
