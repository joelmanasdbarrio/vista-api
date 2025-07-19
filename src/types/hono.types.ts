import type {
  AccountDTO,
  ActivityDTO,
  ActivityCategoryDTO,
  NotificationDTO,
  FollowRequestDTO,
  EstablishmentDTO,
  EstablishmentRequestDTO
} from './vista-spec.types'

declare module 'hono' {
  interface ContextVariableMap {
    user: AccountDTO
    activity: ActivityDTO
    activityCategory: ActivityCategoryDTO
    notification: NotificationDTO
    followRequest: FollowRequestDTO
    establishment: EstablishmentDTO
    establishmentRequest: EstablishmentRequestDTO
  }
}

// Re-export for easier access
export type { ContextVariableMap } from 'hono'
