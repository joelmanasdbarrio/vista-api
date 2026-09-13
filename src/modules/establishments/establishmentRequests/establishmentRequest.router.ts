import { Context, Hono } from 'hono'
import { protectedRoute } from 'src/modules/auth/auth.middleware'
import validate from 'src/utils/error_handling/middlewares/validator.middleware'
import EstablishmentRequestController from './establishmentRequest.controller'
import { DeleteEstablishmentRequestInput, DeleteEstablishmentRequestSchema, GetEstablishmentRequestsInput, GetEstablishmentRequestsSchema, PatchEstablishmentRequestInput, PatchEstablishmentRequestSchema } from './lib/establishmentRequest.validations'

export default class EstablishmentRequestRouter {
  public router: Hono
  public establishmentRequestController: EstablishmentRequestController

  constructor () {
    this.router = new Hono()
    this.establishmentRequestController = new EstablishmentRequestController()

    this.router
      .use('*', protectedRoute)
      .get('/',
        validate('query', GetEstablishmentRequestsSchema),
        async (c: Context<any, any, GetEstablishmentRequestsInput>) => {
          const res = await this.establishmentRequestController.getEstablishmentRequests(c)
          return c.json({ ...res }, 200)
        })
      .patch('/:id',
        validate('param', PatchEstablishmentRequestSchema),
        async (c: Context<any, any, PatchEstablishmentRequestInput>) => {
          const res = await this.establishmentRequestController.updateEstablishmentRequest(c)
          return c.json({ ...res }, 200)
        })
      .delete('/:id',
        validate('param', DeleteEstablishmentRequestSchema),
        async (c: Context<any, any, DeleteEstablishmentRequestInput>) => {
          await this.establishmentRequestController.deleteEstablishmentRequest(c)
          return c.body(null, 204)
        })
  }
}
