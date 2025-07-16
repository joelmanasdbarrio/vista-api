import { account } from "../../db/schema";
import { AccountDTO, AccountEnterpriseDTO, AccountPersonalDTO, AccountTypeEnum } from "../../types/vista-spec.types";
import AppError from "../../utils/error_handling/AppError";

export default class AccountMapper {
  static toDTO(input: typeof account.$inferSelect): AccountDTO {
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
      throw new AppError(`Unknown account type: ${input.type}`, 400, 'Bad Request');
    }
  }

  static toDTOs(input: typeof account.$inferSelect[]): AccountDTO[] {
    return input.map(this.toDTO);
  }
}