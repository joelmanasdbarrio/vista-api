import { Hono } from 'hono'
import z from 'zod'
import AccountController from './account.controller'
import { protectedRoute } from '../auth/auth.middleware'
import { AccountTypeEnum, GenderEnum } from '../../types/vista-spec.types'
import validate from '../../utils/error_handling/middlewares/validator.middleware'

export default class AccountRouter {
  public router: Hono
  protected accountController: AccountController

  constructor() {
    this.router = new Hono()
    this.accountController = new AccountController()

    this.router
      .all('/', protectedRoute)
      .get('/',
        validate('query', getAccountsSchema),
        async (c) => {
          const res = await this.accountController.getAccounts(c)
          return c.json({ ...res }, 200)
        }
      )
      .patch('/',
        validate('json', patchAccountSchema),
        async (c) => {
          const res = await this.accountController.updateAccount(c)
          return c.json({ ...res }, 200)
        }
      )
      .delete('/',
        async (c) => {
          await this.accountController.deleteAccount(c)
          return c.body(null, 204)
        }
      )

    this.router
      .all('/:id', protectedRoute)
      .get('/:id',
        validate('param', getAccountSchema),
        async (c) => {
          const res = await this.accountController.getAccount(c)
          return c.json({ ...res }, 200)
        }
      )

    // this.router.route('/:id', followRouter)
  }
}

const getAccountsSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  type: z.enum(AccountTypeEnum).optional(),
  name: z.string().optional(),
  username: z.string().optional()
})

const getAccountSchema = z.object({
  id: z.union([z.uuid(), z.string()])
})

const patchAccountSchema = z.object({
  id: z.uuid(),
  name: z.string().optional(),
  username: z.string().optional(),
  biography: z.string().optional(),
  avatar: z.string().optional(),
  website: z.url().optional(),
  isPrivate: z.boolean().optional(),
  gender: z.enum(GenderEnum).optional(),
  birthdate: z.date().optional(),
})