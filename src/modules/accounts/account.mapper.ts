import { sql } from 'drizzle-orm'
import { Account } from '../../db/schema'
import { AccountDTO, AccountEnterpriseDTO, AccountPersonalDTO, AccountTypeEnum } from '../../types/vista-spec.types'
import AppError from '../../utils/error_handling/AppError'

export default class AccountMapper {
  toDTO (input: typeof Account.$inferSelect): AccountDTO {
    if (input.type === AccountTypeEnum.PERSONAL) {
      const personalDTO: AccountPersonalDTO = {
        id: input.id,
        name: input.name,
        username: input.username,
        email: input.email,
        biography: input.biography ?? '',
        gender: input.gender,
        birthdate: input.birthdate != null ? input.birthdate.toISOString() : undefined,
        avatar: input.avatar ?? undefined,
        website: input.website ?? undefined,
        isPrivate: input.is_private,
        createdAt: input.created_at !== null && input.created_at !== undefined ? input.created_at.toISOString() : undefined,
        updatedAt: input.updated_at !== null && input.updated_at !== undefined ? input.updated_at.toISOString() : undefined,
        type: AccountTypeEnum.PERSONAL,
        accountType: 'AccountPersonalDTO'
      }
      return personalDTO
    } else if (input.type === AccountTypeEnum.ENTERPRISE) {
      const enterpriseDTO: AccountEnterpriseDTO = {
        id: input.id,
        name: input.name,
        username: input.username,
        email: input.email ?? '',
        biography: input.biography ?? '',
        avatar: input.avatar ?? undefined,
        website: input.website ?? undefined,
        isPrivate: input.is_private,
        isVerified: input.is_verified !== null && input.is_verified !== undefined ? input.is_verified : false,
        createdAt: input.created_at !== null && input.created_at !== undefined ? input.created_at.toISOString() : undefined,
        updatedAt: input.updated_at !== null && input.updated_at !== undefined ? input.updated_at.toISOString() : undefined,
        type: AccountTypeEnum.ENTERPRISE,
        accountType: 'AccountEnterpriseDTO'
      }
      return enterpriseDTO
    } else {
      throw new AppError(
        400,
        `Unknown account type: "${String(input.type)}"`,
        {
          code: 'UNKNOOWN_ACCOUNT_TYPE',
          message: `Unknown account type: "${String(input.type)}"`,
          details: `Please, use one of the available account types: ${AccountTypeEnum.PERSONAL}, ${AccountTypeEnum.ENTERPRISE}`
        }
      )
    }
  }

  toDTOs (input: Array<typeof Account.$inferSelect>): AccountDTO[] {
    return input.map(this.toDTO)
  }

  toDB (data: AccountDTO): typeof Account.$inferInsert {
    const output: Record<string, any> = {
      name: data.name,
      username: data.username,
      biography: data.biography,
      avatar: data.avatar,
      website: data.website,
      is_private: data.isPrivate,
      updated_at: sql`NOW()`
    }

    if (data.type === 'personal') {
      output.type = AccountTypeEnum.PERSONAL
      output.gender = data.gender !== undefined
        ? data.gender
        : data.gender ?? null
      output.birthdate = data.birthdate !== undefined
        ? data.birthdate
        : data.birthdate ?? null
    } else if (data.type === 'enterprise') {
      output.type = AccountTypeEnum.ENTERPRISE
      output.is_verified = data.isVerified !== undefined
        ? data.isVerified
        : data.isVerified ?? false
    }

    return output as typeof Account.$inferInsert
  }
}
