import { and, count, eq, inArray, like, or, SQL, sql } from 'drizzle-orm'
import { Context } from 'hono'
import { EstablishmentDB } from 'src/types/database.types'
import AppError from 'src/utils/error_handling/AppError'
import { Address, Establishment } from '../../db/schema'
import { AddressDTO, EstablishmentDTO } from '../../types/vista-spec.types'
import Logger, { LogLabels } from '../../utils/logger'
import BaseRepository from '../base.repository'
import AddressMapper from './addresses/address.mapper'
import EstablishmentMapper from './establishment.mapper'
import { GetEstablishmentsQuery } from './lib/establishments.validations'

export default class EstablishmentRepository extends BaseRepository {
  protected resource = 'Establishment'
  protected establishmentMapper: EstablishmentMapper
  protected addressMapper: AddressMapper

  constructor (c: Context) {
    super(c)
    this.establishmentMapper = new EstablishmentMapper(c)
    this.addressMapper = new AddressMapper()
  }

  async getAllPaginated ({ page = 1, limit = 10, name, address }: GetEstablishmentsQuery): Promise<{ establishments: EstablishmentDTO[], totalEstablishments: number }> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAllPaginated' }
    Logger.info('Get Establishment documents paginated', labels)

    const queryStr = (name ?? address)?.trim().toLowerCase()
    const filters: Array<SQL | undefined> = []
    if (queryStr !== undefined && queryStr.length > 0) {
      filters.push(
        or(
          like(Establishment.name, `%${queryStr}%`),
          like(sql<string>`address.street || ' ' || address.number || ', ' || address.postal_code || ' ', address.city || ', ' || address.country`, `%${queryStr}%`)
        )
      )
    }

    const [totalCount] = await this.drizzle
      .select({ count: count() })
      .from(Establishment)
      .leftJoin(Address, sql`establishment.address_id = address.id`)
      .where(and(...filters))

    const establishmentsDB: EstablishmentDB[] = await this.drizzle
      .select({
        id: Establishment.id,
        name: Establishment.name,
        owner_id: Establishment.owner_id,
        address_id: Establishment.address_id,
        created_at: Establishment.created_at,
        updated_at: Establishment.updated_at
      })
      .from(Establishment)
      .leftJoin(Address, sql`establishment.address_id = address.id`)
      .where(and(...filters))
      .limit(limit)
      .offset((page - 1) * limit)

    const establishmentDTOs = await this.establishmentMapper.toDTOs(establishmentsDB)

    return {
      establishments: establishmentDTOs,
      totalEstablishments: (typeof totalCount.count === 'number' && !isNaN(totalCount.count)) ? totalCount.count : 0
    }
  }

  /**
   * @deprecated
   */
  async getAll (query: any): Promise<any> {
    throw new AppError(500, 'Method not implemented.', { code: 'METHOD_NOT_IMPLEMENTED', message: 'Method not implemented.' })
  }

  async getOneById (id: string): Promise<EstablishmentDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneById' }
    Logger.info(`Get Establishment document by ID "${id}"`, labels)

    const [establishmentDB]: EstablishmentDB[] = await this.drizzle
      .select()
      .from(Establishment)
      .where(eq(Establishment.id, id))
      .limit(1)

    return await this.establishmentMapper.toDTO(establishmentDB)
  }

  async getManyByIds (ids: string[]): Promise<EstablishmentDTO[]> {
    if (ids.length === 0) return []

    const establishmentsDB: EstablishmentDB[] = await this.drizzle
      .select()
      .from(Establishment)
      .where(inArray(Establishment.id, ids))

    return await this.establishmentMapper.toDTOs(establishmentsDB)
  }

  async createOne (data: EstablishmentDTO): Promise<EstablishmentDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'createOne' }
    Logger.info('Create Establishment document', labels)

    const addressData = this.addressMapper.toDB(data.address as AddressDTO)
    const { establishmentDB } = await this.drizzle.transaction(async (tx) => {
      const [addressDB] = await tx
        .insert(Address)
        .values(addressData)
        .returning()

      const establishmentData = this.establishmentMapper.toDB(data, addressDB.id)
      const [establishmentDB] = await tx
        .insert(Establishment)
        .values(establishmentData)
        .returning()

      return { establishmentDB }
    })

    return await this.establishmentMapper.toDTO(establishmentDB)
  }

  async updateOneById (id: string, data: EstablishmentDTO): Promise<EstablishmentDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateOne' }
    Logger.info(`Update Establishment document by ID "${id}"`, labels)

    const updates = this.establishmentMapper.toDB(data)

    const [establishmentDB]: EstablishmentDB[] = await this.drizzle
      .update(Establishment)
      .set(updates)
      .where(eq(Establishment.id, id))
      .returning()

    return await this.establishmentMapper.toDTO(establishmentDB)
  }

  async deleteOneById (id: string): Promise<void> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'deleteOneById' }
    Logger.info(`Delete Establishment document by ID "${id}"`, labels)

    await this.drizzle
      .delete(Establishment)
      .where(eq(Establishment.id, id))
      .returning()
  }
}
