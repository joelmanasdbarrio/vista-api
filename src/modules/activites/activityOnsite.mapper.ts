import { Context } from 'hono'
import { ActivityDB, ActivityOnsiteDB, NewActivityDB, NewActivityOnsiteDB } from 'src/types/database.types'
import { ActivityOnsiteDTO, ActivityTypeEnum } from 'src/types/vista-spec.types'
import AppError from 'src/utils/error_handling/AppError'
import getId from 'src/utils/getId'
import AccountService from '../accounts/account.service'
import BaseMapper from '../base.mapper'
import EstablishmentService from '../establishments/establishment.service'
import ActivityCategoryService from './activityCategories/activityCategory.service'

export default class ActivityOnsiteMapper extends BaseMapper<ActivityDB & ActivityOnsiteDB, ActivityOnsiteDTO> {
  private readonly c: Context

  constructor (c: Context) {
    super()
    this.c = c
  }

  async toDTO (input: ActivityDB & ActivityOnsiteDB): Promise<ActivityOnsiteDTO> {
    const accountService = new AccountService()
    const ownerDTO = await accountService.getOneAccount(this.c, { id: input.owner_id })
    if (ownerDTO == null) throw new AppError(404, 'Activity owner not found', { code: 'ACTIVITY_OWNER_NOT_FOUND', message: 'Activity owner not found' })

    const activityCategoryService = new ActivityCategoryService()
    const categoryDTO = await activityCategoryService.getOneActivityCategory(this.c, { id: input.category_id })
    if (categoryDTO == null) throw new AppError(404, 'Activity category not found', { code: 'ACTIVITY_CATEGORY_NOT_FOUND', message: 'Activity category not found' })

    let establishmentDTO
    if (input.location_establishment_id) {
      const estalblishmentService = new EstablishmentService()
      establishmentDTO = await estalblishmentService.getOneEstablishment(this.c, { id: input.location_establishment_id })
    }

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
      location: establishmentDTO ?? {
        coordinates: {
          latitude: input.location_coordinates.y ?? 0,
          longitude: input.location_coordinates.x ?? 0
        }
      },
      createdAt: input.created_at ? input.created_at.toISOString() : undefined,
      updatedAt: input.updated_at ? input.updated_at.toISOString() : undefined,
      type: ActivityTypeEnum.ONSITE,
      activityType: 'ActivityOnsiteDTO'
    }
  }

  async toDTOs (input: Array<ActivityDB & ActivityOnsiteDB>): Promise<ActivityOnsiteDTO[]> {
    return await Promise.all(input.map(this.toDTO))
  }

  toDB (data: ActivityOnsiteDTO): { activity: NewActivityDB, activityOnsite: NewActivityOnsiteDB } {
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

    const activityOnsiteData: NewActivityOnsiteDB = {
      activity_id: data.id,
      location_coordinates: {
        x: typeof data.location === 'object' && 'coordinates' in data.location
          ? data.location.coordinates?.longitude ?? 0
          : 0,
        y: typeof data.location === 'object' && 'coordinates' in data.location
          ? data.location.coordinates?.latitude ?? 0
          : 0
      },
      location_establishment_id: typeof data.location === 'object' && 'id' in data.location
        ? data.location.id ?? null
        : null
    }

    return {
      activity: activityData,
      activityOnsite: activityOnsiteData
    }
  }
}
