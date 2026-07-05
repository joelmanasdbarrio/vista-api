import { and, count, eq, like, or, sql, SQL } from 'drizzle-orm'
import { Context } from 'hono'
import { Account, Activity, ActivityParticipant } from 'src/db/schema'
import AccountMapper from 'src/modules/accounts/account.mapper'
import BaseRepository from 'src/modules/base.repository'
import { AccountDB, ActivityParticipantDB } from 'src/types/database.types'
import { AccountPersonalDTO, AccountTypeEnum, ActivityParticipantDTO } from 'src/types/vista-spec.types'
import AppError from 'src/utils/error_handling/AppError'
import Logger, { LogLabels } from 'src/utils/logger'
import ActivityParticipantMapper from './activityParticipant.mapper'
import { GetActivityParticipantsQuery, PostActivityParticipantObj } from './lib/activityParticipants.validations'

export default class ActivityParticipantRepository extends BaseRepository {
  protected resource = 'ActivityParticipant'
  protected activityParticipantMapper: ActivityParticipantMapper
  protected accountMapper: AccountMapper

  constructor (c: Context) {
    super(c)
    this.activityParticipantMapper = new ActivityParticipantMapper(c)
    this.accountMapper = new AccountMapper()
  }

  async getAllPaginated ({ page = 1, limit = 10, name = '', username = '', activityId = '' }: GetActivityParticipantsQuery): Promise<{ activityParticipants: AccountPersonalDTO[], totalActivityParticipants: number }> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAllPaginated' }
    Logger.info('Get all ActivityParticipant documents paginated', labels)

    const filters: Array<SQL | undefined> = [
      eq(Activity.id, activityId),
      eq(Account.type, AccountTypeEnum.PERSONAL)
    ]

    const orFilters: Array<SQL | undefined> = []
    const nameQuery = typeof name === 'string' ? name.trim().toLowerCase() : ''
    const usernameQuery = typeof username === 'string' ? username.trim().toLowerCase() : ''

    if (nameQuery) {
      orFilters.push(like(sql`LOWER(account.name)`, `%${nameQuery}%`))
    }
    if (usernameQuery) {
      orFilters.push(like(sql`LOWER(account.username)`, `%${usernameQuery}%`))
    }

    if (orFilters.length > 0) {
      filters.push(sql`(${or(...orFilters)})`)
    }

    const [totalCount] = await this.drizzle
      .select({ count: count() })
      .from(ActivityParticipant)
      .innerJoin(Account, sql`activity_participant.participant_id = account.id`)
      .innerJoin(Activity, sql`activity_participant.activity_id = activity.id`)
      .where(and(...filters))

    const activityParticipants: AccountDB[] = await this.drizzle
      .select({
        id: Account.id,
        name: Account.name,
        username: Account.username,
        email: Account.email,
        biography: Account.biography,
        gender: Account.gender,
        birthdate: Account.birthdate,
        avatar: Account.avatar,
        website: Account.website,
        is_private: Account.is_private,
        is_verified: Account.is_verified,
        type: Account.type,
        created_at: Account.created_at,
        updated_at: Account.updated_at
      })
      .from(ActivityParticipant)
      .innerJoin(Account, sql`activity_participant.participant_id = account.id`)
      .innerJoin(Activity, sql`activity_participant.activity_id = activity.id`)
      .where(and(...filters))
      .offset((page - 1) * limit)
      .limit(limit)

    const accountPersonalDTOs = await this.accountMapper.toDTOs(activityParticipants) as AccountPersonalDTO[]

    return {
      activityParticipants: accountPersonalDTOs,
      totalActivityParticipants: (typeof totalCount.count === 'number' && !isNaN(totalCount.count)) ? totalCount.count : 0
    }
  }

  async getAll (query: any): Promise<any> {
    throw new AppError(500, 'Method not implemented.', { code: 'METHOD_NOT_IMPLEMENTED', message: 'Method not implemented.' })
  }

  async getOneById (id: string): Promise<any> {
    throw new AppError(500, 'Method not implemented.', { code: 'METHOD_NOT_IMPLEMENTED', message: 'Method not implemented.' })
  }

  async createOne (data: PostActivityParticipantObj): Promise<ActivityParticipantDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'createOne' }
    Logger.info('Create a new ActivityParticipant document', labels)

    const [activityParticipantDB]: ActivityParticipantDB[] = await this.drizzle
      .insert(ActivityParticipant)
      .values({
        activity_id: data.activityId,
        participant_id: data.accountId
      })
      .returning()

    return await this.activityParticipantMapper.toDTO(activityParticipantDB)
  }

  async updateOneById (id: string, data: any): Promise<any> {
    throw new AppError(500, 'Method not implemented.', { code: 'METHOD_NOT_IMPLEMENTED', message: 'Method not implemented.' })
  }

  async deleteOneById (id: string): Promise<void> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'deleteOneById' }
    Logger.info(`Delete ActivityParticipant document by ID "${id}"`, labels)

    await this.drizzle
      .delete(ActivityParticipant)
      .where(eq(ActivityParticipant.id, id))
  }
}
