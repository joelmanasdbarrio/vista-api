import { Context } from 'hono'
import { ActivityCategoryDTO } from '../../../types/vista-spec.types'
import Logger, { LogLabels } from '../../../utils/logger'
import BaseService from '../../base.service'
import ActivityCategoryRepository from './activityCategory.repository'
import { GetActivityCategoryParam } from './lib/activityCategory.validations'

export default class ActivityCategoryService extends BaseService {
  protected resource = 'ActivityCategory'

  async getAllActivityCategories (c: Context): Promise<ActivityCategoryDTO[]> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAllActivityCategories' }
    Logger.info('Get Activity Categories documents', labels)

    const activityCategoryRepository = new ActivityCategoryRepository(c)
    const { activityCategories } = await activityCategoryRepository.getAll()

    return activityCategories
  }

  async getOneActivityCategory (c: Context, { id }: GetActivityCategoryParam): Promise<ActivityCategoryDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneActivityCategory' }
    Logger.info('Get Activity Category document', labels)

    const activityCategoryRepository = new ActivityCategoryRepository(c)
    return await activityCategoryRepository.getOneById(id)
  }

  async getManyActivityCategoriesByIds (c: Context, ids: string[]): Promise<ActivityCategoryDTO[]> {
    const activityCategoryRepository = new ActivityCategoryRepository(c)
    return await activityCategoryRepository.getManyByIds(ids)
  }
}
