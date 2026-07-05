Use `*.controller.ts` files to implement the `BaseController` abstract class from `src/modules/base.controller.ts`, which acts as an intermediary between the Router and the Service layer, handling request processing and response formatting:

## Class Definition
- Define a controller class named after the resource (e.g., `AccountController`).
- Extend from the `BaseController` abstract class.
- The class should **NOT** be exported as a default instance, but as a **default class**.

## Properties
- Define a `protected resource = '[ResourceName]'` string for logging and context.
- Instantiate the corresponding service class as a `protected [resourceName]Service: [ResourceName]Service` property.

## Constructor Responsibilities
- Call `super()` to initialize the base controller.
- Initialize the service instance: `this.[resourceName]Service = new [ResourceName]Service()`

## Import Requirements
- Import `Context` from `'hono'`
- Import `'../../types/hono.types'` for context extensions (when needed)
- Import response types from `'../../types/vista-spec.types'` or `'src/types/vista-spec.types'`
- Import `AppError` from `'../../utils/error_handling/AppError'` or `'src/utils/error_handling/AppError'`  
- Import `Logger, { LogLabels }` from `'../../utils/logger'` or `'src/utils/logger'`
- Import `BaseController` from `'../base.controller'` or `'src/modules/base.controller'`
- Import the corresponding service class
- Import all validation input types from `'./lib/[resource].validations'`

## Method Responsibilities
- Each public method corresponds to a RESTful operation (e.g., `getResources`, `getResource`, `createResource`, `updateResource`, `deleteResource`).
- Each method receives a typed Hono Context object, with generics for request validation types.
- Use the service layer for all business logic and data access.
- Handle errors using the custom `AppError` class.
- Log actions and results using the `Logger` utility, including contextual labels.
- Return response objects matching the OpenAPI/TypeScript DTOs.

## Validation and Data Access
- Use `c.req.valid('query' | 'json' | 'param')` to access validated request data, as provided by the router's validation middleware.
- Use `c.req.param()` or `c.req.param('id')` to extract path parameters.
- Use `c.get('user')` to access authenticated user data from middleware.
- Use strict TypeScript types for all method parameters and return values, referencing DTOs and validation types.
- **Type safety for logging**: Use `String(value)` when logging IDs that might be numbers to ensure type safety.

## Error Handling
- Throw `AppError` with appropriate status codes and error details when resources are not found or invalid.
- Do not handle errors directly in the controller; rely on global error middleware.

## Logging Standards
- Create `LogLabels` with `{ resource: this.resource, layer: this.layer, method: '[methodName]' }`
- Use `Logger.info()` for method entry and successful completion
- Use `Logger.debug()` to log data objects (optional)

For example:
```typescript
import { Context } from 'hono'
import '../../types/hono.types'
import { ResourceResponse, ResourcesResponse } from '../../types/vista-spec.types'
import AppError from '../../utils/error_handling/AppError'
import Logger, { LogLabels } from '../../utils/logger'
import BaseController from '../base.controller'
import ResourceService from './resource.service'
import { GetResourceInput, GetResourcesInput, PatchResourceInput, PostResourceInput } from './lib/resource.validations'

export default class ResourceController extends BaseController {
  protected resource = 'Resource'
  protected resourceService: ResourceService

  constructor () {
    super()
    this.resourceService = new ResourceService()
  }

  async getResources (c: Context<any, any, GetResourcesInput>): Promise<ResourcesResponse> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getResources' }
    Logger.info('Get all Resource documents paginated', labels)

    const { data, _meta } = await this.resourceService.getAllResourcesPaginated(c, c.req.valid('query'))

    Logger.info(`Found ${data.length} resource(s)`, labels)
    Logger.debug(data)

    return {
      status: 'success',
      data,
      _meta
    }
  }

  async getResource (c: Context<any, any, GetResourceInput>): Promise<ResourceResponse> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'getResource' }
    Logger.info('Get Resource document by ID', labels)

    const { id: idOrKey } = c.req.param()
    const resource = await this.resourceService.getOneResource(c, { id: idOrKey })

    if (resource == null) {
      throw new AppError(404, `Resource with ID "${idOrKey}" not found`, {
        code: 'RESOURCE_NOT_FOUND',
        message: `Resource with ID "${idOrKey}" not found`,
        details: 'Please, check if the desired ID is correctly typed'
      })
    }

    Logger.info(`Found resource "${resource.name}" (${resource.id})`, labels)
    Logger.debug(resource)

    return {
      status: 'success',
      data: resource
    }
  }

  async createResource (c: Context<any, any, PostResourceInput>): Promise<ResourceResponse> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'createResource' }
    Logger.info('Create Resource document', labels)

    const body = c.req.valid('json')
    const resource = await this.resourceService.createOneResource(c, body)

    Logger.info(`Created resource "${resource.name}" (${resource.id})`, labels)
    Logger.debug(resource)

    return {
      status: 'success',
      data: resource
    }
  }

  async updateResource (c: Context<any, any, PatchResourceInput>): Promise<ResourceResponse> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'updateResource' }
    Logger.info('Update Resource document', labels)

    const body = c.req.valid('json')
    const resource = await this.resourceService.updateOneResource(c, body)

    Logger.info(`Updated resource "${resource.name}" (${resource.id})`, labels)
    Logger.debug(resource)

    return {
      status: 'success',
      data: resource
    }
  }

  async deleteResource (c: Context): Promise<void> {
    const labels: LogLabels = { resource: this.resource, layer: this.layer, method: 'deleteResource' }
    Logger.info('Delete Resource document by ID', labels)

    const user = c.get('user')
    await this.resourceService.deleteOneResource(c)

    Logger.info(`Deleted resource "${user.name}" (${user.id})`, labels)
  }
}
```
