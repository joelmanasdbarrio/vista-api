Use `*.repository.ts` files to implement the `BaseRepository` abstract class from `src/modules/base.repository.ts`, which interacts with the database using Drizzle ORM and mapper layer to switch between database entities and DTOs:

## Class Definition
- Define a repository class named after the resource (e.g., `AccountRepository`).
- Extend from the `BaseRepository` abstract class.
- The class should **NOT** be exported as a default instance, but as a **default class**.

## Properties
- Define a `protected resource = '[ResourceName]'` string for logging and context.
- Instantiate the corresponding mapper class as a `protected [resourceName]Mapper: [ResourceName]Mapper` property.

## Constructor Responsibilities
- Accept the Hono Context object and pass it to the base repository.
- Initialize the mapper instance: `this.[resourceName]Mapper = new [ResourceName]Mapper()`

## Import Requirements
- Import Drizzle ORM functions: `and`, `count`, `eq`, `like`, `or`, `SQL` from `'drizzle-orm'`
- Import `Context` from `'hono'`
- Import database types from `'src/types/database.types'`
- Import `AppError` from `'src/utils/error_handling/AppError'`
- Import schema tables from `'../../db/schema'`
- Import DTO types and enums from `'../../types/vista-spec.types'`
- Import `Logger, { LogLabels }` from `'../../utils/logger'`
- Import `BaseRepository` from `'../base.repository'`
- Import the corresponding mapper class
- Import validation types from `'./lib/[resource].validations'`

## Method Responsibilities
- Each public method corresponds to a data access operation (e.g., `getAllPaginated`, `getOneById`, `getOneByKey`, `updateOneById`, `deleteOneById`).
- Use Drizzle ORM for all database queries and mutations.
- Use strict TypeScript types for all method parameters and return values, referencing DTOs and validation types.
- Use the mapper to convert between database entities and DTOs.
- Log actions and results using the `Logger` utility, including contextual labels.
- Throw `AppError` for deprecated or invalid operations.

## Validation
- Validate input types using TypeScript and Zod schemas (from the validation module).
- Use enums and DTOs as defined in the OpenAPI spec and TypeScript types.

## Error Handling
- Throw `AppError` with appropriate status codes and error details when business rules are violated or deprecated methods are called.
- Do not handle errors directly in the repository; rely on global error middleware.

## Logging
- Use the `Logger` utility for info and debug logs, including resource, layer, and method context.

For example:
```typescript
import { and, count, eq, like, or, SQL } from 'drizzle-orm'
import { Context } from 'hono'
import { ResourceDB } from 'src/types/database.types'
import AppError from 'src/utils/error_handling/AppError'
import { Resource } from '../../db/schema'
import { ResourceDTO, ResourceTypeEnum } from '../../types/vista-spec.types'
import Logger, { LogLabels } from '../../utils/logger'
import BaseRepository from '../base.repository'
import ResourceMapper from './resource.mapper'
import { GetResourcesQuery } from './lib/resource.validations'

export default class ResourceRepository extends BaseRepository {
  protected resource = 'Resource'
  protected resourceMapper: ResourceMapper

  constructor (c: Context) {
    super(c)
    this.resourceMapper = new ResourceMapper()
  }

  async getAllPaginated ({ page = 1, limit = 10, name = '', type = ResourceTypeEnum.DEFAULT }: GetResourcesQuery): Promise<{ resources: ResourceDTO[], totalResources: number }> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAllPaginated' }
    Logger.info('Get Resource documents paginated', labels)

    const queryStr: string = name?.trim().toLowerCase()
    const filters: Array<SQL | undefined> = [
      eq(Resource.type, type)
    ]

    if (queryStr !== undefined && queryStr.length > 0) {
      filters.push(
        like(Resource.name, `%${queryStr}%`)
      )
    }

    const [totalCount] = await this.drizzle
      .select({ count: count() })
      .from(Resource)
      .where(and(...filters))

    const resourcesDB: ResourceDB[] = await this.drizzle
      .select()
      .from(Resource)
      .where(and(...filters))
      .limit(limit)
      .offset((page - 1) * limit)

    const resourceDTOs = await this.resourceMapper.toDTOs(resourcesDB)

    return {
      resources: resourceDTOs,
      totalResources: (typeof totalCount.count === 'number' && !isNaN(totalCount.count)) ? totalCount.count : 0
    }
  }

  /**
   * @deprecated
   */
  async getAll (query: any): Promise<any> {
    throw new AppError(500, 'Method not implemented.', { code: 'METHOD_NOT_IMPLEMENTED', message: 'Method not implemented.' })
  }

  async getOneById (id: string): Promise<ResourceDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneById' }
    Logger.info(`Get Resource document by ID "${id}"`, labels)

    const [resourceDB]: ResourceDB[] = await this.drizzle
      .select()
      .from(Resource)
      .where(eq(Resource.id, id))

    return await this.resourceMapper.toDTO(resourceDB)
  }

  async getOneByKey (key: string): Promise<ResourceDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneByKey' }
    Logger.info(`Get Resource document by key "${key}"`, labels)

    const [resourceDB]: ResourceDB[] = await this.drizzle
      .select()
      .from(Resource)
      .where(eq(Resource.key, key))

    return await this.resourceMapper.toDTO(resourceDB)
  }

  /**
   * @deprecated
   */
  async createOne (data: any): Promise<any> {
    throw new AppError(500, 'Method not implemented.', { code: 'METHOD_NOT_IMPLEMENTED', message: 'Method not implemented.' })
  }

  async updateOneById (id: string, data: ResourceDTO): Promise<ResourceDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateOneById' }
    Logger.info(`Update Resource document by ID "${id}"`, labels)

    const updates = this.resourceMapper.toDB(data)

    Logger.info('Updates to be applied')
    Logger.debug(updates)

    const [resourceDB]: ResourceDB[] = await this.drizzle
      .update(Resource)
      .set(updates)
      .where(eq(Resource.id, id))
      .returning()

    return await this.resourceMapper.toDTO(resourceDB)
  }

  async deleteOneById (id: string): Promise<void> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'deleteOneById' }
    Logger.info(`Delete Resource document by ID "${id}"`, labels)

    await this.drizzle
      .delete(Resource)
      .where(eq(Resource.id, id))
      .returning()
  }
}
```