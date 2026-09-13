import z from 'zod'

export const LoginSchema = z.object({
  email: z.email()
})

export interface LoginInput {
  in: {
    json: z.infer<typeof LoginSchema>
  }
  out: {
    json: z.infer<typeof LoginSchema>
  }
}

export type LoginBody = z.infer<typeof LoginSchema>
