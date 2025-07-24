import { and, count, eq, like, or, SQL } from 'drizzle-orm'
import { Context } from 'hono'
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
          like(Account.name, `%${queryStr}%`),
          like(Account.username, `%${queryStr}%`)
        )
      )
    }

    const [totalCount] = await this.drizzle
      .select({ count: count() })
      .from(Account)
      .where(and(...filters))

    const accountsDB: Array<typeof Account.$inferSelect> = await this.drizzle
      .select()
      .from(Account)
      .where(and(...filters))
      .limit(limit)
      .offset((page - 1) * limit)

    const accountDTOs = this.accountMapper.toDTOs(accountsDB)

    return {
      accounts: accountDTOs,
      totalAccounts: (typeof totalCount.count === 'number' && !isNaN(totalCount.count)) ? totalCount.count : 0
    }
  }

  /**
   * @deprecated
   */
  async getAll (query: any): Promise<any> {
    throw new Error('Method not implemented.')
  }

  async getOneById (id: string): Promise<AccountDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneById' }
    Logger.info('Get Account document', labels)

    const [accountDB]: Array<typeof Account.$inferSelect> = await this.drizzle
      .select()
      .from(Account)
      .where(
        eq(Account.id, id)
      )

    return this.accountMapper.toDTO(accountDB)
  }

  async getOneByUsername (username: string): Promise<AccountDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneByUsername' }
    Logger.info('Get Account document', labels)

    const [accountDB]: Array<typeof Account.$inferSelect> = await this.drizzle
      .select()
      .from(Account)
      .where(
        eq(Account.username, username)
      )

    const accountMapper = new AccountMapper()
    return accountMapper.toDTO(accountDB)
  }

  /**
   * @deprecated
   */
  async createOne (data: any): Promise<any> {
    throw new Error('Method not implemented.')
  }

  async updateOneById (id: string, data: AccountDTO): Promise<AccountDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateOneById' }
    Logger.info('Update Account document', labels)

    const updates: typeof Account.$inferInsert = this.accountMapper.toDB(data)

    Logger.info('Updates to be applied')
    Logger.debug(updates)

    const [accountDB]: Array<typeof Account.$inferSelect> = await this.drizzle
      .update(Account)
      .set(updates)
      .where(eq(Account.id, id))
      .returning()

    // const [accountDB]: typeof account.$inferSelect[] = await this.drizzle.transaction(async (tx) => {
    //   await tx.execute(
    //     sql`SELECT set_config('request.jwt.claim.sub', ${user.id}, TRUE)`
    //   )
    //   await tx.execute(sql`SET ROLE authenticated`)
    //   return tx
    //     .update(account)
    //     .set(updates)
    //     .where(eq(account.id, id))
    //     .returning()
    // })

    return this.accountMapper.toDTO(accountDB)
  }

  async deleteOneById (id: string): Promise<void> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'deleteOneById' }
    Logger.info('Delete Account document', labels)

    await this.drizzle
      .delete(Account)
      .where(
        eq(Account.id, id)
      ).returning()
  }
}
