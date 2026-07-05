Use `*.router.ts` files to define Hono routers for handling HTTP requests and responses:

## Class Definition
- Define a class named after the resource it manages (e.g., `AccountRouter`, `EstablishmentRouter`).
- The class should **NOT** be exported as a default instance, but as a **default class**.

## Properties
- Declare a `public router: Hono` property to expose the Hono router instance.
- Declare a `protected [resourceName]Controller: [ResourceName]Controller` property for the controller instance.

## Constructor Responsibilities
- Initialize the Hono router instance: `this.router = new Hono()`
- Initialize the controller instance: `this.[resourceName]Controller = new [ResourceName]Controller()`
- Chain route definitions using the router instance with method chaining.

## Import Requirements
- Import `Context` and `Hono` from `'hono'`
- Import `protectedRoute` from `'src/modules/auth/auth.middleware'`
- Import `validate` from `'src/utils/error_handling/middlewares/validator.middleware'`
- Import the corresponding controller class
- Import all validation schemas and input types from `'./lib/[resource].validations'`

## Route Definitions
- **All routes must be protected**: Use `.all('/', protectedRoute)` as the first chained method to apply authentication to all routes.
- Use HTTP verbs (`get`, `post`, `patch`, `delete`) to define endpoints.
- Apply the `validate()` middleware with the appropriate target (`'query'`, `'json'`, `'param'`) and corresponding Zod schema.
- Define route handlers as **async arrow functions** with typed Context: `async (c: Context<any, any, [ValidationInput]>) => { }`
- Each handler must call the corresponding controller method and return the response.

## Response Handling Standards
- **GET requests**: Return `c.json({ ...res }, 200)` spreading the controller result
- **POST requests**: Return `c.json({ ...res }, 201)` for successful creation
- **PATCH requests**: Return `c.json({ ...res }, 200)` spreading the controller result
- **DELETE requests**: Return `c.body(null, 204)` for successful deletion

## Submodule Integration
- For modules with submodules, use `this.router.route('/[submodule-path]', new [SubmoduleRouter]().router)` to mount submodule routes.

For example:
```typescript
import { Context, Hono } from 'hono'
import { protectedRoute } from 'src/modules/auth/auth.middleware'
import validate from 'src/utils/error_handling/middlewares/validator.middleware'
import ResourceController from './resource.controller'
import { 
  DeleteResourceInput, 
  deleteResourceSchema, 
  GetResourceInput, 
  getResourceSchema, 
  GetResourcesInput, 
  getResourcesSchema, 
  PatchResourceInput, 
  patchResourceSchema,
  PostResourceInput,
  postResourceSchema 
} from './lib/resource.validations'

export default class ResourceRouter {
  public router: Hono
  protected resourceController: ResourceController

  constructor () {
    this.router = new Hono()
    this.resourceController = new ResourceController()

    this.router
      .all('/', protectedRoute)
      .get('/',
        validate('query', getResourcesSchema),
        async (c: Context<any, any, GetResourcesInput>) => {
          const res = await this.resourceController.getResources(c)
          return c.json({ ...res }, 200)
        })
      .get('/:id',
        validate('param', getResourceSchema),
        async (c: Context<any, any, GetResourceInput>) => {
          const res = await this.resourceController.getResource(c)
          return c.json({ ...res }, 200)
        })
      .post('/',
        validate('json', postResourceSchema),
        async (c: Context<any, any, PostResourceInput>) => {
          const res = await this.resourceController.createResource(c)
          return c.json({ ...res }, 201)
        })
      .patch('/:id',
        validate('json', patchResourceSchema),
        async (c: Context<any, any, PatchResourceInput>) => {
          const res = await this.resourceController.updateResource(c)
          return c.json({ ...res }, 200)
        })
      .delete('/:id',
        validate('param', deleteResourceSchema),
        async (c: Context<any, any, DeleteResourceInput>) => {
          await this.resourceController.deleteResource(c)
          return c.body(null, 204)
        })
  }
}
```