import { sql } from 'drizzle-orm'
import { Context } from 'hono'
import { Establishment } from '../../db/schema'
import { AccountTypeEnum, AddressDTO, EstablishmentDTO } from '../../types/vista-spec.types'
import AppError from '../../utils/error_handling/AppError'
import AccountService from '../accounts/account.service'
import AddressService from './addresses/address.service'

export default class EstablishmentMapper {
  private readonly c: Context

  constructor (c: Context) {
    this.c = c
  }

  async toDTO (input: typeof Establishment.$inferSelect): Promise<EstablishmentDTO> {
    const accountService = new AccountService()
    const ownerDTO = await accountService.getOneAccount(this.c, { id: input.owner_id })
    if (ownerDTO == null) throw new AppError(404, 'Establishment owner not found', { code: 'ESTABLISHMENT_OWNER_NOT_FOUND', message: 'Establishment owner not found' })
    if (ownerDTO.type !== AccountTypeEnum.ENTERPRISE) throw new AppError(400, 'Establishment owner must be an enterprise', { code: 'ESTABLISHMENT_OWNER_NOT_ENTERPRISE', message: 'Establishment owner must be an enterprise' })

    const addressService = new AddressService()
    const addressDTO: AddressDTO = await addressService.getOneAddress(this.c, { id: input.address_id }) as AddressDTO
    if (addressDTO == null) throw new AppError(404, 'Establishment address not found', { code: 'ESTABLISHMENT_ADDRESS_NOT_FOUND', message: 'Establishment address not found' })

    return {
      id: input.id,
      owner: ownerDTO,
      address: addressDTO,
      name: input.name,
      createdAt: input.created_at.toISOString(),
      updatedAt: input.updated_at.toISOString()
    }
  }

  async toDTOs (inputs: Array<typeof Establishment.$inferSelect>): Promise<EstablishmentDTO[]> {
    return await Promise.all(inputs.map(async input => await this.toDTO(input)))
  }

  toDB (data: EstablishmentDTO): typeof Establishment.$inferInsert {
    const output: Record<string, any> = {
      name: data.name,
      owner_id: data.owner.id,
      address_id: data.address.id,
      updated_at: sql`NOW()`
    }

    return output as typeof Establishment.$inferInsert
  }
}
