import { Context } from 'hono'
import { AccountDTO, AccountTypeEnum, ActivitiesPaginatedDTO, ActivityCategoryDTO, ActivityOnlineDTO, ActivityOnsiteDTO, ActivityTypeEnum, EstablishmentDTO, EstablishmentRequestDTO, EstablishmentRequestStatusEnum } from 'src/types/vista-spec.types'
import AppError from 'src/utils/error_handling/AppError'
import getId from 'src/utils/getId'
import Logger, { LogLabels } from 'src/utils/logger'
import AccountService from '../accounts/account.service'
import BaseService from '../base.service'
import { CoordinatesDTO } from '../establishments/addresses/lib/address.validations'
import EstablishmentService from '../establishments/establishment.service'
import EstablishmentRequestService from '../establishments/establishmentRequests/establishmentRequest.service'
import ActivityRepository from './activity.repository'
import ActivityCategoryService from './activityCategories/activityCategory.service'
import { ActivityOnlineSchema, ActivityOnsiteSchema, GetActivitiesQuery, GetActivityParam, PatchActivityBody, PostActivityBody } from './lib/activity.validations'

export class ActivityService extends BaseService {
  protected resource = 'Activity'

  async getAllActivitiesPaginated (c: Context, query: GetActivitiesQuery): Promise<ActivitiesPaginatedDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAllActivitiesPaginated' }
    Logger.info('Get Activity documents paginated', labels)

    const activityRepository = new ActivityRepository(c)
    const { activities, totalActivities } = await activityRepository.getAllPaginated(query)

