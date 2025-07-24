import { eq } from 'drizzle-orm'
import { Context } from 'hono'
import { Address } from '../../../db/schema'
import { AddressDTO } from '../../../types/vista-spec.types'
import Logger, { LogLabels } from '../../../utils/logger'
import BaseRepository from '../../base.repository'
import AddressMapper from './address.mapper'

export default class AddressRepository extends BaseRepository {
  protected resource = 'Address'
  protected addressMapper: AddressMapper

  constructor (c: Context) {
    super(c)
    this.addressMapper = new AddressMapper()
  }

  /**
   * @deprecated
   */
  async getAllPaginated (query: any): Promise<any> {
    throw new Error('Method not implemented.')
  }

  /**
   * @deprecated
   */
  async getAll (query: any): Promise<any> {
    throw new Error('Method not implemented.')
  }

  async getOneById (id: string): Promise<AddressDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneById' }
    Logger.info('Get Address document by ID', labels)

    const [addressDB]: Array<typeof Address.$inferSelect> = await this.drizzle
      .select()
      .from(Address)
      .where(
        eq(Address.id, id)
      )

    return this.addressMapper.toDTO(addressDB)
  }

  async createOne (data: AddressDTO): Promise<any> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'createOne' }
    Logger.info('Create Address document', labels)

    const addressData: typeof Address.$inferInsert = this.addressMapper.toDB(data)

    const [addressDB]: Array<typeof Address.$inferSelect> = await this.drizzle
      .insert(Address)
      .values(addressData)
      .returning()

    return this.addressMapper.toDTO(addressDB)
  }

  async updateOneById (id: string, data: AddressDTO): Promise<AddressDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateOneById' }
    Logger.info('Update Address document', labels)

    const updates: typeof Address.$inferInsert = this.addressMapper.toDB(data)

    const [addressDB]: Array<typeof Address.$inferSelect> = await this.drizzle
      .update(Address)
      .set(updates)
      .where(eq(Address.id, id))
      .returning()

    return this.addressMapper.toDTO(addressDB)
  }

  /**
   * @deprecated
   */
  async deleteOneById (id: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
