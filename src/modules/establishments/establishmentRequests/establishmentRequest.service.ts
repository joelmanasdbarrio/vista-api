import { Context } from 'hono'
import { ActivityService } from 'src/modules/activites/activity.service'
import BaseService from 'src/modules/base.service'
import { ActivityTypeEnum, EstablishmentDTO, EstablishmentRequestDTO, EstablishmentRequestsPaginatedDTO, EstablishmentRequestStatusEnum } from 'src/types/vista-spec.types'
import AppError from 'src/utils/error_handling/AppError'
import getId from 'src/utils/getId'
import Logger, { LogLabels } from 'src/utils/logger'
import EstablishmentService from '../establishment.service'
import EstablishmentRequestRepository from './establishmentRequest.repository'
import { GetEstablishmentRequestParam, GetEstablishmentRequestsQuery, PatchEstablishmentRequestBody, PostEstablishmentRequestBody } from './lib/establishmentRequest.validations'

export default class EstablishmentRequestService extends BaseService {
  protected resource = 'EstablishmentRequest'

  async getAllEstablishmentRequestsPaginated (c: Context, query: GetEstablishmentRequestsQuery): Promise<EstablishmentRequestsPaginatedDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAllEstablishmentRequestsPaginated' }
    Logger.info('Get Establishment Request documents paginated', labels)

    const establishmentRequestRepository = new EstablishmentRequestRepository(c)
    const { establishmentRequests, totalEstablishmentRequests } = await establishmentRequestRepository.getAllPaginated(query)

