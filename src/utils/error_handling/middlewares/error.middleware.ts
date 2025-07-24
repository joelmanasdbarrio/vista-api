import logger from '../../logger.js'
import AppError from '../AppError.js'
import { Context } from 'hono'

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

export default function globalErrorHandler (err: any, c: Context) {
  // Ensure the error is always an AppError
  if (!(err instanceof AppError)) {
    err = new AppError(500, err.message || 'Internal Server Error', { code: err.code || 'INTERNAL_SERVER_ERROR', message: err.message })
  }
  if (c.env.NODE_ENV === 'development') {
    return devError(err, c)
  } else {
    return prodError(err, c)
  }
}
