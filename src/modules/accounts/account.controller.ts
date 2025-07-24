import { Context } from 'hono'
import '../../types/hono.types'
import { AccountResponse, AccountsResponse } from '../../types/vista-spec.types'
import AppError from '../../utils/error_handling/AppError'
import Logger, { LogLabels } from '../../utils/logger'
import BaseController from '../base.controller'
import AccountService from './account.service'
import { GetAccountInput, GetAccountsInput, PatchAccountInput } from './lib/account.validations'

export default class AccountController extends BaseController {
  protected resource = 'Account'
  protected accountService: AccountService

  constructor () {
    super()
    this.accountService = new AccountService()
  }

  async getAccounts (c: Context<any, any, GetAccountsInput>): Promise<AccountsResponse> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAccounts' }
    Logger.info('Get all Account documents paginated', labels)

    const { data, _meta } = await this.accountService.getAllAccountsPaginated(c, c.req.valid('query'))

    Logger.info(`Found ${data.length} account(s)`, labels)
    Logger.debug(data)

    return {
      status: 'success',
      data,
      _meta
    }
  }

  async getAccount (c: Context<any, any, GetAccountInput>): Promise<AccountResponse> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAccount' }
    Logger.info('Get Account document by ID or username', labels)

    const idOrUsername = c.req.param('id')
    const account = await this.accountService.getOneAccount(c, { id: idOrUsername })

    if (account == null) {
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

  async updateAccount (c: Context<any, any, PatchAccountInput>): Promise<AccountResponse> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateAccount' }
    Logger.info('Update Account document', labels)

    const body = c.req.valid('json')
    const account = await this.accountService.updateOneAccount(c, body)

    Logger.info(`Updated account "${account.username}" (${account.id})`, labels)
    Logger.debug(account)

    return {
      status: 'success',
      data: account
    }
  }

  async deleteAccount (c: Context): Promise<void> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'deleteAccount' }
    Logger.info('Delete Account document by ID', labels)

    const user = c.get('user')
    await this.accountService.deleteOneAccount(c)

    Logger.info(`Deleted account "${user.name}" (${user.id})`, labels)
  }
}
