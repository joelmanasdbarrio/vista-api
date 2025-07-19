import { Context, Hono } from 'hono'
import AccountController from './account.controller'
import { protectedRoute } from '../auth/auth.middleware'
import validate from '../../utils/error_handling/middlewares/validator.middleware'
import { getAccountSchema, GetAccountsInput, getAccountsSchema, PatchAccountInput, patchAccountSchema } from './lib/account.validations'

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
        async (c: Context<any, any, GetAccountsInput>) => {
          const res = await this.accountController.getAccounts(c)
          return c.json({ ...res }, 200)
        }
      )
      .patch('/',
        validate('json', patchAccountSchema),
        async (c: Context<any, any, PatchAccountInput>) => {
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

