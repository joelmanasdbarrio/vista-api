import { Context } from 'hono'
import { EstablishmentDB, NewEstablishmentDB } from 'src/types/database.types'
import getId from 'src/utils/getId'
import { AccountTypeEnum, EstablishmentDTO } from '../../types/vista-spec.types'
import AppError from '../../utils/error_handling/AppError'
import AccountService from '../accounts/account.service'
import BaseMapper from '../base.mapper'
import AddressService from './addresses/address.service'

export default class EstablishmentMapper extends BaseMapper<EstablishmentDB, EstablishmentDTO> {
  private readonly c: Context

  constructor (c: Context) {
    super()
    this.c = c
  }

  async toDTO (input: EstablishmentDB): Promise<EstablishmentDTO> {
    const accountService = new AccountService()
    const ownerDTO = await accountService.getOneAccount(this.c, { id: input.owner_id })
    if (ownerDTO == null) {
      throw new AppError(404, `Establishment owner with ID "${input.owner_id}" not found`, {
        code: 'ESTABLISHMENT_OWNER_NOT_FOUND',
        message: `Establishment owner with ID "${input.owner_id}" not found`,
        details: 'Please, check if the establishment owner ID is correct.'
      })
    }

    if (ownerDTO.type !== AccountTypeEnum.ENTERPRISE) {
      throw new AppError(400, 'Invalid Account type', {
        code: 'INVALID_ACCOUNT_TYPE',
        message: 'Invalid Account type',
        details: `The establishment owner account type "${ownerDTO.type}" is not supported. Please, use "${AccountTypeEnum.ENTERPRISE}" account type for establishment owners instead.`
      })
    }

    const addressService = new AddressService()
    const addressDTO = await addressService.getOneAddress(this.c, { id: input.address_id })
    if (addressDTO == null) {
      throw new AppError(404, `Establishment address with ID "${input.address_id}" not found`, {
        code: 'ESTABLISHMENT_ADDRESS_NOT_FOUND',
        message: `Establishment address with ID "${input.address_id}" not found`,
        details: 'Please, check if the establishment address ID is correct.'
      })
    }

    return {
      id: input.id,
      owner: ownerDTO,
      address: addressDTO,
      name: input.name,
      createdAt: input.created_at.toISOString(),
      updatedAt: input.updated_at.toISOString()
    }
  }

  async toDTOs (inputs: EstablishmentDB[]): Promise<EstablishmentDTO[]> {
    const ownerIds = [...new Set(inputs.map(input => input.owner_id))]
    const addressIds = [...new Set(inputs.map(input => input.address_id))]
    const [owners, addresses] = await Promise.all([
      new AccountService().getManyAccountsByIds(this.c, ownerIds),
      new AddressService().getManyAddressesByIds(this.c, addressIds)
    ])
    const ownersById = new Map(owners.map(owner => [owner.id, owner]))
    const addressesById = new Map(addresses.map(address => [address.id, address]))

    return inputs.map(input => {
      const ownerDTO = ownersById.get(input.owner_id)
      if (ownerDTO == null) {
        throw new AppError(404, `Establishment owner with ID "${input.owner_id}" not found`, {
          code: 'ESTABLISHMENT_OWNER_NOT_FOUND',
          message: `Establishment owner with ID "${input.owner_id}" not found`
        })
      }

      if (ownerDTO.type !== AccountTypeEnum.ENTERPRISE) {
        throw new AppError(400, 'Invalid Account type', {
          code: 'INVALID_ACCOUNT_TYPE',
          message: 'Invalid Account type'
        })
      }

      const addressDTO = addressesById.get(input.address_id)
      if (addressDTO == null) {
        throw new AppError(404, `Establishment address with ID "${input.address_id}" not found`, {
          code: 'ESTABLISHMENT_ADDRESS_NOT_FOUND',
          message: `Establishment address with ID "${input.address_id}" not found`
        })
      }

      return {
        id: input.id,
        owner: ownerDTO,
        address: addressDTO,
        name: input.name,
        createdAt: input.created_at.toISOString(),
        updatedAt: input.updated_at.toISOString()
      }
    })
  }

  toDB (data: EstablishmentDTO): NewEstablishmentDB {
    const ownerId = getId(data.owner)
    if (!ownerId) {
      throw new AppError(400, 'Establishment owner ID is required', {
        code: 'ESTABLISHMENT_OWNER_ID_REQUIRED',
        message: 'Establishment owner ID is required',
        details: 'Please, provide a valid owner ID for the establishment.'
      })
    }

    const addressId = getId(data.address)
    if (!addressId) {
      throw new AppError(400, 'Establishment address ID is required', {
        code: 'ESTABLISHMENT_ADDRESS_ID_REQUIRED',
        message: 'Establishment address ID is required',
        details: 'Please, provide a valid address ID for the establishment.'
      })
    }

    return {
      name: data.name,
      owner_id: ownerId,
      address_id: addressId,
      updated_at: new Date()
    }
  }
}
