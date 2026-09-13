import { Context } from 'hono'
import getId from 'src/utils/getId'
import { AccountEnterpriseDTO, AccountTypeEnum, AddressDTO, EstablishmentDTO, EstablishmentsPaginatedDTO } from '../../types/vista-spec.types'
import AppError from '../../utils/error_handling/AppError'
import Logger, { LogLabels } from '../../utils/logger'
import AccountService from '../accounts/account.service'
import BaseService from '../base.service'
import AddressService from './addresses/address.service'
import EstablishmentRepository from './establishment.repository'
import { DeleteEstablishmentParam, EstablishmentSchema, GetEstablishmentParam, GetEstablishmentsQuery, PatchEstablishmentBody, PostEstablishmentBody } from './lib/establishments.validations'

export default class EstablishmentService extends BaseService {
  protected resource = 'Establishment'

  async getAllEstablishmentsPaginated (c: Context, query: GetEstablishmentsQuery): Promise<EstablishmentsPaginatedDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAllEstablishmentsPaginated' }
    Logger.info('Get Establishment documents paginated', labels)

    const establishmentRepository = new EstablishmentRepository(c)
    const { establishments, totalEstablishments } = await establishmentRepository.getAllPaginated(query)

    return {
      data: establishments,
      _meta: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        results: establishments.length,
        total: totalEstablishments
      }
    }
  }

  async getOneEstablishment (c: Context, { id }: GetEstablishmentParam): Promise<EstablishmentDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneEstablishment' }
    Logger.info(`Get Establishment document by ID "${id}"`, labels)

    const establishmentRepository = new EstablishmentRepository(c)
    return await establishmentRepository.getOneById(id)
  }

  async getManyEstablishmentsByIds (c: Context, ids: string[]): Promise<EstablishmentDTO[]> {
    const establishmentRepository = new EstablishmentRepository(c)
    return await establishmentRepository.getManyByIds(ids)
  }

  async createEstablishment (c: Context, body: PostEstablishmentBody): Promise<EstablishmentDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'createNewEstablishment' }
    Logger.info('Create a new Establishment document', labels)

    const user = c.get('user')
    if (user.type !== AccountTypeEnum.ENTERPRISE) {
      throw new AppError(403, 'Forbidden Account type', {
        code: 'FORBIDDEN_ACCOUNT_TYPE',
        message: 'Forbidden Account type',
        details: 'The owner of an Establishment must be an Enterprise Account.'
      })
    }

    const parsedBody = EstablishmentSchema.parse(body)

    const establishmentToCreate: EstablishmentDTO = {
      ...parsedBody,
      owner: user,
      address: body.address
    }

    const establishmentRepository = new EstablishmentRepository(c)
    return await establishmentRepository.createOne(establishmentToCreate)
  }

  async updateOneEstablishment (c: Context, id: string, body: PatchEstablishmentBody): Promise<EstablishmentDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateOneEstablishment' }
    Logger.info('Update Establishment document', labels)

    if ((body.id !== null) && (JSON.stringify(body.id) !== JSON.stringify(id))) {
      throw new AppError(400, 'Bad Request', {
        code: 'ESTABLISHMENT_ID_MISMATCH',
        message: 'Establishment ID mismatch',
        details: 'The provided ID does not match the Establishment ID in the body.'
      })
    }

    const establishmentDTO = await this.getOneEstablishment(c, { id })
    if (establishmentDTO == null) {
      throw new AppError(404, `Establishment with ID "${id}" not found`, {
        code: 'ESTABLISHMENT_NOT_FOUND',
        message: `Establishment with ID "${id}" not found`,
        details: 'Please, check if the desired ID is correctly typed.'
      })
    }

    const ownerId = getId(establishmentDTO.owner)

    if (JSON.stringify(c.get('user').id) !== JSON.stringify(ownerId)) {
      throw new AppError(403, 'Forbidden', {
        code: 'FORBIDDEN',
        message: 'Forbidden',
        details: 'You can only update Establishments you own.'
      })
    }

    let updatedAddress: AddressDTO
    if (body.address?.id != null) {
      const addressService = new AddressService()
      updatedAddress = await addressService.updateAddress(c, body.address.id, body.address)
    } else {
      updatedAddress = establishmentDTO.address as AddressDTO
    }

    let updatedOwner: AccountEnterpriseDTO | undefined
    const newOwnerId = getId(establishmentDTO.owner)
    if (newOwnerId) {
      const accountService = new AccountService()
      updatedOwner = await accountService.getOneAccount(c, { id: newOwnerId }) as AccountEnterpriseDTO | undefined

      if (updatedOwner == null) {
        throw new AppError(404, `Account with ID "${newOwnerId}" not found`, {
          code: 'ACCOUNT_NOT_FOUND',
          message: `Account with ID "${newOwnerId}" not found`,
          details: 'Please, check if the desired ID is correctly typed.'
        })
      } else if (updatedOwner.type !== AccountTypeEnum.ENTERPRISE) {
        throw new AppError(400, 'Forbidden account type', {
          code: 'FORBIDDEN_ACCOUNT_TYPE',
          message: 'Forbidden account type',
          details: 'The owner of an establishment must be an enterprise account.'
        })
      }
    } else {
      updatedOwner = establishmentDTO.owner as AccountEnterpriseDTO
    }

    const establishmentToUpdate: EstablishmentDTO = {
      name: body.name ?? establishmentDTO.name,
      owner: updatedOwner,
      address: updatedAddress,
      updatedAt: new Date().toISOString()
    }

    const establishmentRepository = new EstablishmentRepository(c)
    return await establishmentRepository.updateOneById(id, establishmentToUpdate)
  }

  async deleteOneEstablishment (c: Context, { id }: DeleteEstablishmentParam): Promise<void> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'deleteOneEstablishment' }
    Logger.info(`Delete Establishment document by ID "${id}"`, labels)

    const establishment = await this.getOneEstablishment(c, { id })
    if (establishment == null) {
      throw new AppError(404, 'Not Found', {
        code: 'ESTABLISHMENT_NOT_FOUND',
        message: 'Establishment not found',
        details: `No establishment found with ID "${id}"`
      })
    }

    if (JSON.stringify(c.get('user').id) !== JSON.stringify((establishment.owner as AccountEnterpriseDTO).id)) {
      throw new AppError(403, 'Forbidden', {
        code: 'FORBIDDEN',
        message: 'Forbidden',
        details: 'You can only update establishments you own.'
      })
    }

    const establishmentRepository = new EstablishmentRepository(c)
    await establishmentRepository.deleteOneById(id)
  }
}
