import { Hono } from 'hono'
import AuthController from './auth.controller'

export default class AuthRouter {
  public router: Hono
  protected authController: AuthController

  constructor () {
    this.router = new Hono()
    this.authController = new AuthController()

    // Login is handled by Supabase Auth directly via OAuth flows or email/password auth.
  }
}
