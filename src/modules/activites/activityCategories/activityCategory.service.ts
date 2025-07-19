import { Context } from "hono";
import BaseService from "../../base.service";
import Logger, { LogLabels } from "../../../utils/logger";
import ActivityCategoryRepository from "./activityCategory.repository";
import { ActivityCategoryDTO } from "../../../types/vista-spec.types";

export default class ActivityCategoryService extends BaseService {
  protected resource = 'ActivityCategory'

  constructor() {
    super()
  }

  async getAllActivityCategories(c: Context): Promise<ActivityCategoryDTO[]> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAllActivityCategories' }
    Logger.info('Get Activity Categories documents', labels)

    const activityCategoryRepository = new ActivityCategoryRepository(c)
    const { activityCategories } = await activityCategoryRepository.getAll()

    return activityCategories
  }

  async getOneActivityCategory(c: Context, id: string): Promise<ActivityCategoryDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneActivityCategory' }
    Logger.info('Get Activity Category document', labels)

    const activityCategoryRepository = new ActivityCategoryRepository(c)
    const activityCategory = await activityCategoryRepository.getOneById(id)

    return activityCategory
  }
}