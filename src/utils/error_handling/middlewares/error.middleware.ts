import logger from '../../logger.js'
import AppError from '../AppError.js'
import { Context } from 'hono'

const labels = { resource: 'Error', layer: 'Middleware', method: 'globalErrorHandler' }

/**
 * Logs and returns the complete error message in development mode for debugging
 */
const devError = (err: any, c: Context) => {
  logger.error(c, err, labels)

  const error = {
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  }
  logger.debug(c, error)

  return c.json(error, err.status)
}

/**
 * Logs and returns a generic error message in production mode
 */
const prodError = (err: any, c: Context) => {
  logger.error(c, err, labels)

  logger.debug(c, { err })

  if (err.isOperational) {
    return c.json({
      status: err.status,
      message: err.message,
      error: { code: err.code }
    }, err.statusCode)
  } else {
    return c.json({
      message: 'Something wrong happened',
      error: { code: err.code }
    }, 500)
  }
}

export default function globalErrorHandler(err: any, c: Context) {
  // Ensure the error is always an AppError
  if (!(err instanceof AppError)) {
    err = new AppError(err.message || 'Internal Server Error', 500, 'INTERNAL_SERVER_ERROR', undefined)
  }
  if (process.env.NODE_ENV === 'development') {
    return devError(err, c)
  } else {
    return prodError(err, c)
  }
}
