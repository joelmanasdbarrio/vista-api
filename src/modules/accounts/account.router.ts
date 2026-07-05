import { Context, Hono } from 'hono'
import { protectedRoute } from 'src/modules/auth/auth.middleware'
import validate from 'src/utils/error_handling/middlewares/validator.middleware'
import AccountController from './account.controller'
import { GetAccountInput, GetAccountSchema, GetAccountsInput, GetAccountsSchema, PatchAccountInput, PatchAccountSchema } from './lib/account.validations'

export default class AccountRouter {
  public router: Hono
  protected accountController: AccountController

  constructor () {
    this.router = new Hono()
    this.accountController = new AccountController()

    this.router
      .all('/', protectedRoute)
      .get('/',
        validate('query', GetAccountsSchema),
        async (c: Context<any, any, GetAccountsInput>) => {
          const res = await this.accountController.getAccounts(c)
          return c.json({ ...res }, 200)
        })
      .patch('/',
        validate('json', PatchAccountSchema),
        async (c: Context<any, any, PatchAccountInput>) => {
          const res = await this.accountController.updateAccount(c)
          return c.json({ ...res }, 200)
        })
      .delete('/',
        async (c: Context) => {
          await this.accountController.deleteAccount(c)
          return c.body(null, 204)
        })
      .get('/:id',
        validate('param', GetAccountSchema),
        async (c: Context<any, any, GetAccountInput>) => {
          const res = await this.accountController.getAccount(c)
          return c.json({ ...res }, 200)
        })
  }
}
