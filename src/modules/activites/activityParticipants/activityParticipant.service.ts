import { Context } from 'hono'
import BaseService from 'src/modules/base.service'
import { AccountsPersonalPaginatedDTO, ActivityParticipantDTO } from 'src/types/vista-spec.types'
import AppError from 'src/utils/error_handling/AppError'
import Logger, { LogLabels } from 'src/utils/logger'
import { ActivityService } from '../activity.service'
import ActivityParticipantRepository from './activityParticipant.repository'
import { DeleteActivityParticipantObj, GetActivityParticipantsQuery, PostActivityParticipantObj } from './lib/activityParticipants.validations'

export default class ActivityParticipantService extends BaseService {
  protected resource = 'ActivityParticipant'

  async getAllActivityParticipantsPaginated (c: Context, query: GetActivityParticipantsQuery): Promise<AccountsPersonalPaginatedDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAllActivityParticipantsPaginated' }
    Logger.info('Get all ActivityParticipant documents paginated', labels)

    const { activityId } = query
    if (activityId) {
      const activityService = new ActivityService()
      const activity = await activityService.getOneActivity(c, { id: activityId })

      if (activity == null) {
        throw new AppError(404, `Activity with ID "${activityId}" not found`, {
          code: 'ACTIVITY_NOT_FOUND',
          message: `Activity with ID "${activityId}" not found`,
          details: 'Please, check if the desired ID is correctly typed'
        })
      }
      query.activityId = activityId
    }

    const activityParticipantRepository = new ActivityParticipantRepository(c)
    const { activityParticipants, totalActivityParticipants } = await activityParticipantRepository.getAllPaginated(query)

    return {
      data: activityParticipants,
      _meta: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        results: activityParticipants.length,
        total: totalActivityParticipants
      }
    }
  }

  async createActivityParticipant (c: Context, body: PostActivityParticipantObj): Promise<ActivityParticipantDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'createActivityParticipant' }
    Logger.info('Create a new ActivityParticipant document', labels)

    const activityParticipantRepository = new ActivityParticipantRepository(c)
    return await activityParticipantRepository.createOne(body)
  }

  async deleteActivityParticipant (c: Context, body: DeleteActivityParticipantObj): Promise<void> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'deleteActivityParticipant' }
    Logger.info('Delete an ActivityParticipant document', labels)

    const activityParticipantRepository = new ActivityParticipantRepository(c)
    await activityParticipantRepository.deleteOneByCompositeKey(body.activityId, body.accountId)
  }
}
