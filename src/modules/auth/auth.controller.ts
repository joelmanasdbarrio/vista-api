import { Context } from 'hono'
import AppError from 'src/utils/error_handling/AppError'
import BaseController from '../base.controller'

/**
 * @deprecated
 * Auth controller is retained for backward compatibility but no longer in use.
 * Custom login endpoint has been removed; use Supabase Auth directly.
 */
export default class AuthController extends BaseController {
  protected resource = 'Auth'

  async login (c: Context): Promise<never> {
    throw new AppError(410, 'Gone', {
      code: 'ENDPOINT_REMOVED',
      message: 'The custom login endpoint has been removed',
      details: 'Use Supabase Auth directly for authentication. See https://supabase.com/docs/guides/auth'
    })
  }
}
