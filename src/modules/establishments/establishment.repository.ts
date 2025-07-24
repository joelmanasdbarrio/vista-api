import { and, count, eq, like, or, SQL, sql } from 'drizzle-orm'
import { Context } from 'hono'
import { Address, Establishment } from '../../db/schema'
import { EstablishmentDTO } from '../../types/vista-spec.types'
import Logger, { LogLabels } from '../../utils/logger'
import BaseRepository from '../base.repository'
import EstablishmentMapper from './establishment.mapper'

export default class EstablishmentRepository extends BaseRepository {
  protected resource = 'Establishment'
  protected establishmentMapper: EstablishmentMapper

  constructor (c: Context) {
    super(c)
    this.establishmentMapper = new EstablishmentMapper(c)
  }

  async getAllPaginated ({ page = 1, limit = 10, name = '', address = '' }): Promise<{ establishments: EstablishmentDTO[], totalEstablishments: number }> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAllPaginated' }
    Logger.info('Get Establishment documents paginated', labels)

    const queryStr = (name || address)?.trim().toLowerCase()
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

    const establishmentsDB: Array<typeof Establishment.$inferSelect> = await this.drizzle
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
    throw new Error('Method not implemented.')
  }

  async getOneById (id: string): Promise<EstablishmentDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneById' }
    Logger.info('Get Establishment document', labels)

    const [establishmentDB]: Array<typeof Establishment.$inferSelect> = await this.drizzle
      .select()
      .from(Establishment)
      .where(
        eq(Establishment.id, id)
      )

    return await this.establishmentMapper.toDTO(establishmentDB)
  }

  async createOne (data: EstablishmentDTO): Promise<EstablishmentDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'createOne' }
    Logger.info('Create Establishment document', labels)

    const establishmentData: typeof Establishment.$inferInsert = this.establishmentMapper.toDB(data)

    const [establishmentDB]: Array<typeof Establishment.$inferSelect> = await this.drizzle
      .insert(Establishment)
      .values(establishmentData)
      .returning()

    return await this.establishmentMapper.toDTO(establishmentDB)
  }

  async updateOneById (id: string, data: EstablishmentDTO): Promise<EstablishmentDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateOne' }
    Logger.info('Update Establishment document', labels)

    const updates: typeof Establishment.$inferInsert = this.establishmentMapper.toDB(data)

    const [establishmentDB]: Array<typeof Establishment.$inferSelect> = await this.drizzle
      .update(Establishment)
      .set(updates)
      .where(eq(Establishment.id, id))
      .returning()

    return await this.establishmentMapper.toDTO(establishmentDB)
  }

  async deleteOneById (id: string): Promise<void> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'deleteOneById' }
    Logger.info('Delete Establishment document', labels)

    await this.drizzle
      .delete(Establishment)
      .where(
        eq(Establishment.id, id)
      ).returning()
  }
}
