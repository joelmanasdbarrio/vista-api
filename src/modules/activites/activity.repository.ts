import { and, count, eq, gte, lte, or, SQL } from 'drizzle-orm'
import { Context } from 'hono'
import { Activity, ActivityOnline, ActivityOnsite, ActivityParticipant } from 'src/db/schema'
import { ActivityDTO, ActivityOnlineDTO, ActivityOnsiteDTO, ActivityTypeEnum } from 'src/types/vista-spec.types'
import AppError from 'src/utils/error_handling/AppError'
import Logger, { LogLabels } from 'src/utils/logger'
import BaseRepository from '../base.repository'
import ActivityOnlineMapper from './activityOnline.mapper'
import ActivityOnsiteMapper from './activityOnsite.mapper'
import { GetActivitiesQuery } from './lib/activity.validations'

export default class ActivityRepository extends BaseRepository {
  protected resource = 'Activity'
  protected activityOnsiteMapper: ActivityOnsiteMapper
  protected activityOnlineMapper: ActivityOnlineMapper

  constructor (c: Context) {
    super(c)
    this.activityOnsiteMapper = new ActivityOnsiteMapper(c)
    this.activityOnlineMapper = new ActivityOnlineMapper(c)
  }

  async getAllPaginated (query: GetActivitiesQuery): Promise<{ activities: ActivityDTO[], totalActivities: number }> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAllPaginated' }
    Logger.info('Get Activity documents paginated', labels)

