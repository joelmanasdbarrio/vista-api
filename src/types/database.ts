// This file is auto-generated from Drizzle schema. Do not edit manually.
import type { InferSelectModel, InferInsertModel, InferEnum } from 'drizzle-orm'
import * as schema from '../db/schema'

export type Account = InferSelectModel<typeof schema.account>
export type NewAccount = InferInsertModel<typeof schema.account>
export type Follow = InferSelectModel<typeof schema.follow>
export type NewFollow = InferInsertModel<typeof schema.follow>
export type FollowRequest = InferSelectModel<typeof schema.followRequest>
export type NewFollowRequest = InferInsertModel<typeof schema.followRequest>
export type Address = InferSelectModel<typeof schema.address>
export type NewAddress = InferInsertModel<typeof schema.address>
export type ActivityCategory = InferSelectModel<typeof schema.activity_category>
export type NewActivityCategory = InferInsertModel<typeof schema.activity_category>
export type Establishment = InferSelectModel<typeof schema.establishment>
export type NewEstablishment = InferInsertModel<typeof schema.establishment>
export type Activity = InferSelectModel<typeof schema.activity>
export type NewActivity = InferInsertModel<typeof schema.activity>
export type ActivityOnsite = InferSelectModel<typeof schema.activityOnsite>
export type NewActivityOnsite = InferInsertModel<typeof schema.activityOnsite>
export type ActivityOnline = InferSelectModel<typeof schema.activityOnline>
export type NewActivityOnline = InferInsertModel<typeof schema.activityOnline>
export type ActivityParticipant = InferSelectModel<typeof schema.activityParticipant>
export type NewActivityParticipant = InferInsertModel<typeof schema.activityParticipant>
export type EstablishmentRequest = InferSelectModel<typeof schema.establishmentRequest>
export type NewEstablishmentRequest = InferInsertModel<typeof schema.establishmentRequest>
export type Notification = InferSelectModel<typeof schema.notification>
export type NewNotification = InferInsertModel<typeof schema.notification>
export type GenderEnum = InferEnum<typeof schema.genderEnum>
export type AccountTypeEnum = InferEnum<typeof schema.accountTypeEnum>
export type FollowRequestStatusEnum = InferEnum<typeof schema.followRequestStatusEnum>
export type EstablishmentRequestStatusEnum = InferEnum<typeof schema.establishmentRequestStatusEnum>
export type NotificationTypeEnum = InferEnum<typeof schema.notificationTypeEnum>
export type ActivityLanguageEnum = InferEnum<typeof schema.activityLanguageEnum>
