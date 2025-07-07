export default class AppError extends Error {
  status: number;
  error: string;
  code?: string;
  isOperational: boolean;

  /**
   * @param message Error message
   * @param status HTTP status code (default: 500)
   * @param error Error type (default: 'INTERNAL_SERVER_ERROR')
   * @param code Optional error code for more specific error identification
   *
   * @author Joel Mañas del Barrio
   */
  constructor(message: string, status: number = 500, error: string, code?: string) {
    super(message)
    this.status = status || 500
    this.error = error || 'INTERNAL_SERVER_ERROR'
    this.code = code || undefined
    this.isOperational = status < 500
    Error.captureStackTrace(this, this.constructor)
  }
}
