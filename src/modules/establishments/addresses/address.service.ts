import { Context } from 'hono'
import AppError from 'src/utils/error_handling/AppError'
import { AddressDTO } from '../../../types/vista-spec.types'
import Logger, { LogLabels } from '../../../utils/logger'
import BaseService from '../../base.service'
import AddressRepository from './address.repository'
import { GetAddressParam, PatchAddressBody, PostAddressBody } from './lib/address.validations'

export default class AddressService extends BaseService {
  protected resource = 'Address'

  async getOneAddress (c: Context, { id }: GetAddressParam): Promise<AddressDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneAddress' }
    Logger.info('Get Address document by ID', labels)

    const addressRepository = new AddressRepository(c)
    return await addressRepository.getOneById(id)
  }

  async getManyAddressesByIds (c: Context, ids: string[]): Promise<AddressDTO[]> {
    const addressRepository = new AddressRepository(c)
    return await addressRepository.getManyByIds(ids)
  }

  async createAddress (c: Context, body: PostAddressBody): Promise<AddressDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'createNewAddress' }
    Logger.info('Create a new Address document', labels)

    const addressToCreate: AddressDTO = {
      country: body.country,
      postalCode: body.postalCode,
      city: body.city,
      street: body.street,
      number: body.number,
      block: body.block ?? '',
      floor: body.floor ?? '',
      stair: body.stair ?? '',
      door: body.door ?? '',
      coordinates: {
        latitude: body.coordinates.latitude,
        longitude: body.coordinates.longitude
      }
    }

    const addressRepository = new AddressRepository(c)
    return await addressRepository.createOne(addressToCreate)
  }

  async updateAddress (c: Context, id: string, body: PatchAddressBody): Promise<AddressDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateAddress' }
    Logger.info('Update Address document', labels)

    const address = await this.getOneAddress(c, { id })
    if (address == null) {
      throw new AppError(404, 'Not Found', {
        code: 'ADDRESS_NOT_FOUND',
        message: `Address with ID "${id}" not found`,
        details: 'Please, check if the desired ID is correctly typed'
      })
    }

    const addressToUpdate: AddressDTO = {
      country: body.country ?? address.country,
      postalCode: body.postalCode ?? address.postalCode,
      city: body.city ?? address.city,
      street: body.street ?? address.street,
      number: body.number ?? address.number,
      block: body.block ?? address.block ?? '',
      floor: body.floor ?? address.floor ?? '',
      stair: body.stair ?? address.stair ?? '',
      door: body.door ?? address.door ?? '',
      coordinates: {
        latitude: body.coordinates?.latitude ?? address.coordinates.latitude,
        longitude: body.coordinates?.longitude ?? address.coordinates.longitude
      }
    }

    const addressRepository = new AddressRepository(c)
    return await addressRepository.updateOneById(id, addressToUpdate)
  }
}
