Use `*.mapper.ts` files to implement the `BaseMapper` abstract class from `src/modules/base.mapper.ts`, which maps database entities to DTOs and vice versa. The application will always work with DTOs instead of database entities:

## Class Definition:
- Define a mapper class named after the resource (e.g., `AccountMapper`).
- Extend from the `BaseMapper` abstract class, specifying the database entity and DTO types as generics.
- The class should **NOT** be exported as a default instance, but as a **default class**.

## Import Requirements
- Import database types from `'src/types/database.types'` (e.g., `AccountDB`, `NewAccountDB`)
- Import DTO types and enums from `'../../types/vista-spec.types'`
- Import `AppError` from `'../../utils/error_handling/AppError'`
- Import `BaseMapper` from `'../base.mapper'`
- Import `sql` from `'drizzle-orm'` (when needed for database operations)
- **Context dependency**: Import `Context` from `'hono'` if the mapper requires context

## Constructor Responsibilities
- Accept the database entity and DTO types as generics in the class definition.
- **Context-dependent mappers**: Some mappers may require the Hono Context in their constructor for additional operations (e.g., `EstablishmentMapper(c: Context)`).
- Initialize any required dependencies or context-specific configurations.

## Method Responsibilities:
- Implement `toDTO(input: EntityType): Promise<DTOType>` to map a single database entity to its corresponding DTO, handling all required and optional fields, and converting types/formats as needed (e.g., dates to ISO strings).
- Implement `toDTOs(input: EntityType[]): Promise<DTOType[]>` to map an array of entities to DTOs, typically using `Promise.all(input.map(this.toDTO))`.
- Implement `toDB(data: DTOType): NewEntityType` to map a DTO back to the database entity format, handling all required and optional fields, and converting types/formats as needed (e.g., booleans, enums, dates).
- Throw `AppError` for invalid or unknown types, using proper error codes and messages.
- Use strict TypeScript types for all method parameters and return values, referencing DTOs and database types.

## Validation:
- Validate and transform fields according to the OpenAPI/TypeScript schema (e.g., handle discriminators, enums, and optional fields).
- Use enums and DTOs as defined in the OpenAPI spec and TypeScript types.

## Error Handling:
- Throw `AppError` with appropriate status codes and error details when mapping fails or an unknown type is encountered.
- Do not handle errors directly in the mapper; rely on global error middleware.

For example:
```typescript
import { ResourceDB, NewResourceDB } from 'src/types/database.types'
import { ResourceDTO, ResourceTypeADTO, ResourceTypeBDTO, ResourceTypeEnum } from '../../types/vista-spec.types'
import AppError from '../../utils/error_handling/AppError'
import BaseMapper from '../base.mapper'

export default class ResourceMapper extends BaseMapper<ResourceDB, ResourceDTO> {
  async toDTO (input: ResourceDB): Promise<ResourceDTO> {
    if (input.type === ResourceTypeEnum.TYPE_A) {
      const typeADTO: ResourceTypeADTO = {
        id: input.id,
        name: input.name,
        description: input.description ?? '',
        type: ResourceTypeEnum.TYPE_A,
        resourceType: 'ResourceTypeADTO',
        createdAt: input.created_at !== null && input.created_at !== undefined ? input.created_at.toISOString() : undefined,
        updatedAt: input.updated_at !== null && input.updated_at !== undefined ? input.updated_at.toISOString() : undefined
      }
      return typeADTO
    } else if (input.type === ResourceTypeEnum.TYPE_B) {
      const typeBDTO: ResourceTypeBDTO = {
        id: input.id,
        name: input.name,
        description: input.description ?? '',
        type: ResourceTypeEnum.TYPE_B,
        resourceType: 'ResourceTypeBDTO',
        createdAt: input.created_at !== null && input.created_at !== undefined ? input.created_at.toISOString() : undefined,
        updatedAt: input.updated_at !== null && input.updated_at !== undefined ? input.updated_at.toISOString() : undefined
      }
      return typeBDTO
    } else {
      throw new AppError(
        400,
        `Unknown resource type: "${String(input.type)}"`,
        {
          code: 'UNKNOWN_RESOURCE_TYPE',
          message: `Unknown resource type: "${String(input.type)}"`,
          details: `Please, use one of the available resource types: ${Object.values(ResourceTypeEnum).join(', ')}`
        }
      )
    }
  }

  async toDTOs (input: ResourceDB[]): Promise<ResourceDTO[]> {
    return await Promise.all(input.map(this.toDTO))
  }

  toDB (data: ResourceDTO): NewResourceDB {
    const output: NewResourceDB = {
      id: data.id,
      name: data.name,
      description: data.description,
      updated_at: new Date()
    }

    if (data.type === ResourceTypeEnum.TYPE_A) {
      output.type = ResourceTypeEnum.TYPE_A
      // Map type A specific fields
    } else if (data.type === ResourceTypeEnum.TYPE_B) {
      output.type = ResourceTypeEnum.TYPE_B
      // Map type B specific fields
    }

    return output
  }
}
```