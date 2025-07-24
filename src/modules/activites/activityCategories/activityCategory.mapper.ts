import { Context } from 'hono'
import { ActivityCategory } from '../../../db/schema'
import { ActivityCategoryDTO } from '../../../types/vista-spec.types'
import ActivityCategoryService from './activityCategory.service'

export default class ActivityCategoryMapper {
  private readonly c: Context

  constructor (c: Context) {
    this.c = c
  }

  async toDTO (input: typeof ActivityCategory.$inferSelect): Promise<ActivityCategoryDTO> {
    let parentActivityCategoryDTO: ActivityCategoryDTO | undefined
    if (input.parent_id) {
      const activityCategoryService = new ActivityCategoryService()
      parentActivityCategoryDTO = await activityCategoryService.getOneActivityCategory(this.c, input.parent_id)
    }

    return {
      id: input.id,
      parent: parentActivityCategoryDTO,
      name: input.name,
      i18nKey: input.i18nKey,
      icon: input.icon ?? '',
      color: input.color ?? '',
      createdAt: input.created_at ? input.created_at.toISOString() : undefined,
      updatedAt: input.updated_at ? input.updated_at.toISOString() : undefined
    }
  }

  async toDTOs (input: Array<typeof ActivityCategory.$inferSelect>): Promise<ActivityCategoryDTO[]> {
    return await Promise.all(input.map(this.toDTO))
  }
}
