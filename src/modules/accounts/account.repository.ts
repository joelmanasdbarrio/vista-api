import { Context } from "hono"
import { getContext } from 'hono/context-storage'
import Logger from "../../utils/logger"
import { BaseRepository } from "../base.repository"
import { AccountDTO, AccountTypeEnum, GetAccountsQuery } from "../../types/vista-spec.types"
import { account } from "../../db/schema"
import AccountMapper from "./account.mapper"
import { and, count, eq, like, or, sql, SQL } from "drizzle-orm"
import AppError from "../../utils/error_handling/AppError"

export class AccountRepository extends BaseRepository {
  protected resource = 'Account'

  constructor(c: Context) {
    super(c)
  }

  async getAllPaginated({ page = 1, limit = 10, name = '', username = '', type = AccountTypeEnum.PERSONAL }: GetAccountsQuery): Promise<{ accounts: AccountDTO[], totalAccounts: number }> {
    const labels = { resource: this.resource, layer: this.layer, method: 'getAllPaginated' }
    Logger.info('Get all Account documents paginated', labels)

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
    const accountsDTO = AccountMapper.toDTOs(accountsDB)

    return {
      accounts: accountsDTO,
      totalAccounts: totalCount[0].count || 0
    }
  }

  async getOneById(id: string): Promise<AccountDTO | undefined> {
    const labels = { resource: this.resource, layer: this.layer, method: 'getOneById' }
    Logger.info('Get one Account document', labels)

    const accountDB: typeof account.$inferSelect[] = await this.drizzle
      .select()
      .from(account)
      .where(
        eq(account.id, id)
      )
    if (accountDB.length > 0) return AccountMapper.toDTO(accountDB[0])
  }

  async getOneByUsername(username: string): Promise<AccountDTO | undefined> {
    const labels = { resource: this.resource, layer: this.layer, method: 'getOneByUsername' }
    Logger.info('Get one Account document', labels)

    const [accountDB]: typeof account.$inferSelect[] = await this.drizzle
      .select()
      .from(account)
      .where(
        eq(account.username, username)
      )

    if (accountDB) return AccountMapper.toDTO(accountDB)
  }

  /**
   * @deprecated
   */
  createOne(data: any): Promise<any> {
    throw new Error("Method not implemented.")
  }

  async updateOneById(id: string, data: any, obj: any): Promise<AccountDTO | undefined> {
    const labels = { resource: this.resource, layer: this.layer, method: 'updateOneById' }
    Logger.info('Update one Account document', labels)

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

    if (accountDB) return AccountMapper.toDTO(accountDB)
  }

  async deleteOneById(id: string): Promise<void> {
    const labels = { resource: this.resource, layer: this.layer, method: 'deleteOneById' }
    Logger.info('Update one Account document', labels)

    await this.drizzle
      .delete(account)
      .where(
        eq(account.id, id)
      ).returning()
  }
}