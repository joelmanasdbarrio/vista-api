import { Context } from 'hono'
import AccountService from 'src/modules/accounts/account.service'
import BaseMapper from 'src/modules/base.mapper'
import { ActivityParticipantDB, NewActivityParticipantDB } from 'src/types/database.types'
import { AccountTypeEnum, ActivityParticipantDTO } from 'src/types/vista-spec.types'
import AppError from 'src/utils/error_handling/AppError'
import getId from 'src/utils/getId'
import { ActivityService } from '../activity.service'

export default class ActivityParticipantMapper extends BaseMapper<ActivityParticipantDB, ActivityParticipantDTO> {
  private readonly c: Context

  constructor (c: Context) {
    super()
    this.c = c
  }

  async toDTO (input: ActivityParticipantDB): Promise<ActivityParticipantDTO> {
    const accountService = new AccountService()
    const participantAccountDTO = await accountService.getOneAccount(this.c, { id: input.participant_id })
    if (participantAccountDTO == null) {
      throw new AppError(404, `Participant account with ID "${input.participant_id}" not found`, {
        code: 'PARTICIPANT_ACCOUNT_NOT_FOUND',
        message: `Participant account with ID "${input.participant_id}" not found`,
        details: 'Please, check if the participant account ID is correct.'
      })
    }

    if (!participantAccountDTO.type || participantAccountDTO.type !== AccountTypeEnum.PERSONAL) {
      throw new AppError(400, 'Invalid Account type', {
        code: 'INVALID_ACCOUNT_TYPE',
        message: 'Invalid Account type',
        details: `The participant account type "${participantAccountDTO.type}" is not supported. Please, use "${AccountTypeEnum.PERSONAL}" account type for activity participants instead.`
      })
    }

    const activityService = new ActivityService()
    const activityDTO = await activityService.getOneActivity(this.c, { id: input.activity_id })
    if (activityDTO == null) {
      throw new AppError(404, `Activity with ID "${input.activity_id}" not found`, {
        code: 'ACTIVITY_NOT_FOUND',
        message: `Activity with ID "${input.activity_id}" not found`,
        details: 'Please, check if the activity ID is correct.'
      })
    }

    return {
      id: input.id,
      activity: activityDTO,
      account: participantAccountDTO,
      createdAt: input.created_at.toISOString(),
      updatedAt: input.updated_at.toISOString()
    }
  }

  async toDTOs (inputs: ActivityParticipantDB[]): Promise<ActivityParticipantDTO[]> {
    return await Promise.all(inputs.map(async input => await this.toDTO(input)))
  }

  toDB (data: ActivityParticipantDTO): NewActivityParticipantDB {
    const participantId = getId(data.account)
    if (!participantId) {
      throw new AppError(400, 'Invalid Account reference', {
        code: 'INVALID_ACCOUNT_REFERENCE',
        message: 'Invalid Account reference',
        details: 'The account reference is missing or invalid. Please, check if the account ID is correctly typed.'
      })
    }

    const activityId = getId(data.activity)
    if (!activityId) {
      throw new AppError(400, 'Invalid Activity reference', {
        code: 'INVALID_ACTIVITY_REFERENCE',
        message: 'Invalid Activity reference',
        details: 'The activity reference is missing or invalid. Please, check if the activity ID is correctly typed.'
      })
    }

    return {
      activity_id: activityId,
      participant_id: participantId,
      created_at: new Date(),
      updated_at: new Date()
    }
  }
}
