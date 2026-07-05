
import { Context } from 'hono'
import { ActivityService } from 'src/modules/activites/activity.service'
import BaseMapper from 'src/modules/base.mapper'
import { EstablishmentRequestDB, NewEstablishmentRequestDB } from 'src/types/database.types'
import { ActivityTypeEnum, EstablishmentRequestDTO } from 'src/types/vista-spec.types'
import AppError from 'src/utils/error_handling/AppError'
import getId from 'src/utils/getId'
import EstablishmentService from '../establishment.service'

export default class EstablishmentRequestMapper extends BaseMapper<EstablishmentRequestDB, EstablishmentRequestDTO> {
  private readonly c: Context

  constructor (c: Context) {
    super()
    this.c = c
  }

  async toDTO (input: EstablishmentRequestDB): Promise<EstablishmentRequestDTO> {
    const activityService = new ActivityService()
    const requestFromActivityDTO = await activityService.getOneActivity(this.c, { id: input.request_from_activity_id })
    if (requestFromActivityDTO == null) {
      throw new AppError(404, `Activity with ID "${input.request_from_activity_id}" not found`, {
        code: 'ACTIVITY_NOT_FOUND',
        message: `Activity with ID "${input.request_from_activity_id}" not found`,
        details: 'Please, check if the activity ID is correct.'
      })
    }

    if (typeof requestFromActivityDTO !== 'string' && requestFromActivityDTO.type !== 'onsite') {
      throw new AppError(400, 'Invalid activity type', {
        code: 'INVALID_ACTIVITY_TYPE',
        message: 'Invalid activity type',
        details: `The activity type "${requestFromActivityDTO.type}" is not supported. Please, use "${ActivityTypeEnum.ONSITE}" activity type for establishment locations instead.`
      })
    }

    const establishmentService = new EstablishmentService()
    const requestToEstablishmentDTO = await establishmentService.getOneEstablishment(this.c, { id: input.request_to_establishment_id })
    if (requestToEstablishmentDTO == null) {
      throw new AppError(404, `Establishment with ID "${input.request_to_establishment_id}" not found`, {
        code: 'ESTABLISHMENT_NOT_FOUND',
        message: `Establishment with ID "${input.request_to_establishment_id}" not found`,
        details: 'Please, check if the establishment ID is correct.'
      })
    }

    return {
      id: input.id,
      requestFromActivity: requestFromActivityDTO,
      requestToEstablishment: requestToEstablishmentDTO,
      status: input.status,
      createdAt: input.created_at?.toISOString?.() ?? input.created_at,
      updatedAt: input.updated_at?.toISOString?.() ?? input.updated_at
    }
  }

  async toDTOs (input: EstablishmentRequestDB[]): Promise<EstablishmentRequestDTO[]> {
    return await Promise.all(input.map(async i => await this.toDTO(i)))
  }

  toDB (data: EstablishmentRequestDTO): NewEstablishmentRequestDB {
    const requestFromActivityId = getId(data.requestFromActivity)
    if (!requestFromActivityId) {
      throw new AppError(400, 'requestFromActivity must be provided', {
        code: 'MISSING_REQUEST_FROM_ACTIVITY',
        message: 'requestFromActivity must be provided',
        details: 'Please, provide a valid activity ID or DTO.'
      })
    }

    const requestToEstablishmentId = getId(data.requestToEstablishment)
    if (!requestToEstablishmentId) {
      throw new AppError(400, 'requestToEstablishment must be provided', {
        code: 'MISSING_REQUEST_TO_ESTABLISHMENT',
        message: 'requestToEstablishment must be provided',
        details: 'Please, provide a valid establishment ID or DTO.'
      })
    }

    return {
      request_from_activity_id: requestFromActivityId,
      request_to_establishment_id: requestToEstablishmentId,
      status: data.status,
      updated_at: new Date()
    }
  }
}
