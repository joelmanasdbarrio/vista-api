import { ContentfulStatusCode } from "hono/utils/http-status";

export interface CustomError {
  code: string;
  message: string;
  details?: string;
}

export default class AppError extends Error {
  public status: string;
  public statusCode: ContentfulStatusCode;
  public error?: CustomError;
  public errors?: CustomError[];

  constructor(statusCode: ContentfulStatusCode, message: string, error: CustomError);
  constructor(statusCode: ContentfulStatusCode, message: string, errors: CustomError[]);

  constructor(statusCode: ContentfulStatusCode = 500, message: string, errorOrErrors?: CustomError | CustomError[]) {
    super(message);
    this.status = 'error'
    this.statusCode = statusCode
    if (Array.isArray(errorOrErrors)) {
      this.errors = errorOrErrors;
    } else if (errorOrErrors) {
      this.error = errorOrErrors;
    }
    Error.captureStackTrace(this, this.constructor);
  }
}