import { and, eq, sql, SQL } from 'drizzle-orm'
import { Context } from 'hono'
import { EstablishmentRequest } from 'src/db/schema'
import BaseRepository from 'src/modules/base.repository'
import { EstablishmentRequestDB } from 'src/types/database.types'
import { EstablishmentRequestDTO } from 'src/types/vista-spec.types'
import AppError from 'src/utils/error_handling/AppError'
import Logger, { LogLabels } from 'src/utils/logger'
import EstablishmentRequestMapper from './establishmentRequest.mapper'
import { GetEstablishmentRequestsQuery } from './lib/establishmentRequest.validations'

export default class EstablishmentRequestRepository extends BaseRepository {
  protected resource = 'EstablishmentRequest'
  protected establishmentRequestMapper: EstablishmentRequestMapper

  constructor (c: Context) {
    super(c)
    this.establishmentRequestMapper = new EstablishmentRequestMapper(c)
  }

  async getAllPaginated ({ page = 1, limit = 10, activityId, establishmentId }: GetEstablishmentRequestsQuery): Promise<{ establishmentRequests: EstablishmentRequestDTO[], totalEstablishmentRequests: number }> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAllPaginated' }
    Logger.info('Get Establishment Request documents paginated', labels)

    const filters: Array<SQL | undefined> = []
    if (activityId) {
      filters.push(eq(EstablishmentRequest.request_from_activity_id, activityId))
    }

    if (establishmentId) {
      filters.push(eq(EstablishmentRequest.request_to_establishment_id, establishmentId))
    }

    const [totalCount] = await this.drizzle
      .select({ count: sql<number>`count(*)` })
      .from(EstablishmentRequest)
      .where(and(...filters))

    const establishmentRequestsDB: EstablishmentRequestDB[] = await this.drizzle
      .select()
      .from(EstablishmentRequest)
      .where(and(...filters))
      .limit(limit)
      .offset((page - 1) * limit)

    const establishmentRequestsDTO = await this.establishmentRequestMapper.toDTOs(establishmentRequestsDB)

    return {
      establishmentRequests: establishmentRequestsDTO,
      totalEstablishmentRequests: (typeof totalCount.count === 'number' && !isNaN(totalCount.count)) ? totalCount.count : 0
    }
  }

  /**
   * @deprecated
   */
  async getAll (query: any): Promise<any> {
    throw new AppError(500, 'Method not implemented.', { code: 'METHOD_NOT_IMPLEMENTED', message: 'Method not implemented.' })
  }

  async getOneById (id: string): Promise<EstablishmentRequestDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneById' }
    Logger.info(`Get Establishment Request document by ID "${id}"`, labels)

    const [establishmentRequestDB]: EstablishmentRequestDB[] = await this.drizzle
      .select()
      .from(EstablishmentRequest)
      .where(eq(EstablishmentRequest.id, id))
      .limit(1)

    return await this.establishmentRequestMapper.toDTO(establishmentRequestDB)
  }

  async createOne (data: EstablishmentRequestDTO): Promise<EstablishmentRequestDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'createOne' }
    Logger.info('Create Establishment Request document', labels)

    const establishmentRequestData = this.establishmentRequestMapper.toDB(data)

    const [establishmentRequestDB]: EstablishmentRequestDB[] = await this.drizzle
      .insert(EstablishmentRequest)
      .values(establishmentRequestData)
      .returning()

    return await this.establishmentRequestMapper.toDTO(establishmentRequestDB)
  }

  async updateOneById (id: string, data: EstablishmentRequestDTO): Promise<EstablishmentRequestDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateOneById' }
    Logger.info(`Update Establishment Request document by ID "${id}"`, labels)

    const updates = this.establishmentRequestMapper.toDB(data)

    const [establishmentRequestDB]: EstablishmentRequestDB[] = await this.drizzle
      .update(EstablishmentRequest)
      .set(updates)
      .where(eq(EstablishmentRequest.id, id))
      .returning()

    return await this.establishmentRequestMapper.toDTO(establishmentRequestDB)
  }

  async deleteOneById (id: string): Promise<void> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'deleteOneById' }
    Logger.info(`Delete Establishment Request document by ID "${id}"`, labels)

    await this.drizzle
      .delete(EstablishmentRequest)
      .where(eq(EstablishmentRequest.id, id))
      .returning()
  }
}
