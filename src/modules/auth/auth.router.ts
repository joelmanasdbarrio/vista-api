import { Context, Hono } from 'hono'
import validate from 'src/utils/error_handling/middlewares/validator.middleware'
import AuthController from './auth.controller'
import { loginRateLimit } from './auth.middleware'
import { LoginInput, LoginSchema } from './lib/auth.validations'

export default class AuthRouter {
  public router: Hono
  protected authController: AuthController

  constructor () {
    this.router = new Hono()
    this.authController = new AuthController()

    this.router
      .post('/login',
        loginRateLimit,
        validate('json', LoginSchema),
        async (c: Context<any, any, LoginInput>) => {
          const res = await this.authController.login(c)
          return c.json({ ...res }, 200)
        })
  }
}
