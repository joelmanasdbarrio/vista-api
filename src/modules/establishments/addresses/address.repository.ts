import { eq } from 'drizzle-orm'
import { Context } from 'hono'
import { AddressDB, NewAddressDB } from 'src/types/database.types'
import AppError from 'src/utils/error_handling/AppError'
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
    throw new AppError(500, 'Method not implemented.', { code: 'METHOD_NOT_IMPLEMENTED', message: 'Method not implemented.' })
  }

  /**
   * @deprecated
   */
  async getAll (query: any): Promise<any> {
    throw new AppError(500, 'Method not implemented.', { code: 'METHOD_NOT_IMPLEMENTED', message: 'Method not implemented.' })
  }

  async getOneById (id: string): Promise<AddressDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneById' }
    Logger.info(`Get Address document by ID "${id}"`, labels)

    const [addressDB]: AddressDB[] = await this.drizzle
      .select()
      .from(Address)
      .where(
        eq(Address.id, id)
      )

    return await this.addressMapper.toDTO(addressDB)
  }

  async createOne (data: AddressDTO): Promise<any> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'createOne' }
    Logger.info('Create Address document', labels)

    const addressData: NewAddressDB = this.addressMapper.toDB(data)

    const [addressDB]: AddressDB[] = await this.drizzle
      .insert(Address)
      .values(addressData)
      .returning()

    return await this.addressMapper.toDTO(addressDB)
  }

  async updateOneById (id: string, data: AddressDTO): Promise<AddressDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateOneById' }
    Logger.info(`Update Address document by ID "${id}"`, labels)

    const updates: NewAddressDB = this.addressMapper.toDB(data)

    const [addressDB]: AddressDB[] = await this.drizzle
      .update(Address)
      .set(updates)
      .where(eq(Address.id, id))
      .returning()

    return await this.addressMapper.toDTO(addressDB)
  }

  /**
   * @deprecated
   */
  async deleteOneById (id: string): Promise<void> {
    throw new AppError(500, 'Method not implemented.', { code: 'METHOD_NOT_IMPLEMENTED', message: 'Method not implemented.' })
  }
}
