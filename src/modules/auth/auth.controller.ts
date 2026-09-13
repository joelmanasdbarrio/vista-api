import { Context } from 'hono'
import { NODE_ENV } from 'src/types/hono.types'
import config from 'src/utils/config'
import AppError from 'src/utils/error_handling/AppError'
import BaseController from '../base.controller'
import AuthService from './auth.service'
import { LoginInput } from './lib/auth.validations'

export default class AuthController extends BaseController {
  protected resource = 'Auth'
  protected authService: AuthService

  constructor () {
    super()
    this.authService = new AuthService()
  }

  async login (c: Context<any, any, LoginInput>): Promise<any> {
    if (config.get(c, 'NODE_ENV') !== NODE_ENV.DEVELOPMENT) {
      throw new AppError(404, 'Not found', {
        code: 'NOT_FOUND',
        message: `Can't find ${c.req.url} on this server`
      })
    }

    const { email } = c.req.valid('json')

    const token = await this.authService.login(c, email)

    return {
      status: 'success',
      access_token: token
    }
  }
}
