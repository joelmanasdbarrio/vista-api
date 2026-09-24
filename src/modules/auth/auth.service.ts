/**
 * @deprecated
 * Custom login endpoint has been removed. Use Supabase Auth directly for user authentication.
 * See: https://supabase.com/docs/guides/auth
 */

import { Context } from 'hono'
import AppError from 'src/utils/error_handling/AppError'

export default class AuthService {
  async login (c: Context, email: string): Promise<never> {
    throw new AppError(410, 'Gone', {
      code: 'ENDPOINT_REMOVED',
      message: 'The custom login endpoint has been removed',
      details: 'Use Supabase Auth directly for authentication. See https://supabase.com/docs/guides/auth'
    })
  }
}
