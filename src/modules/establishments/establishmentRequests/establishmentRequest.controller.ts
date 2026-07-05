import { Context } from 'hono'
import BaseController from 'src/modules/base.controller'
import { EstablishmentRequestResponse, EstablishmentRequestsResponse } from 'src/types/vista-spec.types'
import Logger, { LogLabels } from 'src/utils/logger'
import EstablishmentRequestService from './establishmentRequest.service'
import { GetEstablishmentRequestsInput, PatchEstablishmentRequestInput } from './lib/establishmentRequest.validations'

export default class EstablishmentRequestController extends BaseController {
  protected resource = 'EstablishmentRequest'
  protected establishmentRequestService: EstablishmentRequestService

  constructor () {
    super()
    this.establishmentRequestService = new EstablishmentRequestService()
  }

  async getEstablishmentRequests (c: Context<any, any, GetEstablishmentRequestsInput>): Promise<EstablishmentRequestsResponse> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getEstablishmentRequests' }
    Logger.info('Get all Establishment Request documents paginated', labels)

    const { data, _meta } = await this.establishmentRequestService.getAllEstablishmentRequestsPaginated(c, c.req.valid('query'))

    Logger.info(`Found ${data.length} Establishment Request(s)`, labels)
    Logger.debug(data)

    return {
      status: 'success',
      data,
      _meta
    }
  }

  async updateEstablishmentRequest (c: Context<any, any, PatchEstablishmentRequestInput>): Promise<EstablishmentRequestResponse> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateEstablishmentRequest' }
    Logger.info('Update Establishment Request document', labels)

    const { id } = c.req.param()
    const body = c.req.valid('json')
    const establishmentRequest = await this.establishmentRequestService.updateEstablishmentRequest(c, id, body)

    Logger.info(`Updated Establishment Request (${String(establishmentRequest.id)})`, labels)
    Logger.debug(establishmentRequest)

    return {
      status: 'success',
      data: establishmentRequest
    }
  }

  async deleteEstablishmentRequest (c: Context): Promise<void> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'deleteEstablishmentRequest' }
    Logger.info('Delete Establishment Request document by ID', labels)

    const { id } = c.req.param()
    await this.establishmentRequestService.deleteEstablishmentRequest(c, id)

    Logger.info(`Deleted Establishment Request (${id})`, labels)
  }
}
