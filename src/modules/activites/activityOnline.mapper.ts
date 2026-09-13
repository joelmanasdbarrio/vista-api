import { Context } from 'hono'
import { ActivityDB, ActivityOnlineDB, NewActivityDB, NewActivityOnlineDB } from 'src/types/database.types'
import { ActivityOnlineDTO, ActivityTypeEnum } from 'src/types/vista-spec.types'
import AppError from 'src/utils/error_handling/AppError'
import getId from 'src/utils/getId'
import AccountService from '../accounts/account.service'
import BaseMapper from '../base.mapper'
import ActivityCategoryService from './activityCategories/activityCategory.service'

export default class ActivityOnlineMapper extends BaseMapper<ActivityDB & ActivityOnlineDB, ActivityOnlineDTO> {
  private readonly c: Context

  constructor (c: Context) {
    super()
    this.c = c
  }

  async toDTO (input: ActivityDB & ActivityOnlineDB): Promise<ActivityOnlineDTO> {
    const accountService = new AccountService()
    const ownerDTO = await accountService.getOneAccount(this.c, { id: input.owner_id })
    if (ownerDTO == null) throw new AppError(404, 'Activity owner not found', { code: 'ACTIVITY_OWNER_NOT_FOUND', message: 'Activity owner not found' })

    const activityCategoryService = new ActivityCategoryService()
    const categoryDTO = await activityCategoryService.getOneActivityCategory(this.c, { id: input.category_id })
    if (categoryDTO == null) throw new AppError(404, 'Activity category not found', { code: 'ACTIVITY_CATEGORY_NOT_FOUND', message: 'Activity category not found' })

    return {
      id: input.activity_id,
      owner: ownerDTO,
      category: categoryDTO,
      title: input.title,
      description: input.description ?? '',
      images: input.images ?? [],
      time: {
        start: input.time_start ? input.time_start.toISOString() : undefined,
        end: input.time_end ? input.time_end.toISOString() : undefined
      },
      price: {
        min: input.price_min ?? 0,
        max: input.price_max ?? 0,
        currency: input.price_currency ?? 'USD'
      },
      participants: {
        min: input.participants_min ?? 0,
        max: input.participants_max ?? 0
      },
      language: input.language ?? 'en',
      website: input.website ?? '',
      isDraft: input.is_draft ?? true,
      location: {
        url: input.location_url
      },
      createdAt: input.created_at ? input.created_at.toISOString() : undefined,
      updatedAt: input.updated_at ? input.updated_at.toISOString() : undefined,
      type: ActivityTypeEnum.ONLINE,
      activityType: 'ActivityOnlineDTO'
    }
  }

  async toDTOs (input: Array<ActivityDB & ActivityOnlineDB>): Promise<ActivityOnlineDTO[]> {
    const ownerIds = [...new Set(input.map(activity => activity.owner_id))]
    const categoryIds = [...new Set(input.map(activity => activity.category_id))]
    const [owners, categories] = await Promise.all([
      new AccountService().getManyAccountsByIds(this.c, ownerIds),
      new ActivityCategoryService().getManyActivityCategoriesByIds(this.c, categoryIds)
    ])
    const ownersById = new Map(owners.map(owner => [owner.id, owner]))
    const categoriesById = new Map(categories.map(category => [category.id, category]))

    return input.map(activity => {
      const owner = ownersById.get(activity.owner_id)
      const category = categoriesById.get(activity.category_id)
      if (owner == null) throw new AppError(404, 'Activity owner not found', { code: 'ACTIVITY_OWNER_NOT_FOUND', message: 'Activity owner not found' })
      if (category == null) throw new AppError(404, 'Activity category not found', { code: 'ACTIVITY_CATEGORY_NOT_FOUND', message: 'Activity category not found' })

      return {
        id: activity.activity_id,
        owner,
        category,
        title: activity.title,
        description: activity.description ?? '',
        images: activity.images ?? [],
        time: {
          start: activity.time_start ? activity.time_start.toISOString() : undefined,
          end: activity.time_end ? activity.time_end.toISOString() : undefined
        },
        price: { min: activity.price_min ?? 0, max: activity.price_max ?? 0, currency: activity.price_currency ?? 'USD' },
        participants: { min: activity.participants_min ?? 0, max: activity.participants_max ?? 0 },
        language: activity.language ?? 'en',
        website: activity.website ?? '',
        isDraft: activity.is_draft ?? true,
        location: { url: activity.location_url },
        createdAt: activity.created_at ? activity.created_at.toISOString() : undefined,
        updatedAt: activity.updated_at ? activity.updated_at.toISOString() : undefined,
        type: ActivityTypeEnum.ONLINE,
        activityType: 'ActivityOnlineDTO'
      }
    })
  }

  toDB (data: ActivityOnlineDTO): { activity: NewActivityDB, activityOnline: NewActivityOnlineDB } {
    if (!data.id) {
      throw new AppError(400, 'Activity ID is required', {
        code: 'ACTIVITY_ID_REQUIRED',
        message: 'Activity ID is required',
        details: 'Please, provide a valid ID for the activity.'
      })
    }

    const ownerId = getId(data.owner)
    if (!ownerId) {
      throw new AppError(400, 'Activity owner ID is required', {
        code: 'ACTIVITY_OWNER_ID_REQUIRED',
        message: 'Activity owner ID is required',
        details: 'Please, provide a valid owner ID for the activity.'
      })
    }

    const categoryId = getId(data.category)
    if (!categoryId) {
      throw new AppError(400, 'Activity category ID is required', {
        code: 'ACTIVITY_CATEGORY_ID_REQUIRED',
        message: 'Activity category ID is required',
        details: 'Please, provide a valid category ID for the activity.'
      })
    }

    const activityData: NewActivityDB = {
      owner_id: ownerId,
      category_id: categoryId,
      title: data.title,
      description: data.description,
      images: data.images ?? [],
      time_start: data.time?.start ? new Date(data.time.start) : new Date(),
      time_end: data.time?.end ? new Date(data.time.end) : new Date(),
      price_min: data.price?.min ?? 0,
      price_max: data.price?.max ?? 0,
      price_currency: data.price?.currency ?? 'USD',
      participants_min: data.participants?.min ?? null,
      participants_max: data.participants?.max ?? null,
      language: data.language,
      website: data.website ?? null,
      is_draft: data.isDraft
    }

    const activityOnlineData: NewActivityOnlineDB = {
      activity_id: data.id,
      location_url: data.location.url
    }

    return {
      activity: activityData,
      activityOnline: activityOnlineData
    }
  }
}