    return {
      data: establishmentRequests,
      _meta: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        results: establishmentRequests.length,
        total: totalEstablishmentRequests
      }
    }
  }

  async getOneEstablishmentRequest (c: Context, { id }: GetEstablishmentRequestParam): Promise<EstablishmentRequestDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneEstablishmentRequest' }
    Logger.info(`Get Establishment Request document by ID "${id}"`, labels)

    const establishmentRequestRepository = new EstablishmentRequestRepository(c)
    return await establishmentRequestRepository.getOneById(id)
  }

  async createEstablishmentRequest (c: Context, body: PostEstablishmentRequestBody): Promise<EstablishmentRequestDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'createEstablishmentRequest' }
    Logger.info('Create Establishment Request document', labels)

    const requestFromActivityId = getId(body.requestFromActivity)
    if (!requestFromActivityId) {
      throw new AppError(400, 'Activity ID is required', {
        code: 'ACTIVITY_ID_REQUIRED',
        message: 'Activity ID is required',
        details: 'Please, provide a valid Activity ID for the Establishment Request.'
      })
    }

    const activityService = new ActivityService()
    const requestFromActivityDTO = await activityService.getOneActivity(c, { id: requestFromActivityId })
    if (requestFromActivityDTO == null) {
      throw new AppError(404, `Activity with ID "${requestFromActivityId}" not found`, {
        code: 'ACTIVITY_NOT_FOUND',
        message: `Activity with ID "${requestFromActivityId}" not found`,
        details: 'Please, check if the activity ID is correct.'
      })
    }

    if (requestFromActivityDTO.type !== ActivityTypeEnum.ONSITE) {
      throw new AppError(400, 'Invalid Activity Type', {
        code: 'INVALID_ACTIVITY_TYPE',
        message: 'Invalid Activity Type',
        details: `Establishment Requests can only be created from ${ActivityTypeEnum.ONSITE} activities.`
      })
    }

    const requestToEstablishmentId = getId(body.requestToEstablishment)
    if (!requestToEstablishmentId) {
      throw new AppError(400, 'Establishment ID is required', {
        code: 'ESTABLISHMENT_ID_REQUIRED',
        message: 'Establishment ID is required',
        details: 'Please, provide a valid Establishment ID for the Establishment Request.'
      })
    }

    const establishmentService = new EstablishmentService()
    const requestToEstablishmentDTO = await establishmentService.getOneEstablishment(c, { id: requestToEstablishmentId })
    if (requestToEstablishmentDTO == null) {
      throw new AppError(404, `Establishment with ID "${requestToEstablishmentId}" not found`, {
        code: 'ESTABLISHMENT_NOT_FOUND',
        message: `Establishment with ID "${requestToEstablishmentId}" not found`,
        details: 'Please, check if the establishment ID is correct.'
      })
    }

    const establishmentRquestToCreate: EstablishmentRequestDTO = {
      requestFromActivity: requestFromActivityDTO,
      requestToEstablishment: requestToEstablishmentDTO,
      status: EstablishmentRequestStatusEnum.PENDING
    }

    const establishmentRequestRepository = new EstablishmentRequestRepository(c)
    const establishmentRequest = await establishmentRequestRepository.createOne(establishmentRquestToCreate)

    if (establishmentRequest) {
      await activityService.updateOneActivity(c, requestFromActivityId, {
        id: requestFromActivityId,
        isDraft: true
      })
    }

    return establishmentRequest
  }

  async updateEstablishmentRequest (c: Context, id: string, body: PatchEstablishmentRequestBody): Promise<EstablishmentRequestDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateEstablishmentRequest' }
    Logger.info('Update Establishment Request document', labels)

    if ((body.id !== null) && (JSON.stringify(body.id) !== JSON.stringify(id))) {
      throw new AppError(400, 'Establishment Request ID mismatch', {
        code: 'ESTABLISHMENT_REQUEST_ID_MISMATCH',
        message: 'Establishment Request ID mismatch',
        details: 'The provided ID does not match the Establishment Request ID in the body.'
      })
    }

    const establishmentRquestDTO = await this.getOneEstablishmentRequest(c, { id })
    if (establishmentRquestDTO == null) {
      throw new AppError(404, `Establishment Request with ID "${id}" not found`, {
        code: 'ESTABLISHMENT_REQUEST_NOT_FOUND',
        message: `Establishment Request with ID "${id}" not found`,
        details: 'Please, check if the desired ID is correctly typed'
      })
    }

    const user = c.get('user')
    const establishmentOwnerId = getId((establishmentRquestDTO.requestToEstablishment as EstablishmentDTO).owner)

    // Only the establishment owner can approve/reject requests
    if (body.status !== establishmentRquestDTO.status && establishmentOwnerId !== user.id) {
      throw new AppError(403, 'Forbidden', {
        code: 'FORBIDDEN',
        message: 'Forbidden',
        details: 'Only the establishment owner can change the request status.'
      })
    }

    // Request source and destination are immutable
    const establishmentRquestToUpdate: EstablishmentRequestDTO = {
      id,
      requestFromActivity: establishmentRquestDTO.requestFromActivity,
      requestToEstablishment: establishmentRquestDTO.requestToEstablishment,
      status: body.status ?? establishmentRquestDTO.status,
      createdAt: establishmentRquestDTO.createdAt,
      updatedAt: new Date().toISOString()
    }

    const establishmentRequestRepository = new EstablishmentRequestRepository(c)
    return await establishmentRequestRepository.updateOneById(id, establishmentRquestToUpdate)
  }

  async deleteEstablishmentRequest (c: Context, id: string): Promise<void> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'deleteEstablishmentRequest' }
    Logger.info('Delete Establishment Request document', labels)

    const req = await this.getOneEstablishmentRequest(c, { id })
    if (req == null) {
      throw new AppError(404, `Establishment Request with ID "${id}" not found`, {
        code: 'ESTABLISHMENT_REQUEST_NOT_FOUND',
        message: `Establishment Request with ID "${id}" not found`,
        details: 'Please, check if the desired ID is correctly typed.'
      })
    }

    const user = c.get('user')
    const activityOwnerId = getId(req.requestFromActivity)
    const establishmentOwnerId = getId((req.requestToEstablishment as EstablishmentDTO).owner)

    // Only the activity owner or establishment owner can delete the request
    if (user.id !== activityOwnerId && user.id !== establishmentOwnerId) {
      throw new AppError(403, 'Forbidden', {
        code: 'FORBIDDEN',
        message: 'Forbidden',
        details: 'Only the activity owner or establishment owner can delete this request.'
      })
    }

    const establishmentRequestRepository = new EstablishmentRequestRepository(c)
    await establishmentRequestRepository.deleteOneById(id)
  }
}
