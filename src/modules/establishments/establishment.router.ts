import { Context, Hono } from 'hono'
import { protectedRoute } from 'src/modules/auth/auth.middleware'
import validate from 'src/utils/error_handling/middlewares/validator.middleware'
import EstablishmentController from './establishment.controller'
import EstablishmentRequestRouter from './establishmentRequests/establishmentRequest.router'
import { DeleteEstablishmentInput, DeleteEstablishmentSchema, GetEstablishmentInput, GetEstablishmentSchema, GetEstablishmentsInput, GetEstablishmentsSchema, PatchEstablishmentInput, PatchEstablishmentSchema, PostEstablishmentInput, PostEstablishmentSchema } from './lib/establishments.validations'

export default class EstablishmentRouter {
  public router: Hono
  protected establishmentController: EstablishmentController

  constructor () {
    this.router = new Hono()
    this.establishmentController = new EstablishmentController()

    this.router
      .all('/', protectedRoute)
      .get('/',
        validate('query', GetEstablishmentsSchema),
        async (c: Context<any, any, GetEstablishmentsInput>) => {
          const res = await this.establishmentController.getEstablishments(c)
          return c.json({ ...res }, 200)
        })
      .get('/:id',
        validate('param', GetEstablishmentSchema),
        async (c: Context<any, any, GetEstablishmentInput>) => {
          const res = await this.establishmentController.getEstablishment(c)
          return c.json({ ...res }, 200)
        })
      .post('/',
        validate('json', PostEstablishmentSchema),
        async (c: Context<any, any, PostEstablishmentInput>) => {
          const res = await this.establishmentController.createEstablishment(c)
          return c.json({ ...res }, 201)
        })
      .patch('/:id',
        validate('json', PatchEstablishmentSchema),
        async (c: Context<any, any, PatchEstablishmentInput>) => {
          const res = await this.establishmentController.updateEstablishment(c)
          return c.json({ ...res }, 200)
        })
      .delete('/:id',
        validate('param', DeleteEstablishmentSchema),
        async (c: Context<any, any, DeleteEstablishmentInput>) => {
          await this.establishmentController.deleteEstablishment(c)
          return c.body(null, 204)
        })

    this.router.route('/requests', new EstablishmentRequestRouter().router)
  }
}
