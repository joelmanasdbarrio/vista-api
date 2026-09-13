import { and, count, eq, inArray, like, or, sql, SQL } from 'drizzle-orm'
import { Context } from 'hono'
import { AccountDB } from 'src/types/database.types'
import AppError from 'src/utils/error_handling/AppError'
import { Account } from '../../db/schema'
import { AccountDTO, AccountTypeEnum } from '../../types/vista-spec.types'
import Logger, { LogLabels } from '../../utils/logger'
import BaseRepository from '../base.repository'
import AccountMapper from './account.mapper'
import { GetAccountsQuery } from './lib/account.validations'

export default class AccountRepository extends BaseRepository {
  protected resource = 'Account'
  protected accountMapper: AccountMapper

  constructor (c: Context) {
    super(c)
    this.accountMapper = new AccountMapper()
  }

  async getAllPaginated ({ page = 1, limit = 10, name = '', username = '', type = AccountTypeEnum.PERSONAL }: GetAccountsQuery): Promise<{ accounts: AccountDTO[], totalAccounts: number }> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAllPaginated' }
    Logger.info('Get Account documents paginated', labels)

    const queryStr: string = (name || username)?.trim().toLowerCase()
    const filters: Array<SQL | undefined> = [
      eq(Account.type, type)
    ]

    if (queryStr !== undefined && queryStr.length > 0) {
      filters.push(
        or(
          like(sql`LOWER(${Account.name})`, `%${queryStr}%`),
          like(sql`LOWER(${Account.username})`, `%${queryStr}%`)
        )
      )
    }

    const [totalCount] = await this.drizzle
      .select({ count: count() })
      .from(Account)
      .where(and(...filters))

    const accountsDB: AccountDB[] = await this.drizzle
      .select()
      .from(Account)
      .where(and(...filters))
      .limit(limit)
      .offset((page - 1) * limit)

    const accountDTOs = await this.accountMapper.toDTOs(accountsDB)

    return {
      accounts: accountDTOs,
      totalAccounts: (typeof totalCount.count === 'number' && !isNaN(totalCount.count)) ? totalCount.count : 0
    }
  }

  /**
   * @deprecated
   */
  async getAll (query: any): Promise<any> {
    throw new AppError(500, 'Method not implemented.', { code: 'METHOD_NOT_IMPLEMENTED', message: 'Method not implemented.' })
  }

  async getOneById (id: string): Promise<AccountDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneById' }
    Logger.info(`Get Account document by ID "${id}"`, labels)

    const [accountDB]: AccountDB[] = await this.drizzle
      .select()
      .from(Account)
      .where(
        eq(Account.id, id)
      )

    return await this.accountMapper.toDTO(accountDB)
  }

  async getManyByIds (ids: string[]): Promise<AccountDTO[]> {
    if (ids.length === 0) return []

    const accountsDB: AccountDB[] = await this.drizzle
      .select()
      .from(Account)
      .where(inArray(Account.id, ids))

    return await this.accountMapper.toDTOs(accountsDB)
  }

  async getOneByUsername (username: string): Promise<AccountDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneByUsername' }
    Logger.info(`Get Account document by username "${username}"`, labels)

    const [accountDB]: AccountDB[] = await this.drizzle
      .select()
      .from(Account)
      .where(
        eq(Account.username, username)
      )

    const accountMapper = new AccountMapper()
    return await accountMapper.toDTO(accountDB)
  }

  async getOneByEmail (email: string): Promise<AccountDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneByEmail' }
    Logger.info(`Get Account document by email "${email}"`, labels)

    const [accountDB]: AccountDB[] = await this.drizzle
      .select()
      .from(Account)
      .where(
        eq(Account.email, email)
      )

    const accountMapper = new AccountMapper()
    return accountDB && await accountMapper.toDTO(accountDB)
  }

  /**
   * @deprecated
   */
  async createOne (data: any): Promise<any> {
    throw new AppError(500, 'Method not implemented.', { code: 'METHOD_NOT_IMPLEMENTED', message: 'Method not implemented.' })
  }

  async updateOneById (id: string, data: AccountDTO): Promise<AccountDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateOneById' }
    Logger.info(`Update Account document by ID "${id}"`, labels)

    const updates = this.accountMapper.toDB(data)

    Logger.info('Updates to be applied')
    Logger.debug(updates)

    const [accountDB]: AccountDB[] = await this.drizzle
      .update(Account)
      .set(updates)
      .where(eq(Account.id, id))
      .returning()

    return await this.accountMapper.toDTO(accountDB)
  }

  async deleteOneById (id: string): Promise<void> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'deleteOneById' }
    Logger.info(`Delete Account document by ID "${id}"`, labels)

    await this.drizzle
      .delete(Account)
      .where(
        eq(Account.id, id)
      ).returning()
  }
}
