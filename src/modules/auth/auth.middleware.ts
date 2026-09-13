import { Context, Next } from 'hono'
import { verify } from 'hono/jwt'
import config from 'src/utils/config'
import '../../types/hono.types'
import AppError from '../../utils/error_handling/AppError'
import Logger from '../../utils/logger'
import AccountService from '../accounts/account.service'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const WINDOW_MS = 60_000
const MAX_REQUESTS = 5
const MAX_ENTRIES = 10_000
const loginRateLimitEntries = new Map<string, RateLimitEntry>()

function getClientKey (c: Context): string {
  return c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For')?.split(',')[0].trim() ?? 'unknown'
}

function removeExpiredRateLimitEntries (now: number): void {
  for (const [key, entry] of loginRateLimitEntries) {
    if (entry.resetAt <= now) loginRateLimitEntries.delete(key)
  }
}

export async function loginRateLimit (c: Context, next: Next): Promise<void> {
  const now = Date.now()
  const key = getClientKey(c)
  const current = loginRateLimitEntries.get(key)

  if (loginRateLimitEntries.size >= MAX_ENTRIES) removeExpiredRateLimitEntries(now)

  const entry = current == null || current.resetAt <= now
    ? { count: 1, resetAt: now + WINDOW_MS }
    : { count: current.count + 1, resetAt: current.resetAt }

  loginRateLimitEntries.set(key, entry)

  if (entry.count > MAX_REQUESTS) {
    throw new AppError(429, 'Too many requests', {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts',
      details: 'Please try again later'
    })
  }

  await next()
}

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

  await verify(token, config.get(c, 'SUPABASE_JWT_SECRET'), 'HS256')
    .then(async payload => {
      if (payload.sub) {
        const accountService = new AccountService()
        const user = await accountService.getOneAccount(c, { id: payload.sub as string })

        if (user == null) throw new AppError(401, 'Unauthorized', { code: 'UNAUTHORIZED', message: 'Unauthorized', details: 'Authentication token is badly formatted. Please, log in again.' })

        c.set('user', user)
        await next()
      } else {
        throw new AppError(401, 'Unauthorized', { code: 'UNAUTHORIZED', message: 'Unauthorized', details: 'Authentication token is badly formatted. Please, log in again.' })
      }
    }).catch(err => {
      console.error('Token invalid:', err)
      throw new AppError(401, 'Unauthorized', { code: 'UNAUTHORIZED', message: 'Unauthorized', details: 'Authentication token is badly formatted or your account no longer exists. Please, log in again.' })
    })
}
