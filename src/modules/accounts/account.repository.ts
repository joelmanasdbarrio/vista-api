import { Context } from "hono"
import Logger, { LogLabels } from "../../utils/logger"
import BaseRepository from "../base.repository"
import { AccountDTO, AccountTypeEnum, GetAccountsQuery } from "../../types/vista-spec.types"
import { account } from "../../db/schema"
import AccountMapper from "./account.mapper"
import { and, count, eq, like, or, sql, SQL } from "drizzle-orm"

export default class AccountRepository extends BaseRepository {
  protected resource = 'Account'
  protected accountMapper: AccountMapper

  constructor(c: Context) {
    super(c)
    this.accountMapper = new AccountMapper()
  }

  async getAllPaginated({ page = 1, limit = 10, name = '', username = '', type = AccountTypeEnum.PERSONAL }: GetAccountsQuery): Promise<{ accounts: AccountDTO[], totalAccounts: number }> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAllPaginated' }
    Logger.info('Get Account documents paginated', labels)

    const queryStr = (name || username)?.trim().toLowerCase()
    const filters: Array<SQL | undefined> = [
      eq(account.type, type),
    ]

    if (queryStr && queryStr.length > 0) {
      filters.push(
        or(
          like(account.name, `%${queryStr}%`),
          like(account.username, `%${queryStr}%`)
        )
      )
    }

    const totalCount = await this.drizzle
      .select({ count: count() })
      .from(account)
      .where(and(...filters))

    const accountsDB: typeof account.$inferSelect[] = await this.drizzle
      .select()
      .from(account)
      .where(and(...filters))
      .limit(limit)
      .offset((page - 1) * limit)

    const accountDTOs = this.accountMapper.toDTOs(accountsDB)

    return {
      accounts: accountDTOs,
      totalAccounts: totalCount[0].count || 0
    }
  }

  /**
   * @deprecated
   */
  async getAll(query: any): Promise<any> {
    throw new Error("Method not implemented.")
  }

  async getOneById(id: string): Promise<AccountDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneById' }
    Logger.info('Get Account document', labels)

    const [accountDB]: typeof account.$inferSelect[] = await this.drizzle
      .select()
      .from(account)
      .where(
        eq(account.id, id)
      )

    if (accountDB) return this.accountMapper.toDTO(accountDB)
  }

  async getOneByUsername(username: string): Promise<AccountDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneByUsername' }
    Logger.info('Get Account document', labels)

    const [accountDB]: typeof account.$inferSelect[] = await this.drizzle
      .select()
      .from(account)
      .where(
        eq(account.username, username)
      )

    const accountMapper = new AccountMapper()
    if (accountDB) return accountMapper.toDTO(accountDB)
  }

  /**
   * @deprecated
   */
  async createOne(data: any): Promise<any> {
    throw new Error("Method not implemented.")
  }

  async updateOneById(id: string, data: any, obj: any): Promise<AccountDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateOneById' }
    Logger.info('Update Account document', labels)

    const updates: Record<string, any> = {
      name: data.name !== undefined ? data.name : obj.name,
      username: data.username !== undefined ? data.username : obj.username,
      biography: data.biography !== undefined ? data.biography : obj.biography,
      avatar: data.avatar !== undefined ? data.avatar : obj.avatar,
      website: data.website !== undefined ? data.website : obj.website,
      is_private: data.isPrivate !== undefined ? data.isPrivate : obj.isPrivate,
      updated_at: sql`NOW()`,
    }

    if (obj.type === 'personal') {
      updates.gender = data.gender !== undefined
        ? data.gender
        : obj.gender ?? null
      updates.birthdate = data.birthdate !== undefined
        ? data.birthdate
        : obj.birthdate ?? null
    }

    const [accountDB]: typeof account.$inferSelect[] = await this.drizzle
      .update(account)
      .set(updates)
      .where(eq(account.id, id))
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

    if (accountDB) return this.accountMapper.toDTO(accountDB)
  }

  async deleteOneById(id: string): Promise<void> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'deleteOneById' }
    Logger.info('Update Account document', labels)

    await this.drizzle
      .delete(account)
      .where(
        eq(account.id, id)
      ).returning()
  }
}