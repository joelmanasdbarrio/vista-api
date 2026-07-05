import { Context } from 'hono'
import { sign } from 'hono/jwt'
import config from 'src/utils/config'
import AppError from 'src/utils/error_handling/AppError'
import AccountService from '../accounts/account.service'

export default class AuthService {
  async login (c: Context, email: string): Promise<string> {
    const accountService = new AccountService()
    const account = await accountService.getOneAccountByEmail(c, { email })

    if (account == null) {
      throw new AppError(401, 'Invalid credentials', {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials',
        details: 'The provided email does not match any account'
      })
    }

    const token = await sign(
      {
        sub: account.id,
        email: account.email,
        username: account.username
      },
      config.get(c, 'SUPABASE_JWT_SECRET'),
      'HS256'
    )

    return token
  }
}
