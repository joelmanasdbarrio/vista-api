import { Context } from 'hono'
import { Env } from 'src/types/hono.types'
import AppError from './error_handling/AppError'

const config = {
  get (c: Context<{ Bindings: Env }>, key: keyof Env): Env[keyof Env] {
    const value = process.env[key]
    if (!value) {
      throw new AppError(500, `Missing environment variable: ${key}`, {
        code: 'MISSING_ENV_VARIABLE',
        message: `Missing environment variable: ${key}`,
        details: `Please set the ${key} environment variable`
      })
    }
    return value
  }
}

export default config
