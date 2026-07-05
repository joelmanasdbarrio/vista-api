Use `*.validations.ts` files in a `lib/` subfolder within the module directory to define Zod validation schemas and TypeScript types for request validation:

## File Location
- Place all validation schemas and related types in a `lib/` subfolder within the module directory (e.g., `account.validations.ts`).

## Import Requirements
- Import `z` from `'zod'` for schema definitions
- Import enums and types from `'../../../types/vista-spec.types'` (e.g., `AccountTypeEnum`, `GenderEnum`)
- **Cross-module schemas**: Import schemas from other modules when needed (e.g., `postAddressSchema`, `patchAddressSchema` from `'../addresses/lib/address.validations'`)

## Schema Definitions
- Use Zod to define schemas for each CRUD operation (`getResourcesSchema`, `getResourceSchema`, `postResourceSchema`, `patchResourceSchema`, `deleteResourceSchema`).
- Each schema should validate the expected shape and types of request data for its corresponding endpoint (query, param, or body).
- Use enums and types imported from the module's or project's type definitions.
- Apply appropriate defaults, minimums, maximums, and optional fields as needed.
- **Complex types**: Support union types, nested objects, and cross-references to other schemas.
- **Flexible ID handling**: Use `z.union([z.uuid(), z.string()])` for parameters that can accept UUIDs or other identifiers.
- **Nested object support**: Handle complex nested structures like `coordinates: z.object({ latitude: z.number(), longitude: z.number() })`.

## TypeScript Interface Definitions
- Export TypeScript interfaces for each operation's input and output, mapping to the Zod schemas.
- Follow the naming convention: `Get[Resource]Input`, `Post[Resource]Input`, `Patch[Resource]Input`, `Delete[Resource]Input`.
- Each interface should have `in` and `out` properties specifying the request validation structure.

## Type Aliases
- Export type aliases for the inferred types of each schema using `z.infer<typeof schema>`.
- Follow the naming convention: `Get[Resource]Query`, `Get[Resource]Param`, `Post[Resource]Body`, `Patch[Resource]Body`, `Delete[Resource]Param`.

## Usage in Layers
- These schemas and types are used in the Router (for request validation), Controller (for context typing), and Service (for business logic typing) layers.
- Validation ensures type safety across the entire request-response cycle.

For example:
```typescript
import z from 'zod'
import { ResourceTypeEnum, OtherEnums } from '../../../types/vista-spec.types'

export const getResourcesSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  type: z.enum(ResourceTypeEnum).optional(),
  name: z.string().optional(),
  key: z.string().optional()
})

export const getResourceSchema = z.object({
  id: z.union([z.uuid(), z.string()])
})

export const postResourceSchema = z.object({
  name: z.string(),
  key: z.string(),
  description: z.string().optional(),
  type: z.enum(ResourceTypeEnum),
  // ...other fields...
})

export const patchResourceSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().optional(),
  key: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(ResourceTypeEnum).optional(),
  // ...other fields...
})

export const deleteResourceSchema = z.object({
  id: z.uuid()
})

// Input/Output interfaces for each operation
export interface GetResourcesInput {
  in: { query: z.infer<typeof getResourcesSchema> }
  out: { query: z.infer<typeof getResourcesSchema> }
}

export interface GetResourceInput {
  in: { param: z.infer<typeof getResourceSchema> }
  out: { param: z.infer<typeof getResourceSchema> }
}

export interface PostResourceInput {
  in: { json: z.infer<typeof postResourceSchema> }
  out: { json: z.infer<typeof postResourceSchema> }
}

export interface PatchResourceInput {
  in: { json: z.infer<typeof patchResourceSchema> }
  out: { json: z.infer<typeof patchResourceSchema> }
}

export interface DeleteResourceInput {
  in: { param: z.infer<typeof deleteResourceSchema> }
  out: { param: z.infer<typeof deleteResourceSchema> }
}

// Type aliases for inferred types
export type GetResourcesQuery = z.infer<typeof getResourcesSchema>
export type GetResourceParam = z.infer<typeof getResourceSchema>
export type PostResourceBody = z.infer<typeof postResourceSchema>
export type PatchResourceBody = z.infer<typeof patchResourceSchema>
export type DeleteResourceParam = z.infer<typeof deleteResourceSchema>
```