    return {
      data: activities,
      _meta: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        results: activities.length,
        total: totalActivities
      }
    }
  }

  async getOneActivity (c: Context, { id }: GetActivityParam): Promise<ActivityOnsiteDTO | ActivityOnlineDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneActivity' }
    Logger.info(`Get Activity document by ID "${id}"`, labels)

    const activityRepository = new ActivityRepository(c)
    return await activityRepository.getOneById(id)
  }

  async createActivity (c: Context, body: PostActivityBody): Promise<ActivityOnlineDTO | ActivityOnsiteDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'createActivity' }
    Logger.info('Create a new Activity document', labels)

    const authenticatedUser = c.get('user')
    const suppliedOwnerId = getId(body.owner)
    if (suppliedOwnerId && suppliedOwnerId !== authenticatedUser.id) {
      throw new AppError(403, 'Forbidden', {
        code: 'FORBIDDEN',
        message: 'Forbidden',
        details: 'You cannot create an activity for another user.'
      })
    }

    const accountService = new AccountService()
    const ownerDTO = await accountService.getOneAccount(c, { id: authenticatedUser.id })
    if (ownerDTO == null) {
      throw new AppError(401, 'Unauthorized', {
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
        details: 'Your account no longer exists. Please log in again.'
      })
    }

    const categoryId = getId(body.category)
    const activityCategoryService = new ActivityCategoryService()
    const categoryDTO = await activityCategoryService.getOneActivityCategory(c, { id: categoryId })
    if (categoryDTO == null) {
      throw new AppError(404, `Activity Category with ID "${categoryId}" not found`, {
        code: 'ACTIVITY_CATEGORY_NOT_FOUND',
        message: `Activity Category with ID "${categoryId}" not found`,
        details: 'Please check if the category ID is correct.'
      })
    }

    if (body.activityType === ActivityTypeEnum.ONLINE) {
      return await this.createOnlineActivity(c, body, ownerDTO, categoryDTO)
    } else if (body.activityType === ActivityTypeEnum.ONSITE) {
      return await this.createOnsiteActivity(c, body, ownerDTO, categoryDTO)
    } else {
      throw new AppError(400, `Invalid activity type "${String(body.activityType)}"`, {
        code: 'INVALID_ACTIVITY_TYPE',
        message: 'Invalid activity type',
        details: `The activity type "${String(body.activityType)}" is not supported. Please, use ${Object.values(ActivityTypeEnum).join(', ')} instead.`
      })
    }
  }

  private async createOnlineActivity (c: Context, body: PostActivityBody, ownerDTO: AccountDTO, categoryDTO: ActivityCategoryDTO): Promise<ActivityOnlineDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'createOnlineActivity' }
    Logger.info('Create a new Online Activity document', labels)

    const locationURL = this.getOnlineLocation(c, body)
    if (locationURL == null) {
      throw new AppError(400, 'Online activities require a URL location', {
        code: 'INVALID_ONLINE_ACTIVITY_LOCATION',
        message: 'Online activities require a URL location',
        details: 'Please provide a valid URL for the online activity location.'
      })
    }

    const parsedBody = ActivityOnlineSchema.parse(body)

    const activityOnlineToCreate: ActivityOnlineDTO = {
      ...parsedBody,
      owner: ownerDTO,
      category: categoryDTO,
      time: {
        start: new Date(parsedBody.time.start).toISOString(),
        end: new Date(parsedBody.time.end).toISOString()
      },
      location: {
        url: locationURL.toString()
      }
    }

    const activityRepository = new ActivityRepository(c)
    return await activityRepository.createActivityOnline(activityOnlineToCreate)
  }

  private async createOnsiteActivity (c: Context, body: PostActivityBody, ownerDTO: AccountDTO, categoryDTO: ActivityCategoryDTO): Promise<ActivityOnsiteDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'createOnsiteActivity' }
    Logger.info('Create a new Onsite Activity document', labels)

    const newLocation = await this.getOnsiteLocation(c, body)
    if (newLocation == null) {
      throw new AppError(400, 'Invalid location for onsite activity', {
        code: 'INVALID_ONSITE_ACTIVITY_LOCATION',
        message: 'Invalid location for onsite activity',
        details: 'Please provide a valid establishment ID or coordinates.'
      })
    }

    const user = c.get('user')
    if ('id' in newLocation && (user.type === AccountTypeEnum.PERSONAL || !user.isVerified)) {
      throw new AppError(403, 'Forbidden', {
        code: 'FORBIDDEN',
        message: 'Forbidden',
        details: 'You must use a verified enterprise account to create onsite activities in establishments.'
      })
    }

    const parsedBody = ActivityOnsiteSchema.parse(body)

    const activityOnsiteToCreate: ActivityOnsiteDTO = {
      ...parsedBody,
      owner: ownerDTO,
      category: categoryDTO,
      time: {
        start: new Date(parsedBody.time.start).toISOString(),
        end: new Date(parsedBody.time.end).toISOString()
      },
      location: newLocation
    }

    const activityRepository = new ActivityRepository(c)
    const activity = await activityRepository.createActivityOnsite(activityOnsiteToCreate)

    if ('id' in newLocation) {
      const establishmentOwnerId = 'owner' in newLocation ? (typeof newLocation.owner === 'string' ? newLocation.owner : newLocation.owner.id) : null
      if (establishmentOwnerId && JSON.stringify(c.get('user').id) !== JSON.stringify(establishmentOwnerId)) {
        await this.findOrCreateEstablishmentRequest(c, newLocation, activity)
      }
    }

    return activity
  }

  async updateOneActivity (c: Context, id: string, body: PatchActivityBody): Promise<ActivityOnlineDTO | ActivityOnsiteDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateOneActivity' }
    Logger.info('Update Activity document', labels)

    if ((body.id !== null) && (JSON.stringify(body.id) !== JSON.stringify(id))) {
      throw new AppError(400, 'Bad Request', {
        code: 'ACTIVITY_ID_MISMATCH',
        message: 'Activity ID mismatch',
        details: 'The provided ID does not match the Activity ID in the body.'
      })
    }

    const activityDTO = await this.getOneActivity(c, { id })
    if (activityDTO == null) {
      throw new AppError(404, `Activity with ID "${id}" not found`, {
        code: 'ACTIVITY_NOT_FOUND',
        message: `Activity with ID "${id}" not found`,
        details: 'Please, check if the desired ID is correctly typed.'
      })
    }

    const ownerId = getId(activityDTO.owner)
    if (JSON.stringify(c.get('user').id) !== JSON.stringify(ownerId)) {
      throw new AppError(403, 'Forbidden', {
        code: 'FORBIDDEN',
        message: 'Forbidden',
        details: 'You do not have permission to update this activity.'
      })
    }

    // Owner and activity type are immutable
    const bodyOwnerId = getId(body.owner)
    if (bodyOwnerId && bodyOwnerId !== ownerId) {
      throw new AppError(403, 'Forbidden', {
        code: 'FORBIDDEN',
        message: 'Forbidden',
        details: 'Activity owner cannot be changed.'
      })
    }

    if (body.activityType && body.activityType !== activityDTO.type) {
      throw new AppError(400, 'Bad Request', {
        code: 'IMMUTABLE_FIELD',
        message: 'Activity type cannot be changed',
        details: `Activity type is immutable. This activity is ${activityDTO.type}.`
      })
    }

    const newOwner = activityDTO.owner as AccountDTO

    const bodyCategoryId = getId(body.category)
    let newCategory: ActivityCategoryDTO | undefined
    if (bodyCategoryId && bodyCategoryId !== (typeof activityDTO.category === 'string' ? activityDTO.category : activityDTO.category.id)) {
      const activityCategoryService = new ActivityCategoryService()
      newCategory = await activityCategoryService.getOneActivityCategory(c, { id: bodyCategoryId })
      if (newCategory == null) {
        throw new AppError(404, `Activity Category with ID "${bodyCategoryId}" not found`, {
          code: 'ACTIVITY_CATEGORY_NOT_FOUND',
          message: `Activity Category with ID "${bodyCategoryId}" not found`,
          details: 'Please, check if the desired ID is correctly typed.'
        })
      }
    } else {
      newCategory = activityDTO.category as ActivityCategoryDTO
    }

    // Dispatch to subtype-specific update based on persisted activity type
    if (activityDTO.type === ActivityTypeEnum.ONLINE) {
      return await this.updateOnlineActivity(c, id, body, newOwner, newCategory, activityDTO)
    } else if (activityDTO.type === ActivityTypeEnum.ONSITE) {
      return await this.updateOnsiteActivity(c, id, body, newOwner, newCategory, activityDTO)
    } else {
      const unknownType = (activityDTO as any).type
      throw new AppError(400, `Invalid activity type "${String(unknownType)}"`, {
        code: 'INVALID_ACTIVITY_TYPE',
        message: 'Invalid activity type',
        details: `The activity type "${String(unknownType)}" is not supported.`
      })
    }
  }

  private async updateOnlineActivity (c: Context, id: string, body: PatchActivityBody, ownerDTO: AccountDTO, categoryDTO: ActivityCategoryDTO, activityDTO: ActivityOnlineDTO): Promise<ActivityOnlineDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateOnlineActivity' }
    Logger.info('Update Online Activity document', labels)

    const locationURL = this.getOnlineLocation(c, body) ?? activityDTO.location.url

    const activityOnlineToUpdate: ActivityOnlineDTO = {
      owner: ownerDTO,
      category: categoryDTO,
      title: body.title ?? activityDTO.title,
      description: body.description ?? activityDTO.description,
      images: body.images ?? activityDTO.images,
      time: {
        start: ((body.time?.start) != null) ? new Date(body.time.start).toISOString() : activityDTO.time.start,
        end: ((body.time?.end) != null) ? new Date(body.time.end).toISOString() : activityDTO.time.end
      },
      price: {
        min: body.price?.min ?? activityDTO.price?.min ?? 0,
        max: body.price?.max ?? activityDTO.price?.max ?? 0,
        currency: body.price?.currency ?? activityDTO.price?.currency
      },
      participants: {
        min: body.participants?.min ?? activityDTO.participants?.min,
        max: body.participants?.max ?? activityDTO.participants?.max
      },
      language: body.language ?? activityDTO.language,
      website: body.website ?? activityDTO.website,
      isDraft: body.isDraft ?? activityDTO.isDraft,
      location: {
        url: locationURL.toString()
      },
      updatedAt: new Date().toISOString(),
      type: ActivityTypeEnum.ONLINE,
      activityType: 'ActivityOnlineDTO'
    }

    const activityRepository = new ActivityRepository(c)
    return await activityRepository.updateActivityOnlineById(id, activityOnlineToUpdate)
  }

  private async updateOnsiteActivity (c: Context, id: string, body: PatchActivityBody, ownerDTO: AccountDTO, categoryDTO: ActivityCategoryDTO, activityDTO: ActivityOnsiteDTO): Promise<ActivityOnsiteDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateOnsiteActivity' }
    Logger.info('Update Onsite Activity document', labels)

    let isDraft = body.isDraft ?? activityDTO.isDraft

    const newLocation = await this.getOnsiteLocation(c, body) ?? activityDTO.location
    if (newLocation && typeof newLocation === 'object' && 'id' in newLocation) {
      const user = c.get('user')
      if (user.type === AccountTypeEnum.PERSONAL || !user.isVerified) {
        throw new AppError(403, 'Forbidden', {
          code: 'FORBIDDEN',
          message: 'Forbidden',
          details: 'You must use a verified enterprise account to create onsite activities in establishments.'
        })
      }

      const establishmentRequest = await this.findOrCreateEstablishmentRequest(c, newLocation, activityDTO)
      if (establishmentRequest.status !== EstablishmentRequestStatusEnum.APPROVED) {
        isDraft = true
      }
    }

    const activityOnsiteToUpdate: ActivityOnsiteDTO = {
      owner: ownerDTO,
      category: categoryDTO,
      title: body.title ?? activityDTO.title,
      description: body.description ?? activityDTO.description,
      images: body.images ?? activityDTO.images,
      time: {
        start: ((body.time?.start) != null) ? new Date(body.time.start).toISOString() : activityDTO.time.start,
        end: ((body.time?.end) != null) ? new Date(body.time.end).toISOString() : activityDTO.time.end
      },
      price: {
        min: body.price?.min ?? activityDTO.price?.min ?? 0,
        max: body.price?.max ?? activityDTO.price?.max ?? 0,
        currency: body.price?.currency ?? activityDTO.price?.currency
      },
      participants: {
        min: body.participants?.min ?? activityDTO.participants?.min,
        max: body.participants?.max ?? activityDTO.participants?.max
      },
      language: body.language ?? activityDTO.language,
      website: body.website ?? activityDTO.website,
      isDraft,
      location: newLocation,
      updatedAt: new Date().toISOString(),
      type: ActivityTypeEnum.ONSITE,
      activityType: 'ActivityOnsiteDTO'
    }

    const activityRepository = new ActivityRepository(c)
    return await activityRepository.updateActivityOnsiteById(id, activityOnsiteToUpdate)
  }

  async deleteOneActivity (c: Context, { id }: GetActivityParam): Promise<void> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'deleteOneActivity' }
    Logger.info(`Delete Activity document by ID "${id}"`, labels)

    const activity = await this.getOneActivity(c, { id })
    if (activity == null) {
      throw new AppError(404, 'Not Found', {
        code: 'ACTIVITY_NOT_FOUND',
        message: 'Activity not found',
        details: `No activity found with ID "${id}"`
      })
    }

    const ownerId = getId(activity.owner)
    if (JSON.stringify(c.get('user').id) !== JSON.stringify(ownerId)) {
      throw new AppError(403, 'Forbidden', {
        code: 'FORBIDDEN',
        message: 'Forbidden',
        details: 'You do not have permission to delete this activity.'
      })
    }

    const activityRepository = new ActivityRepository(c)
    return await activityRepository.deleteOneById(id)
  }

  private getOnlineLocation (c: Context, body: PostActivityBody | PatchActivityBody): URL | undefined {
    if (body.location && typeof body.location === 'string') {
      try {
        return new URL(body.location)
      } catch (error) {
        throw new AppError(400, `Invalid URL format: "${body.location}"`, {
          code: 'INVALID_URL_FORMAT',
          message: 'Invalid URL format',
          details: 'Please, provide a valid URL (e.g., https://example.com/meeting).'
        })
      }
    }
  }

  private async getOnsiteLocation (c: Context, body: PostActivityBody | PatchActivityBody): Promise<EstablishmentDTO | CoordinatesDTO | undefined> {
    if (body.location) {
      const establishmentId = getId(body.location)
      if (establishmentId) {
        const establishmentService = new EstablishmentService()
        const establishmentDTO = await establishmentService.getOneEstablishment(c, { id: establishmentId })
        if (establishmentDTO == null) {
          throw new AppError(404, `Establishment with ID "${establishmentId}" not found`, {
            code: 'ESTABLISHMENT_NOT_FOUND',
            message: `Establishment with ID "${establishmentId}" not found`,
            details: 'Please, check if the desired ID is correctly typed.'
          })
        }
        return establishmentDTO
      }

      if (typeof body.location === 'object' && 'coordinates' in body.location) {
        return {
          coordinates: {
            latitude: body.location.coordinates.latitude,
            longitude: body.location.coordinates.longitude
          }
        }
      }
    }
  }

  private async findOrCreateEstablishmentRequest (c: Context, newLocation: EstablishmentDTO, activity: ActivityOnsiteDTO): Promise<EstablishmentRequestDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'findOrCreateEstablishmentRequest' }
    Logger.info('Find or create a new Establishment Request document', labels)

    const establishmentRequestService = new EstablishmentRequestService()

    const { data: existingRequest } = await establishmentRequestService.getAllEstablishmentRequestsPaginated(c, { page: 1, limit: 1, activityId: activity.id, establishmentId: newLocation.id })
    if (existingRequest[0]) {
      return existingRequest[0]
    }

    return await establishmentRequestService.createEstablishmentRequest(c, {
      requestFromActivity: activity.id as string,
      requestToEstablishment: (newLocation).id as string,
      status: EstablishmentRequestStatusEnum.PENDING
    })
  }
}
