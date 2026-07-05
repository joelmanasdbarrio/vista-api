import { Hono } from 'hono'
import AuthController from './auth.controller'

export default class AuthRouter {
  public router: Hono
  protected authController: AuthController

  constructor () {
    this.router = new Hono()
    this.authController = new AuthController()

    this.router
      .post('/login', async (c) => {
        const res = await this.authController.login(c)
        return c.json({ ...res }, 200)
      })
  }
}
