import { Context, Next } from 'hono'
import { verify } from 'hono/jwt'
import Logger from '../../utils/logger'
import AppError from '../../utils/error_handling/AppError'
import AccountService from '../accounts/account.service'
import '../../types/hono.types'

export const protectedRoute = async (c: Context, next: Next) => {
  Logger.info('Protected route', { resource: 'Auth', layer: 'Middleware', method: 'protectedRoute' })

  const auth = c.req.header('Authorization')
  if (!auth?.startsWith('Bearer ')) {
    throw new AppError(401, 'Unauthorized', { code: 'UNAUTHORIZED', message: 'Unauthorized', details: 'You must be logged in to access this resource' })
  }

  const token = auth.split(' ')[1]
  if (!token) {
    throw new AppError(401, 'Unauthorized', { code: 'UNAUTHORIZED', message: 'Unauthorized', details: 'You must be logged in to access this resource' })
  }

  await verify(token, c.env.SUPABASE_JWT_SECRET, 'HS256')
    .then(async payload => {
      if (payload.sub) {
        const accountService = new AccountService()
        const user = await accountService.getOneAccount(c, payload.sub as string)

        if (!user) throw new AppError(401, 'Unauthorized', { code: 'UNAUTHORIZED', 'message': 'Unauthorized', details: 'Authentication token is badly formatted. Please, log in again.' })

        c.set('user', user)
        await next()
      } else {
        throw new AppError(401, 'Unauthorized', { code: 'UNAUTHORIZED', 'message': 'Unauthorized', details: 'Authentication token is badly formatted. Please, log in again.' })
      }
    }).catch(err => {
      console.error('Token invalid:', err)
      throw new AppError(401, 'Unauthorized', { code: 'UNAUTHORIZED', message: 'Unauthorized', details: 'Authentication token is badly formatted or your account no longer exists. Please, log in again.' })
    })
}

