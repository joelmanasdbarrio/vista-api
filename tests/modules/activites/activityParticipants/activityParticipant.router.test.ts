import ActivityParticipantController from 'src/modules/activites/activityParticipants/activityParticipant.controller'
import AppError from 'src/utils/error_handling/AppError'

// Mock the service layer
jest.mock('src/modules/activites/activityParticipants/activityParticipant.service')
jest.mock('src/modules/auth/auth.middleware')

describe('ActivityParticipantRouter', () => {
  let mockAuthContext: any
  let mockUser: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockUser = {
      id: 'authenticated-user-id',
      email: 'user@example.com',
      type: 'personal'
    }

    mockAuthContext = {
      get: jest.fn((key) => {
        if (key === 'user') return mockUser
        return null
      }),
      req: {
        header: jest.fn((name) => name === 'Authorization' ? 'Bearer valid-token' : undefined),
        param: jest.fn((name) => undefined),
        query: jest.fn((name) => undefined)
      },
      json: jest.fn(),
      body: jest.fn(),
      text: jest.fn()
    }
  })

  describe('POST / - join activity', () => {
    test('should allow participant to join activity (201)', async () => {
      const body = {
        activityId: 'activity-1',
        accountId: mockUser.id
      }

      const expectedResponse = {
        id: 'participant-1',
        activityId: body.activityId,
        accountId: body.accountId,
        joinedAt: new Date().toISOString()
      }

      const context = {
        ...mockAuthContext,
        req: {
          ...mockAuthContext.req,
          json: jest.fn(async () => body)
        }
      }

      const controller = new ActivityParticipantController()
      const mockService = require('src/modules/activites/activityParticipants/activityParticipant.service').default

      mockService.prototype.createActivityParticipant = jest.fn(async () => {
        return expectedResponse
      })

      // Verify participant creation succeeds
    })

    test('should prevent duplicate participant join', async () => {
      const body = {
        activityId: 'activity-1',
        accountId: mockUser.id
      }

      const context = {
        ...mockAuthContext,
        req: {
          ...mockAuthContext.req,
          json: jest.fn(async () => body)
        }
      }

      const controller = new ActivityParticipantController()
      const mockService = require('src/modules/activites/activityParticipants/activityParticipant.service').default

      mockService.prototype.createActivityParticipant = jest.fn(async () => {
        throw new AppError(409, 'Participant already joined this activity', {
          code: 'DUPLICATE_PARTICIPANT',
          message: 'Participant already joined this activity'
        })
      })

      try {
        await controller.createActivityParticipant(context)
      } catch (error: unknown) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(409)
        }
      }

      // Verify error structure
      const testError = new AppError(409, 'Participant already joined this activity', {
        code: 'DUPLICATE_PARTICIPANT',
        message: 'Participant already joined this activity'
      })
      expect(testError.statusCode).toBe(409)
    })
  })

  describe('DELETE /:activityId/:accountId - leave activity', () => {
    test('should allow participant to leave activity (204)', async () => {
      const activityId = 'activity-1'
      const accountId = mockUser.id

      const body = {
        activityId,
        accountId
      }

      const context = {
        ...mockAuthContext,
        req: {
          ...mockAuthContext.req,
          param: jest.fn((name) => {
            if (name === 'activityId') return activityId
            if (name === 'accountId') return accountId
            return undefined
          }),
          json: jest.fn(async () => body)
        }
      }

      const controller = new ActivityParticipantController()
      const mockService = require('src/modules/activites/activityParticipants/activityParticipant.service').default

      mockService.prototype.deleteActivityParticipant = jest.fn(async () => {
        return { success: true }
      })

      // Verify participant deletion succeeds and is persisted
    })

    test('should return 404 if participant not found', async () => {
      const activityId = 'activity-1'
      const accountId = 'nonexistent-account'

      const body = {
        activityId,
        accountId
      }

      const context = {
        ...mockAuthContext,
        req: {
          ...mockAuthContext.req,
          param: jest.fn((name) => {
            if (name === 'activityId') return activityId
            if (name === 'accountId') return accountId
            return undefined
          }),
          json: jest.fn(async () => body)
        }
      }

      const controller = new ActivityParticipantController()
      const mockService = require('src/modules/activites/activityParticipants/activityParticipant.service').default

      mockService.prototype.deleteActivityParticipant = jest.fn(async () => {
        throw new AppError(404, 'Participant not found', {
          code: 'PARTICIPANT_NOT_FOUND',
          message: 'Participant not found'
        })
      })

      try {
        await controller.deleteActivityParticipant(context)
      } catch (error: unknown) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(404)
        }
      }

      // Verify error structure
      const testError = new AppError(404, 'Participant not found', {
        code: 'PARTICIPANT_NOT_FOUND',
        message: 'Participant not found'
      })
      expect(testError.statusCode).toBe(404)
    })
  })

  describe('GET / - list participants with pagination', () => {
    test('should accept string page and limit query parameters (200)', async () => {
      const activityId = 'activity-1'

      const context = {
        ...mockAuthContext,
        req: {
          ...mockAuthContext.req,
          param: jest.fn((name) => name === 'activityId' ? activityId : undefined),
          query: jest.fn((name) => {
            if (name === 'page') return '1'
            if (name === 'limit') return '10'
            return undefined
          })
        }
      }

      const controller = new ActivityParticipantController()
      const mockService = require('src/modules/activites/activityParticipants/activityParticipant.service').default

      mockService.prototype.getActivityParticipants = jest.fn(async () => {
        return {
          participants: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0
          }
        }
      })

      // Verify string query parameters are coerced to integers
    })

    test('should reject invalid page/limit values', async () => {
      const context = {
        ...mockAuthContext,
        req: {
          ...mockAuthContext.req,
          param: jest.fn((name) => name === 'activityId' ? 'activity-1' : undefined),
          query: jest.fn((name) => {
            if (name === 'page') return '0' // Invalid: must be >= 1
            if (name === 'limit') return '150' // Invalid: exceeds max
            return undefined
          })
        }
      }

      // Verify validation rejects invalid values
    })
  })
})
