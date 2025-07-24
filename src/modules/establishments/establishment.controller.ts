import { Context } from 'hono'
import AppError from 'src/utils/error_handling/AppError'
import { EstablishmentResponse, EstablishmentsResponse } from '../../types/vista-spec.types'
import Logger, { LogLabels } from '../../utils/logger'
import BaseController from '../base.controller'
import EstablishmentService from './establishment.service'
import { DeleteEstablishmentInput, GetEstablishmentInput, GetEstablishmentsInput, PatchEstablishmentInput, PostEstablishmentInput } from './lib/establishments.validations'

export default class EstablishmentController extends BaseController {
  protected resource = 'Establishment'
  protected establishmentService: EstablishmentService

  constructor () {
    super()
    this.establishmentService = new EstablishmentService()
  }

  async getEstablishments (c: Context<any, any, GetEstablishmentsInput>): Promise<EstablishmentsResponse> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getEstablishments' }
    Logger.info('Get all Establishment documents paginated', labels)

    const { data, _meta } = await this.establishmentService.getAllEstablishmentsPaginated(c, c.req.query())

    Logger.info(`Found ${data.length} establishment(s)`, labels)
    Logger.debug(data)

    return {
      status: 'success',
      data,
      _meta
    }
  }

  async getEstablishment (c: Context<any, any, GetEstablishmentInput>): Promise<EstablishmentResponse> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getEstablishment' }
    Logger.info('Get Establishment document by ID', labels)

    const id = c.req.param('id')
    const establishment = await this.establishmentService.getOneEstablishment(c, { id })

    if (establishment == null) {
      throw new AppError(404, `Establishment with ID "${id}" not found`, {
        code: 'ESTABLISHMENT_NOT_FOUND',
        message: `Establishment with ID "${id}" not found`,
        details: 'Please, check if the desired ID is correctly typed'
      })
    }

    Logger.info(`Found establishment "${establishment.name}" (${String(establishment.id)})`, labels)
    Logger.debug(establishment)

    return {
      status: 'success',
      data: establishment
    }
  }

  async createEstablishment (c: Context<any, any, PostEstablishmentInput>): Promise<EstablishmentResponse> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'createEstablishment' }
    Logger.info('Create a new Establishment document', labels)

    const body = await c.req.json()
    const establishment = await this.establishmentService.createEstablishment(c, body)

    Logger.info(`Created establishment (${String(establishment.id)})`, labels)
    Logger.debug(establishment)

    return {
      status: 'success',
      data: establishment
    }
  }

  async updateEstablishment (c: Context<any, any, PatchEstablishmentInput>): Promise<EstablishmentResponse> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateEstablishment' }
    Logger.info('Update an Establishment document', labels)

    const id = c.req.param('id')
    const body = await c.req.json()
    const establishment = await this.establishmentService.updateOneEstablishment(c, id, body)

    Logger.info(`Updated establishment (${String(establishment.id)})`, labels)
    Logger.debug(establishment)

    return {
      status: 'success',
      data: establishment
    }
  }

  async deleteEstablishment (c: Context<any, any, DeleteEstablishmentInput>): Promise<void> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'deleteEstablishment' }
    Logger.info('Delete an Establishment document', labels)

    const id = c.req.param('id')
    await this.establishmentService.deleteOneEstablishment(c, { id })

    Logger.info(`Deleted establishment (${id})`, labels)
  }
}
