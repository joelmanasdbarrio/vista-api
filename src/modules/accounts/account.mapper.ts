import { AccountDB, NewAccountDB } from 'src/types/database.types'
import { AccountDTO, AccountEnterpriseDTO, AccountPersonalDTO, AccountTypeEnum } from '../../types/vista-spec.types'
import AppError from '../../utils/error_handling/AppError'
import BaseMapper from '../base.mapper'

export default class AccountMapper extends BaseMapper<AccountDB, AccountDTO> {
  async toDTO (input: AccountDB): Promise<AccountDTO> {
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
      throw new AppError(400, 'Invalid Account type', {
        code: 'INVALID_ACCOUNT_TYPE',
        message: 'Invalid Account type',
        details: `The account type "${String(input.type)}" is not supported. Please, use ${Object.values(AccountTypeEnum).join(', ')} instead.`
      })
    }
  }

  async toDTOs (input: AccountDB[]): Promise<AccountDTO[]> {
    return await Promise.all(input.map(this.toDTO))
  }

  toDB (data: AccountDTO): NewAccountDB {
    const output: NewAccountDB = {
      id: data.id,
      name: data.name,
      username: data.username,
      email: data.email,
      biography: data.biography,
      avatar: data.avatar,
      website: data.website,
      is_private: data.isPrivate,
      updated_at: new Date()
    }

    if (data.type === 'personal') {
      output.type = AccountTypeEnum.PERSONAL
      output.gender = data.gender !== undefined
        ? data.gender
        : data.gender ?? null
      output.birthdate = data.birthdate !== undefined
        ? (data.birthdate !== null ? new Date(data.birthdate) : null)
        : data.birthdate ?? null
    } else if (data.type === 'enterprise') {
      output.type = AccountTypeEnum.ENTERPRISE
      output.is_verified = data.isVerified !== undefined
        ? data.isVerified
        : data.isVerified ?? false
    }

    return output
  }
}
