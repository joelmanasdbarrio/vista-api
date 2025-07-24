import { zValidator } from '@hono/zod-validator'
import { ValidationTargets } from 'hono'
import * as v3 from 'zod/v3'
import * as v4 from 'zod/v4/core'
import AppError, { CustomError } from '../AppError'

type ZodSchema = v3.ZodType | v4.$ZodType

export default function validate (target: keyof ValidationTargets, schema: ZodSchema) {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      const errors: CustomError[] = []
      result.error.issues.forEach(issue => {
        errors.push({
          code: (issue.code + '_' + issue.path).toUpperCase(),
          message: issue.message
        })
      })

      throw new AppError(400, 'Bad Request', errors)
    }
  })
}
