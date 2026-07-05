import z from 'zod'
import { GetActivitySchema } from '../../lib/activity.validations'

export const ActivityParticipantSchema = z.object({
  id: z.uuid(),
  activityId: z.uuid(),
  accountId: z.uuid(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
})

export const GetActivityParticipantsSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  name: z.string().optional(),
  username: z.string().optional(),
  activityId: z.uuid().optional()
})

export const PostActivityParticipantSchema = z.object({
  accountId: z.uuid(),
  activityId: z.uuid()
})
export const DeleteActivityParticipantSchema = z.object({
  accountId: z.uuid(),
  activityId: z.uuid()
})

export interface GetActivityParticipantsInput {
  in: {
    param: z.infer<typeof GetActivitySchema>
    query: z.infer<typeof GetActivityParticipantsSchema>
  }
  out: {
    param: z.infer<typeof GetActivitySchema>
    query: z.infer<typeof GetActivityParticipantsSchema>
  }
}

export interface PostActivityParticipantInput {
  in: {
    param: z.infer<typeof GetActivitySchema>
  }
  out: {
    param: z.infer<typeof GetActivitySchema>
  }
}

export interface DeleteActivityParticipantInput {
  in: {
    param: z.infer<typeof GetActivitySchema>
  }
  out: {
    param: z.infer<typeof GetActivitySchema>
  }
}

export type GetActivityParticipantsQuery = z.infer<typeof GetActivityParticipantsSchema>
export type PostActivityParticipantObj = z.infer<typeof PostActivityParticipantSchema>
export type DeleteActivityParticipantObj = z.infer<typeof DeleteActivityParticipantSchema>
