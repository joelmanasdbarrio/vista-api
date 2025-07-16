import { Context } from 'hono'
import { getContext } from 'hono/context-storage'
import { BaseController } from '../base.controller'
import Logger, { LogLabels } from '../../utils/logger'
import { AccountService } from './account.service'
import { AccountDTO, AccountResponse, AccountsPaginatedDTO, AccountsResponse } from '../../types/vista-spec.types'
import AppError from '../../utils/error_handling/AppError'

export default class AccountController extends BaseController {
  protected resource = 'Account'
  protected accountService: AccountService

  constructor() {
    super()
    this.accountService = new AccountService()
  }

  async getAccounts(c: Context): Promise<AccountsResponse> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAccounts' }
    Logger.info('Get all Account documents paginated', labels)

    const { data, _meta } = await this.accountService.getAllAccountsPaginated(c, c.req.valid('query')) as AccountsPaginatedDTO

    Logger.info(`Found ${data.length} account(s)`, labels)
    Logger.debug(data)

    return {
      status: 'success',
      data,
      _meta
    }
  }

  async getAccount(c: Context): Promise<AccountResponse> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAccount' }
    Logger.info('Get Account document by ID or username', labels)

    const idOrUsername = c.req.param('id')
    const account = await this.accountService.getOneAccount(c, idOrUsername) as AccountDTO

    if (!account) {
      throw new AppError(404, `Account with ID or Username "${idOrUsername}" not found`, {
        code: 'ACCOUNT_NOT_FOUND',
        message: `Account with ID or Username "${idOrUsername}" not found`,
        details: 'Please, check if the desired ID or Username is correctly typed'
      })
    }

    Logger.info(`Found account "${account.username}" (${account.id})`, labels)
    Logger.debug(account)

    return {
      status: 'success',
      data: account
    }
  }

  async updateAccount(c: Context): Promise<AccountResponse> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateAccount' }
    Logger.info('Update Account document', labels)

    const body = c.req.valid('json') as AccountDTO
    const account = await this.accountService.updateOneAccount(c, body) as AccountDTO

    if (!account) {
      throw new AppError(404, `Account with ID or Username "${body.id}" not found`, {
        code: 'ACCOUNT_NOT_FOUND',
        message: `Account with ID or Username "${body.id}" not found`,
        details: 'Please, check if the desired ID or Username is correctly typed'
      })
    }

    Logger.info(`Updated account "${account.username}" (${account.id})`, labels)
    Logger.debug(account)

    return {
      status: 'success',
      data: account
    }
  }

  async deleteAccount(c: Context): Promise<void> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'deleteAccount' }
    Logger.info('Delete Account document by ID', labels)

    const user = getContext().var.user as AccountDTO
    await this.accountService.deleteOneAccount(c)

    Logger.info(`Deleted account "${user.name}" (${user.id})`, labels)
    Logger.debug(user)
  }
}
