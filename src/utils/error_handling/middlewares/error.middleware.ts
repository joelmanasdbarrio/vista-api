import { Context } from 'hono'
import { NODE_ENV } from 'src/types/hono.types.js'
import config from 'src/utils/config.js'
import logger from '../../logger.js'
import AppError from '../AppError.js'

/**
 * Logs and returns the complete error message in development mode for debugging
 */
const devError = (err: AppError, c: Context) => {
  const labels = { resource: 'Error', layer: 'Middleware', method: 'devError' }

  logger.info('Development error', labels)
  logger.error(err, labels)
  return c.json(err, err.statusCode)
}

/**
 * Logs and returns a generic error message in production mode
 */
const prodError = (err: AppError, c: Context) => {
  const labels = { resource: 'Error', layer: 'Middleware', method: 'prodError' }
  logger.info('Production error', labels)
  logger.error(err, labels)

  if (err.statusCode < 500) {
    return c.json(err)
  } else {
    return c.json({
      status: 'error',
      statusCode: 500,
      error: {
        code: (err.errors != null) ? err.errors[0].code : err.error?.code,
        message: 'An unexpected error occurred',
        details: 'Please try again later or contact support'
      }
    }, 500)
  }
}

export default function globalErrorHandler (err: unknown, c: Context) {
  // Ensure the error is always an AppError
  const appError = err instanceof AppError
    ? err
    : (() => {
        const error = err instanceof Error ? err : new Error('Internal Server Error')
        return new AppError(500, error.message, { code: 'INTERNAL_SERVER_ERROR', message: error.message })
      })()
  if (config.get(c, 'NODE_ENV') === NODE_ENV.DEVELOPMENT) {
    return devError(appError, c)
  } else {
    return prodError(appError, c)
  }
}