    if (query.type === ActivityTypeEnum.ONSITE) {
      return await this.getAllActivityOnsitePaginated(query)
    } else if (query.type === ActivityTypeEnum.ONLINE) {
      return await this.getAllActivityOnlinePaginated(query)
    } else {
      throw new AppError(400, 'Invalid Activity Type', {
        code: 'INVALID_ACTIVITY_TYPE',
        message: 'Invalid Activity Type',
        details: `The activity type "${String(query.type)}" is not supported. Please, use ${Object.values(ActivityTypeEnum).join(', ')} instead.`
      })
    }
  }

  private async getAllActivityOnsitePaginated (query: GetActivitiesQuery): Promise<{ activities: ActivityOnsiteDTO[], totalActivities: number }> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAllActivityOnsitePaginated' }
    Logger.info('Get Activity Onsite documents paginated', labels)

    const filters = this.buildFilters(query)

    const [totalCount] = await this.drizzle
      .select({ count: count() })
      .from(Activity)
      .innerJoin(ActivityOnsite, eq(Activity.id, ActivityOnsite.activity_id))

    const activitiesDB = await this.drizzle
      .select({
        // Activity fields
        id: Activity.id,
        owner_id: Activity.owner_id,
        category_id: Activity.category_id,
        title: Activity.title,
        description: Activity.description,
        images: Activity.images,
        time_start: Activity.time_start,
        time_end: Activity.time_end,
        price_min: Activity.price_min,
        price_max: Activity.price_max,
        price_currency: Activity.price_currency,
        participants_min: Activity.participants_min,
        participants_max: Activity.participants_max,
        language: Activity.language,
        website: Activity.website,
        is_draft: Activity.is_draft,
        created_at: Activity.created_at,
        updated_at: Activity.updated_at,
        // ActivityOnsite fields
        activity_id: ActivityOnsite.activity_id,
        location_coordinates: ActivityOnsite.location_coordinates,
        location_establishment_id: ActivityOnsite.location_establishment_id,
        total_participants: count(ActivityParticipant.id)
      })
      .from(Activity)
      .innerJoin(ActivityOnsite, eq(Activity.id, ActivityOnsite.activity_id))
      .leftJoin(ActivityParticipant, eq(ActivityParticipant.activity_id, Activity.id))
      .where(and(...filters))
      .groupBy(Activity.id, ActivityOnsite.activity_id)
      .limit(query.limit)
      .offset((query.page - 1) * query.limit)

    const activityDTOs = await this.activityOnsiteMapper.toDTOs(activitiesDB)

    return {
      activities: activityDTOs,
      totalActivities: (typeof totalCount.count === 'number' && !isNaN(totalCount.count)) ? totalCount.count : 0
    }
  }

  private async getAllActivityOnlinePaginated (query: GetActivitiesQuery): Promise<{ activities: ActivityOnlineDTO[], totalActivities: number }> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAllActivityOnlinePaginated' }
    Logger.info('Get Activity Online documents paginated', labels)

    const filters = this.buildFilters(query)

    const [totalCount] = await this.drizzle
      .select({ count: count() })
      .from(Activity)
      .innerJoin(ActivityOnline, eq(Activity.id, ActivityOnline.activity_id))

    const activitiesDB = await this.drizzle
      .select({
        // Activity fields
        id: Activity.id,
        owner_id: Activity.owner_id,
        category_id: Activity.category_id,
        title: Activity.title,
        description: Activity.description,
        images: Activity.images,
        time_start: Activity.time_start,
        time_end: Activity.time_end,
        price_min: Activity.price_min,
        price_max: Activity.price_max,
        price_currency: Activity.price_currency,
        participants_min: Activity.participants_min,
        participants_max: Activity.participants_max,
        language: Activity.language,
        website: Activity.website,
        is_draft: Activity.is_draft,
        created_at: Activity.created_at,
        updated_at: Activity.updated_at,
        // ActivityOnline fields
        activity_id: ActivityOnline.activity_id,
        location_url: ActivityOnline.location_url,
        total_participants: count(ActivityParticipant.id)
      })
      .from(Activity)
      .innerJoin(ActivityOnline, eq(Activity.id, ActivityOnline.activity_id))
      .leftJoin(ActivityParticipant, eq(ActivityParticipant.activity_id, Activity.id))
      .where(and(...filters))
      .groupBy(Activity.id, ActivityOnline.activity_id)
      .limit(query.limit)
      .offset((query.page - 1) * query.limit)

    const activityDTOs = await this.activityOnlineMapper.toDTOs(activitiesDB)

    return {
      activities: activityDTOs,
      totalActivities: (typeof totalCount.count === 'number' && !isNaN(totalCount.count)) ? totalCount.count : 0
    }
  }

  private buildFilters (query: GetActivitiesQuery): Array<SQL | undefined> {
    const filters: Array<SQL | undefined> = []

    if (query.accountId) {
      filters.push(eq(Activity.owner_id, query.accountId))
    }

    if (query.categoryId) {
      filters.push(eq(Activity.category_id, query.categoryId))
    }

    if (query.title !== null || query.description !== null) {
      const titleQuery = query.title?.trim().toLowerCase()
      const descriptionQuery = query.description?.trim().toLowerCase()

      if (titleQuery && descriptionQuery) {
        filters.push(or(
          eq(Activity.title, titleQuery),
          eq(Activity.description, descriptionQuery)
        ))
      } else if (titleQuery) {
        filters.push(eq(Activity.title, titleQuery))
      } else if (descriptionQuery) {
        filters.push(eq(Activity.description, descriptionQuery))
      }
    }

    if (query.language) {
      filters.push(eq(Activity.language, query.language))
    }

    if (query.minPrice) {
      filters.push(gte(Activity.price_min, query.minPrice))
    }

    if (query.maxPrice) {
      filters.push(lte(Activity.price_max, query.maxPrice))
    }

    if (query.timeStart != null) {
      filters.push(gte(Activity.time_start, query.timeStart))
    }

    if (query.timeEnd != null) {
      filters.push(lte(Activity.time_end, query.timeEnd))
    }

    if (query.minParticipants) {
      filters.push(gte(Activity.participants_min, query.minParticipants))
    }

    if (query.maxParticipants) {
      filters.push(lte(Activity.participants_max, query.maxParticipants))
    }

    if (query.minEntries) {
      filters.push(gte(count(ActivityParticipant.id), query.minEntries))
    }

    if (query.maxEntries) {
      filters.push(lte(count(ActivityParticipant.id), query.maxEntries))
    }

    return filters
  }

  /**
   * @deprecated
   */
  async getAll (query: any): Promise<any> {
    throw new AppError(500, 'Method deprecated. Use getAllActivityOnsitePaginated or getAllActivityOnlinePaginated instead.', { code: 'METHOD_DEPRECATED', message: 'Method deprecated. Use getAllActivityOnsitePaginated or getAllActivityOnlinePaginated instead.' })
  }

  async getOneById (id: string): Promise<ActivityDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneById' }
    Logger.info('Get Activity document by ID', labels)

    const [isActivityOnsite, isActivityOnline] = await Promise.all([
      this.drizzle
        .select({ count: count() })
        .from(ActivityOnsite)
        .where(eq(ActivityOnsite.activity_id, id)),
      this.drizzle
        .select({ count: count() })
        .from(ActivityOnline)
        .where(eq(ActivityOnline.activity_id, id))
    ])

    if (isActivityOnsite[0].count > 0) {
      return await this.getOneActivityOnsiteById(id)
    } else if (isActivityOnline[0].count > 0) {
      return await this.getOneActivityOnlineById(id)
    }
  }

  private async getOneActivityOnsiteById (id: string): Promise<ActivityOnsiteDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneActivityOnsiteById' }
    Logger.info('Get Activity Onsite document', labels)

    const [activityDB] = await this.drizzle
      .select({
        // Activity fields
        id: Activity.id,
        owner_id: Activity.owner_id,
        category_id: Activity.category_id,
        title: Activity.title,
        description: Activity.description,
        images: Activity.images,
        time_start: Activity.time_start,
        time_end: Activity.time_end,
        price_min: Activity.price_min,
        price_max: Activity.price_max,
        price_currency: Activity.price_currency,
        participants_min: Activity.participants_min,
        participants_max: Activity.participants_max,
        language: Activity.language,
        website: Activity.website,
        is_draft: Activity.is_draft,
        created_at: Activity.created_at,
        updated_at: Activity.updated_at,
        // ActivityOnsite fields
        activity_id: ActivityOnsite.activity_id,
        location_coordinates: ActivityOnsite.location_coordinates,
        location_establishment_id: ActivityOnsite.location_establishment_id
      })
      .from(Activity)
      .innerJoin(ActivityOnsite, eq(Activity.id, ActivityOnsite.activity_id))
      .where(eq(Activity.id, id))
      .limit(1)

    return await this.activityOnsiteMapper.toDTO(activityDB)
  }

  private async getOneActivityOnlineById (id: string): Promise<ActivityOnlineDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneActivityOnlineById' }
    Logger.info('Get Activity Online document', labels)

    const [activityDB] = await this.drizzle
      .select({
        // Activity fields
        id: Activity.id,
        owner_id: Activity.owner_id,
        category_id: Activity.category_id,
        title: Activity.title,
        description: Activity.description,
        images: Activity.images,
        time_start: Activity.time_start,
        time_end: Activity.time_end,
        price_min: Activity.price_min,
        price_max: Activity.price_max,
        price_currency: Activity.price_currency,
        participants_min: Activity.participants_min,
        participants_max: Activity.participants_max,
        language: Activity.language,
        website: Activity.website,
        is_draft: Activity.is_draft,
        created_at: Activity.created_at,
        updated_at: Activity.updated_at,
        // ActivityOnline fields
        activity_id: ActivityOnline.activity_id,
        location_url: ActivityOnline.location_url
      })
      .from(Activity)
      .innerJoin(ActivityOnline, eq(Activity.id, ActivityOnline.activity_id))
      .where(eq(Activity.id, id))
      .limit(1)

    return await this.activityOnlineMapper.toDTO(activityDB)
  }

  /**
   * @deprecated
   */
  async createOne (data: any) {
    throw new AppError(500, 'Method createOne is deprecated. Use createActivityOnsite or createActivityOnline instead.', { code: 'METHOD_DEPRECATED', message: 'Method createOne is deprecated. Use createActivityOnsite or createActivityOnline instead.' })
  }

  async createActivityOnsite (data: ActivityOnsiteDTO): Promise<ActivityOnsiteDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'createActivityOnsite' }
    Logger.info('Create Activity Onsite document', labels)

    const { activity, activityOnsite } = this.activityOnsiteMapper.toDB(data)

    const [createdActivityArr, createdActivityOnsiteArr] = await Promise.all([
      this.drizzle
        .insert(Activity)
        .values(activity)
        .returning(),
      this.drizzle
        .insert(ActivityOnsite)
        .values(activityOnsite)
        .returning()
    ])

    const createdActivity = Array.isArray(createdActivityArr) ? createdActivityArr[0] : createdActivityArr
    const createdActivityOnsite = Array.isArray(createdActivityOnsiteArr) ? createdActivityOnsiteArr[0] : createdActivityOnsiteArr

    const mergedData = {
      ...createdActivity,
      ...createdActivityOnsite
    }

    return await this.activityOnsiteMapper.toDTO(mergedData)
  }

  async createActivityOnline (data: ActivityOnlineDTO): Promise<ActivityOnlineDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'createActivityOnline' }
    Logger.info('Create Activity Online document', labels)

    const { activity, activityOnline } = this.activityOnlineMapper.toDB(data)

    const [createdActivityArr, createdActivityOnlineArr] = await Promise.all([
      this.drizzle
        .insert(Activity)
        .values(activity)
        .returning(),
      this.drizzle
        .insert(ActivityOnline)
        .values(activityOnline)
        .returning()
    ])

    const createdActivity = Array.isArray(createdActivityArr) ? createdActivityArr[0] : createdActivityArr
    const createdActivityOnline = Array.isArray(createdActivityOnlineArr) ? createdActivityOnlineArr[0] : createdActivityOnlineArr

    const mergedData = {
      ...createdActivity,
      ...createdActivityOnline
    }

    return await this.activityOnlineMapper.toDTO(mergedData)
  }

  async updateOneById (id: string, data: any): Promise<any> {
    throw new Error('Method not implemented.')
  }

  async updateActivityOnsiteById (id: string, data: ActivityOnsiteDTO): Promise<ActivityOnsiteDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateActivityOnsiteById' }
    Logger.info('Update Activity Onsite document', labels)

    const { activity, activityOnsite } = this.activityOnsiteMapper.toDB(data)

    const [activityDB] = await this.drizzle
      .update(Activity)
      .set(activity)
      .where(eq(Activity.id, id))
      .returning()

    const [activityOnsiteDB] = await this.drizzle
      .update(ActivityOnsite)
      .set(activityOnsite)
      .where(eq(ActivityOnsite.activity_id, id))
      .returning()

    return await this.activityOnsiteMapper.toDTO({
      ...activityDB,
      ...activityOnsiteDB
    })
  }

  async updateActivityOnlineById (id: string, data: ActivityOnlineDTO): Promise<ActivityOnlineDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateActivityOnlineById' }
    Logger.info('Update Activity Online document', labels)

    const { activity, activityOnline } = this.activityOnlineMapper.toDB(data)

    const [activityDB] = await this.drizzle
      .update(Activity)
      .set(activity)
      .where(eq(Activity.id, id))
      .returning()

    const [activityOnlineDB] = await this.drizzle
      .update(ActivityOnline)
      .set(activityOnline)
      .where(eq(ActivityOnline.activity_id, id))
      .returning()

    return await this.activityOnlineMapper.toDTO({
      ...activityDB,
      ...activityOnlineDB
    })
  }

  async deleteOneById (id: string): Promise<void> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'deleteOneById' }
    Logger.info('Delete Activity document', labels)

    await this.drizzle
      .delete(Activity)
      .where(eq(Activity.id, id))
      .returning()
  }
}
