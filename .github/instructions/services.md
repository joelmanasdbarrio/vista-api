Use `*.service.ts` files to implement the `BaseService` abstract class from `src/modules/base.service.ts`, which contains the business logic and interacts with the repository layer for data access and manipulation and other services if needed:

## Class Definition
- Define a service class named after the resource (e.g., `AccountService`).
- Extend from the `BaseService` abstract class.
- The class should **NOT** be exported as a default instance, but as a **default class**.

## Properties
- Define a `protected resource = '[ResourceName]'` string for logging and context.

## Import Requirements
- Import `Context` from `'hono'`
- Import utility functions (e.g., `validate as uuidValidate` from `'uuid'`)
- Import DTO types and enums from `'../../types/vista-spec.types'` or `'src/types/vista-spec.types'`
- Import `AppError` from `'../../utils/error_handling/AppError'` or `'src/utils/error_handling/AppError'`
- Import `Logger, { LogLabels }` from `'../../utils/logger'` or `'src/utils/logger'`
- Import `BaseService` from `'../base.service'` or `'src/modules/base.service'`
- Import the corresponding repository class
- Import all validation types from `'./lib/[resource].validations'`
- **Cross-module dependencies**: Import other service classes when needed (e.g., `AccountService`, `AddressService`)

## Method Responsibilities
- Each public method corresponds to a business operation (e.g., `getAllResourcesPaginated`, `getOneResource`, `createOneResource`, `updateOneResource`, `deleteOneResource`).
- Each method receives a typed Hono Context object and validated input parameters (from the controller).
- Instantiate the corresponding repository class within each method, passing the context.
- **Cross-service operations**: Instantiate and use other service classes when business logic requires it.
- Use the repository layer for all data access and manipulation.
- Use strict TypeScript types for all method parameters and return values, referencing DTOs and validation types.
- Log actions and results using the `Logger` utility, including contextual labels.
- Throw `AppError` for business logic errors or invalid input.

## Service-only Modules
- Some modules may only contain services (e.g., `addresses`) without controllers or routers.
- These services are designed to be used by other services and handle specific domain logic.
- Follow the same patterns but focus on business operations rather than HTTP endpoints.

## Validation
- Validate input types using TypeScript and Zod schemas (from the validation module).
- Use enums and DTOs as defined in the OpenAPI spec and TypeScript types.

## Error Handling
- Throw `AppError` with appropriate status codes and error details when business rules are violated.
- Do not handle errors directly in the service; rely on global error middleware.

## Logging
- Use the `Logger` utility for info and debug logs, including resource, layer, and method context.

## Private Methods
- Use private methods for resource-specific logic (e.g., updating different account types).

For example:
```typescript
import { Context } from 'hono'
import { validate as uuidValidate } from 'uuid'
import { ResourceDTO, ResourceTypeADTO, ResourceTypeBDTO, ResourcesPaginatedDTO, ResourceTypeEnum } from '../../types/vista-spec.types'
import AppError from '../../utils/error_handling/AppError'
import Logger, { LogLabels } from '../../utils/logger'
import BaseService from '../base.service'
import ResourceRepository from './resource.repository'
import { GetResourceParam, GetResourcesQuery, PatchResourceBody } from './lib/resource.validations'

export default class ResourceService extends BaseService {
  protected resource = 'Resource'

  async getAllResourcesPaginated (c: Context, query: GetResourcesQuery): Promise<ResourcesPaginatedDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getAllResourcesPaginated' }
    Logger.info('Get Resource documents paginated', labels)

    const resourceRepository = new ResourceRepository(c)
    const { resources, totalResources } = await resourceRepository.getAllPaginated(query)

    return {
      data: resources,
      _meta: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        results: resources.length,
        total: totalResources
      }
    }
  }

  async getOneResource (c: Context, { id: idOrKey }: GetResourceParam): Promise<ResourceDTO | undefined> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getOneResource' }
    Logger.info(`Get Resource document by ID or key "${idOrKey}"`, labels)

    const resourceRepository = new ResourceRepository(c)
    const isId = uuidValidate(idOrKey)
    const resource = isId
      ? await resourceRepository.getOneById(idOrKey)
      : await resourceRepository.getOneByKey(idOrKey)

    return resource
  }

  async updateOneResource (c: Context, body: PatchResourceBody): Promise<ResourceDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateOneResource' }
    Logger.info('Update Resource document', labels)

    const user = c.get('user')

    if (body.resourceType === ResourceTypeEnum.TYPE_A) {
      return await this.updateTypeAResource(c, body, user as ResourceTypeADTO)
    } else if (body.resourceType === ResourceTypeEnum.TYPE_B) {
      return await this.updateTypeBResource(c, body, user as ResourceTypeBDTO)
    } else {
      throw new AppError(400, 'Invalid resource type', {
        code: 'INVALID_RESOURCE_TYPE',
        message: 'Invalid resource type',
        details: `The resource type "${String(body.resourceType)}" is not supported. Please, use ${Object.values(ResourceTypeEnum).join(', ')} instead.`
      })
    }
  }

  private async updateTypeAResource (c: Context, body: PatchResourceBody, user: ResourceTypeADTO): Promise<ResourceTypeADTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateTypeAResource' }
    Logger.info('Update TypeA Resource document', labels)

    const resourceToUpdate: ResourceTypeADTO = {
      id: user.id,
      name: body.name ?? user.name,
      description: body.description ?? user.description,
      type: ResourceTypeEnum.TYPE_A,
      resourceType: 'ResourceTypeADTO'
    }

    const resourceRepository = new ResourceRepository(c)
    return await resourceRepository.updateOneById(user.id, resourceToUpdate) as ResourceTypeADTO
  }

  private async updateTypeBResource (c: Context, body: PatchResourceBody, user: ResourceTypeBDTO): Promise<ResourceTypeBDTO> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateTypeBResource' }
    Logger.info('Update TypeB Resource document', labels)

    const resourceToUpdate: ResourceTypeBDTO = {
      id: user.id,
      name: body.name ?? user.name,
      description: body.description ?? user.description,
      type: ResourceTypeEnum.TYPE_B,
      resourceType: 'ResourceTypeBDTO'
    }

    const resourceRepository = new ResourceRepository(c)
    return await resourceRepository.updateOneById(user.id, resourceToUpdate) as ResourceTypeBDTO
  }

  async deleteOneResource (c: Context): Promise<void> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'deleteOneResource' }
    Logger.info('Delete Resource document', labels)

    const user = c.get('user')

    const resourceRepository = new ResourceRepository(c)
    await resourceRepository.deleteOneById(user.id)
  }
}
```