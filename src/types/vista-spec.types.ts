// Barrel file for ergonomic named exports of OpenAPI types
// Generated from src/types/schema/vista-spec.schema.ts

import type { $defs, components, operations, paths, webhooks } from './schema/vista-spec.schema'

// Export all main OpenAPI root types
export type { $defs, components, operations, paths, webhooks }

// Resource DTOs
export type AccountDTO = components['schemas']['AccountDTO']
export type AccountPersonalDTO = components['schemas']['AccountPersonalDTO']
export type AccountEnterpriseDTO = components['schemas']['AccountEnterpriseDTO']
export type AccountBase = components['schemas']['AccountBase']
export type FollowDTO = components['schemas']['FollowDTO']
export type FollowRequestDTO = components['schemas']['FollowRequestDTO']
export type NotificationDTO = components['schemas']['NotificationDTO']
export type AddressDTO = components['schemas']['AddressDTO']
export type ActivityDTO = components['schemas']['ActivityDTO']
export type ActivityOnsiteDTO = components['schemas']['ActivityOnsiteDTO']
export type ActivityOnlineDTO = components['schemas']['ActivityOnlineDTO']
export type ActivityBase = components['schemas']['ActivityBase']
export type ActivityCategoryDTO = components['schemas']['ActivityCategoryDTO']
export type ActivityParticipantDTO = components['schemas']['ActivityParticipantDTO']
export type EstablishmentDTO = components['schemas']['EstablishmentDTO']
export type EstablishmentRequestDTO = components['schemas']['EstablishmentRequestDTO']

// Paginated DTOs
export type PaginatedDTO = components['schemas']['PaginatedDTO']
export type AccountsPaginatedDTO = components['schemas']['AccountsPaginatedDTO']
export type AccountsPersonalPaginatedDTO = components['schemas']['AccountsPersonalPaginatedDTO']
export type FollowRequestsPaginatedDTO = components['schemas']['FollowRequestsPaginatedDTO']
export type NotificationsPaginatedDTO = components['schemas']['NotificationsPaginatedDTO']
export type ActivitiesPaginatedDTO = components['schemas']['ActivitiesPaginatedDTO']
export type EstablishmentsPaginatedDTO = components['schemas']['EstablishmentsPaginatedDTO']
export type EstablishmentRequestsPaginatedDTO = components['schemas']['EstablishmentRequestsPaginatedDTO']

// Success response types
export type AccountsResponse = components['schemas']['AccountsResponse']
export type AccountsPersonalResponse = components['schemas']['AccountsPersonalResponse']
export type AccountResponse = components['schemas']['AccountResponse']
export type FollowResponse = components['schemas']['FollowResponse']
export type FollowRequestsResponse = components['schemas']['FollowRequestsResponse']
export type FollowRequestResponse = components['schemas']['FollowRequestResponse']
export type NotificationsResponse = components['schemas']['NotificationsResponse']
export type NotificationResponse = components['schemas']['NotificationResponse']
export type ActivitiesResponse = components['schemas']['ActivitiesResponse']
export type ActivityResponse = components['schemas']['ActivityResponse']
export type ActivityParticipantsResponse = components['schemas']['ActivityParticipantsResponse']
export type ActivityParticipantResponse = components['schemas']['ActivityParticipantResponse']
export type ActivityCategoriesResponse = components['schemas']['ActivityCategoriesResponse']
export type EstablishmentsResponse = components['schemas']['EstablishmentsResponse']
export type EstablishmentResponse = components['schemas']['EstablishmentResponse']
export type EstablishmentRequestsResponse = components['schemas']['EstablishmentRequestsResponse']
export type EstablishmentRequestResponse = components['schemas']['EstablishmentRequestResponse']

// Error response types
export type BadRequestError = components['responses']['BadRequestError']
export type UnauthorizedError = components['responses']['UnauthorizedError']
export type ForbiddenError = components['responses']['ForbiddenError']
export type NotFoundError = components['responses']['NotFoundError']
export type InternalServerError = components['responses']['InternalServerError']

// Enums
export enum AccountTypeEnum {
  PERSONAL = 'personal',
  ENTERPRISE = 'enterprise'
}

export enum GenderEnum {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export enum ActivityTypeEnum {
  ONSITE = 'onsite',
  ONLINE = 'online'
}

export enum ActivityLanguageEnum {
  ENGLISH = 'en',
  SPANISH = 'es'
}

export enum FollowRequestStatusEnum {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum EstablishmentRequestStatusEnum {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum NotificationTypeEnum {
  FOLLOW = 'follow',
  FOLLOW_REQUEST = 'follow_request',
  ESTABLISHMENT_REQUEST = 'establishment_request',
  ENTRY = 'entry',
  ACTIVITY = 'activity',
  SYSTEM = 'system'
}

/**
 * Query parameters for GET /accounts/{id}/establishments
 * Matches OpenAPI: establishmentNameParam, establishmentAddressParam
 */
export interface GetAccountEstablishmentsQuery {
  page?: number
  limit?: number
  name?: string
  address?: string
}

/**
 * Query parameters for GET /accounts/{id}/followers and /accounts/{id}/followings
 * Matches OpenAPI: accountNameParam, accountUsernameParam
 */
export interface GetAccountFollowersQuery {
  page?: number
  limit?: number
  name?: string
  username?: string
}

/**
 * Query parameters for GET /activities
 * Matches OpenAPI: activityTypeParam, activityTitleParam, activityDescriptionParam, activityCategoryIdParam, activityMinPriceParam, activityMaxPriceParam, activityTimeStartParam, activityTimeEndParam, activityMinParcipantsParam, activityMaxParcipantsParam, activityMinEntriesParam, activityMaxEntriesParam, activityLanguageParam
 */
export interface GetActivitiesQuery {
  page?: number
  limit?: number
  type?: ActivityTypeEnum
  title?: string
  description?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  timeStart?: string
  timeEnd?: string
  minParticipants?: number
  maxParticipants?: number
  minEntries?: number
  maxEntries?: number
  language?: string
}

/**
 * Query parameters for GET /activity/{id}/participants
 * Matches OpenAPI: accountNameParam, accountUsernameParam
 */
export interface GetActivityParticipantsQuery {
  page?: number
  limit?: number
  name?: string
  username?: string
}
