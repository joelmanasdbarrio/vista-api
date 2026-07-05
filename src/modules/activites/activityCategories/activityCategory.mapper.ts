import { Context } from 'hono'
import BaseMapper from 'src/modules/base.mapper'
import { ActivityCategoryDB, NewActivityCategoryDB } from 'src/types/database.types'
import getId from 'src/utils/getId'
import { ActivityCategoryDTO } from '../../../types/vista-spec.types'
import ActivityCategoryService from './activityCategory.service'

export default class ActivityCategoryMapper extends BaseMapper<ActivityCategoryDB, ActivityCategoryDTO> {
  private readonly c: Context

  constructor (c: Context) {
    super()
    this.c = c
  }

  async toDTO (input: ActivityCategoryDB): Promise<ActivityCategoryDTO> {
    let parentActivityCategoryDTO: ActivityCategoryDTO | undefined
    if (input.parent_id) {
      const activityCategoryService = new ActivityCategoryService()
      parentActivityCategoryDTO = await activityCategoryService.getOneActivityCategory(this.c, { id: input.parent_id })
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

  async toDTOs (input: ActivityCategoryDB[]): Promise<ActivityCategoryDTO[]> {
    return await Promise.all(input.map(this.toDTO))
  }

  toDB (data: ActivityCategoryDTO): NewActivityCategoryDB {
    const parentId = getId(data.parent)

    return {
      id: data.id,
      name: data.name,
      parent_id: parentId,
      i18nKey: data.i18nKey,
      icon: data.icon ?? null,
      color: data.color ?? null
    }
  }
}
