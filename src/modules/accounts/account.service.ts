import { Context } from 'hono'
import { validate as uuidValidate } from 'uuid'
import { AccountDTO, AccountEnterpriseDTO, AccountPersonalDTO, AccountsPaginatedDTO, AccountTypeEnum } from '../../types/vista-spec.types'
import AppError from '../../utils/error_handling/AppError'
import Logger, { LogLabels } from '../../utils/logger'
import BaseService from '../base.service'
import AccountRepository from './account.repository'
import { GetAccountParam, GetAccountsQuery, PatchAccountBody } from './lib/account.validations'

export default class AccountService extends BaseService {
  protected resource = 'Account'

  async getAllAccountsPaginated (c: Context, query: GetAccountsQuery): Promise<AccountsPaginatedDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAllAccountsPaginated' }
    Logger.info('Get Account documents paginated', labels)

    const accountRepository = new AccountRepository(c)
    const { accounts, totalAccounts } = await accountRepository.getAllPaginated(query)

    return {
      data: accounts,
      _meta: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        results: accounts.length,
        total: totalAccounts
      }
    }
  }

  async getOneAccount (c: Context, { id: idOrUsername }: GetAccountParam): Promise<AccountDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneAccount' }
    Logger.info(`Get Account document by ID or username "${idOrUsername}"`, labels)

    const accountRepository = new AccountRepository(c)
    const isId = uuidValidate(idOrUsername)
    const account = isId
      ? await accountRepository.getOneById(idOrUsername)
      : await accountRepository.getOneByUsername(idOrUsername)

    return account
  }

  async updateOneAccount (c: Context, body: PatchAccountBody): Promise<AccountDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateOneAccount' }
    Logger.info('Update Account document', labels)

    const user = c.get('user')

    if (body.type === AccountTypeEnum.PERSONAL) {
      return await this.updatePersonalAccount(c, body, user as AccountPersonalDTO)
    } else if (body.type === AccountTypeEnum.ENTERPRISE) {
      return await this.updateEnterpriseAccount(c, body, user as AccountEnterpriseDTO)
    } else {
      throw new AppError(400, 'Invalid account type', {
        code: 'INVALID_ACCOUNT_TYPE',
        message: 'Invalid account type',
        details: 'Account type mismatch.'
      })
    }
  }

  private async updatePersonalAccount (c: Context, body: PatchAccountBody, user: AccountPersonalDTO): Promise<AccountPersonalDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updatePersonalAccount' }
    Logger.info('Update Personal Account document', labels)

    const accountToUpdate: AccountPersonalDTO = {
      id: user.id,
      name: body.name ?? user.name,
      username: body.username ?? user.username,
      email: user.email,
      biography: body.biography ?? user.biography,
      avatar: body.avatar ?? user.avatar,
      website: body.website ?? user.website,
      updatedAt: new Date().toISOString(),
      gender: body.gender ?? user.gender,
      birthdate: body.birthdate
        ? body.birthdate.toISOString()
        : user.birthdate
          ? user.birthdate
          : '',
      isPrivate: body.isPrivate ?? user.isPrivate ?? false,
      type: AccountTypeEnum.PERSONAL,
      accountType: 'AccountPersonalDTO'
    }

    const accountRepository = new AccountRepository(c)
    return await accountRepository.updateOneById(user.id, accountToUpdate) as AccountPersonalDTO
  }

  private async updateEnterpriseAccount (c: Context, body: PatchAccountBody, user: AccountEnterpriseDTO): Promise<AccountEnterpriseDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateEnterpriseAccount' }
    Logger.info('Update Enterprise Account document', labels)

    const accountToUpdate: AccountEnterpriseDTO = {
      id: user.id,
      name: body.name ?? user.name,
      username: body.username ?? user.username,
      email: user.email,
      biography: body.biography ?? user.biography,
      avatar: body.avatar ?? user.avatar,
      website: body.website ?? user.website,
      updatedAt: new Date().toISOString(),
      isVerified: user.type === AccountTypeEnum.ENTERPRISE ? user.isVerified ?? false : false,
      isPrivate: body.isPrivate ?? user.isPrivate ?? false,
      type: AccountTypeEnum.ENTERPRISE,
      accountType: 'AccountEnterpriseDTO'
    }

    const accountRepository = new AccountRepository(c)
    return await accountRepository.updateOneById(user.id, accountToUpdate) as AccountEnterpriseDTO
  }

  async deleteOneAccount (c: Context): Promise<void> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'deleteOneAccount' }
    Logger.info('Delete Account document', labels)

    const user = c.get('user')

    const accountRepository = new AccountRepository(c)
    await accountRepository.deleteOneById(user.id)
  }
}
