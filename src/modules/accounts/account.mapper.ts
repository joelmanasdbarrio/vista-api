import { account } from "../../db/schema";
import { AccountDTO, AccountEnterpriseDTO, AccountPersonalDTO, AccountTypeEnum } from "../../types/vista-spec.types";
import AppError from "../../utils/error_handling/AppError";

export default class AccountMapper {
  constructor() { }

  toDTO(input: typeof account.$inferSelect): AccountDTO {
    if (input.type === AccountTypeEnum.PERSONAL) {
      return {
        id: input.id,
        name: input.name,
        username: input.username,
        email: input.email,
        biography: input.biography || '',
        gender: input.gender,
        birthdate: input.birthdate ? input.birthdate.toISOString() : undefined,
        avatar: input.avatar ?? undefined,
        website: input.website ?? undefined,
        isPrivate: input.is_private,
        createdAt: input.created_at ? input.created_at.toISOString() : undefined,
        updatedAt: input.updated_at ? input.updated_at.toISOString() : undefined,
        type: AccountTypeEnum.PERSONAL
      } as AccountPersonalDTO;
    } else if (input.type === AccountTypeEnum.ENTERPRISE) {
      return {
        id: input.id,
        name: input.name,
        username: input.username,
        email: input.email,
        biography: input.biography || '',
        avatar: input.avatar ?? undefined,
        website: input.website ?? undefined,
        isPrivate: input.is_private,
        isVerified: input.is_verified,
        createdAt: input.created_at ? input.created_at.toISOString() : undefined,
        updatedAt: input.updated_at ? input.updated_at.toISOString() : undefined,
        type: AccountTypeEnum.ENTERPRISE
      } as AccountEnterpriseDTO;
    } else {
      throw new AppError(400, `Unknown account type: ${input.type}`, { code: 'UNKNOOWN_ACCOUNT_TYPE', message: `Unknown account type: ${input.type}`, details: `Please, use one of the available account types: ${AccountTypeEnum.PERSONAL}, ${AccountTypeEnum.ENTERPRISE}` });
    }
  }

  toDTOs(input: typeof account.$inferSelect[]): AccountDTO[] {
    return input.map(this.toDTO);
  }
}