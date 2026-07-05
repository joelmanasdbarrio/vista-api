import type {
  AccountDTO,
  ActivityCategoryDTO,
  ActivityDTO,
  EstablishmentDTO,
  EstablishmentRequestDTO,
  FollowRequestDTO,
  NotificationDTO
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

export interface Env {
  NODE_ENV: NODE_ENV
  DATABASE_URL: string
  SUPABASE_JWT_SECRET: string
  SUPABASE_API_KEY: string
}

export enum NODE_ENV {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production'
}
