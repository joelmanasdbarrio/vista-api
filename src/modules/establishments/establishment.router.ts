import { Context, Hono } from 'hono'
import validate from 'src/utils/error_handling/middlewares/validator.middleware'
import { protectedRoute } from '../auth/auth.middleware'
import EstablishmentController from './establishment.controller'
import { DeleteEstablishmentInput, deleteEstablishmentSchema, GetEstablishmentInput, getEstablishmentSchema, GetEstablishmentsInput, getEstablishmentsSchema, PatchEstablishmentInput, patchEstablishmentSchema, PostEstablishmentInput, postEstablishmentSchema } from './lib/establishments.validations'

export default class EstablishmentRouter {
  public router: Hono
  protected establishmentController: EstablishmentController

  constructor () {
    this.router = new Hono()
    this.establishmentController = new EstablishmentController()

    this.router
      .all('/', protectedRoute)
      .get('/',
        validate('query', getEstablishmentsSchema),
        async (c: Context<any, any, GetEstablishmentsInput>) => {
          const res = await this.establishmentController.getEstablishments(c)
          return c.json({ ...res }, 200)
        })
      .get('/:id',
        validate('param', getEstablishmentSchema),
        async (c: Context<any, any, GetEstablishmentInput>) => {
          const res = await this.establishmentController.getEstablishment(c)
          return c.json({ ...res }, 200)
        })
      .post('/',
        validate('json', postEstablishmentSchema),
        async (c: Context<any, any, PostEstablishmentInput>) => {
          const res = await this.establishmentController.createEstablishment(c)
          return c.json({ ...res }, 201)
        })
      .patch('/:id',
        validate('json', patchEstablishmentSchema),
        async (c: Context<any, any, PatchEstablishmentInput>) => {
          const res = await this.establishmentController.updateEstablishment(c)
          return c.json({ ...res }, 200)
        })
      .delete('/:id',
        validate('param', deleteEstablishmentSchema),
        async (c: Context<any, any, DeleteEstablishmentInput>) => {
          await this.establishmentController.deleteEstablishment(c)
          return c.body(null, 204)
        })
  }
}
