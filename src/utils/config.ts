import { Context } from 'hono'
import { Env } from 'src/types/hono.types'
import AppError from './error_handling/AppError'

const config = {
  get<K extends keyof Env> (c: Context<{ Bindings: Env }>, key: K): Env[K] {
    const value = c.env[key]
    if (value == null || value === '') {
      throw new AppError(500, `Missing environment variable: ${String(key)}`, {
        code: 'MISSING_ENV_VARIABLE',
        message: `Missing environment variable: ${String(key)}`,
        details: `Please set the ${String(key)} environment variable`
      })
    }
    return value
  }
}

export default config
