import { eq } from 'drizzle-orm'
import { Context } from 'hono'
import { ActivityCategory } from '../../../db/schema'
import { ActivityCategoryDTO } from '../../../types/vista-spec.types'
import Logger, { LogLabels } from '../../../utils/logger'
import BaseRepository from '../../base.repository'
import ActivityCategoryMapper from './activityCategory.mapper'

export default class ActivityCategoryRepository extends BaseRepository {
  protected resource = 'ActivityCategory'
  protected activityCategoryMapper: ActivityCategoryMapper

  constructor (c: Context) {
    super(c)
    this.activityCategoryMapper = new ActivityCategoryMapper(c)
  }

  /**
   * @deprecated
   */
  async getAllPaginated (query: any): Promise<{ activityCategories: ActivityCategoryDTO[] }> {
    throw new Error('Method not implemented.')
  }

  async getAll (): Promise<{ activityCategories: ActivityCategoryDTO[] }> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAllPaginated' }
    Logger.info('Get all Activity Categories documents', labels)

    const activityCategoriesDB: Array<typeof ActivityCategory.$inferSelect> = await this.drizzle
      .select()
      .from(ActivityCategory)

    const activityCategoryDTOs = await this.activityCategoryMapper.toDTOs(activityCategoriesDB)

    return {
      activityCategories: activityCategoryDTOs
    }
  }

  async getOneById (id: string): Promise<ActivityCategoryDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneById' }
    Logger.info('Get Activity Category document', labels)

    const [activityCategoryDB]: Array<typeof ActivityCategory.$inferSelect> = await this.drizzle
      .select()
      .from(ActivityCategory)
      .where(
        eq(ActivityCategory.id, id)
      )

    if (activityCategoryDB) return await this.activityCategoryMapper.toDTO(activityCategoryDB)
  }

  /**
   * @deprecated
   */
  async createOne (data: any): Promise<any> {
    throw new Error('Method not implemented.')
  }

  /**
   * @deprecated
   */
  async updateOneById (id: string, data: any): Promise<any> {
    throw new Error('Method not implemented.')
  }

  /**
   * @deprecated
   */
  async deleteOneById (id: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
