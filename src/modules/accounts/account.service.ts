import { Context } from 'hono'
import { validate as uuidValidate } from 'uuid'
import BaseService from '../base.service'
import Logger, { LogLabels } from '../../utils/logger'
import { AccountDTO, AccountsPaginatedDTO, GetAccountsQuery } from '../../types/vista-spec.types'
import AccountRepository from './account.repository'
import AppError from '../../utils/error_handling/AppError'
import '../../types/hono.types'

export default class AccountService extends BaseService {
  protected resource = 'Account'

  constructor() {
    super()
  }

  async getAllAccountsPaginated(c: Context, query: GetAccountsQuery): Promise<AccountsPaginatedDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAllAccountsPaginated' }
    Logger.info('Get Account documents paginated', labels)

    const accountRepository = new AccountRepository(c)
    const { accounts, totalAccounts } = await accountRepository.getAllPaginated(query)

    return {
      data: accounts,
      _meta: {
        page: query.page || 1,
        limit: query.limit || 10,
        results: accounts.length,
        total: totalAccounts,
      }
    }
  }

  async getOneAccount(c: Context, idOrUsername: string): Promise<AccountDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneAccount' }
    Logger.info(`Get Account document by ID or username "${idOrUsername}"`, labels)

    const accountRepository = new AccountRepository(c)
    const isId = uuidValidate(idOrUsername)
    const account = isId
      ? await accountRepository.getOneById(idOrUsername)
      : await accountRepository.getOneByUsername(idOrUsername)

    return account
  }

  async updateOneAccount(c: Context, body: AccountDTO): Promise<AccountDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateOneAccount' }
    Logger.info(`Update Account document`, labels)

    const user = c.get('user') as AccountDTO

    if (JSON.stringify(user.id) !== JSON.stringify(body.id)) throw new AppError(403, 'Forbidden', { code: 'FORBIDDEN', message: 'Forbidden', details: 'You can only update your own account.' })

    const accountRepository = new AccountRepository(c)
    const account = await accountRepository.updateOneById(body.id, body, user)

    return account
  }

  async deleteOneAccount(c: Context): Promise<void> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'deleteOneAccount' }
    Logger.info(`Delete Account document`, labels)

    const user = c.get('user') as AccountDTO

    const accountRepository = new AccountRepository(c)
    await accountRepository.deleteOneById(user.id)
  }
}