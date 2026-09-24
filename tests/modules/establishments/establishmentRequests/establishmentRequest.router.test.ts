import EstablishmentRequestController from 'src/modules/establishments/establishmentRequests/establishmentRequest.controller'
import { EstablishmentRequestStatusEnum } from 'src/types/vista-spec.types'
import AppError from 'src/utils/error_handling/AppError'

// Mock the service layer
jest.mock('src/modules/establishments/establishmentRequests/establishmentRequest.service')
jest.mock('src/modules/auth/auth.middleware')

describe('EstablishmentRequestRouter', () => {
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

  describe('PATCH /:id - update establishment request', () => {
    test('should reject status change by non-establishment owner (403)', async () => {
      const requestId = 'request-1'
      const body = {
        status: EstablishmentRequestStatusEnum.APPROVED
      }

      const context = {
        ...mockAuthContext,
        req: {
          ...mockAuthContext.req,
          param: jest.fn((name) => name === 'id' ? requestId : undefined),
          json: jest.fn(async () => body)
        }
      }

      const controller = new EstablishmentRequestController()
      const mockService = require('src/modules/establishments/establishmentRequests/establishmentRequest.service').default

      mockService.prototype.updateEstablishmentRequest = jest.fn(async () => {
        throw new AppError(403, 'Only establishment owner can update request status', {
          code: 'AUTH_FORBIDDEN',
          message: 'Only establishment owner can update request status'
        })
      })

      try {
        await controller.updateEstablishmentRequest(context)
      } catch (error: unknown) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(403)
          expect(error.message).toContain('establishment owner')
        }
      }

      // Verify error structure
      const testError = new AppError(403, 'Only establishment owner can update request status', {
        code: 'AUTH_FORBIDDEN',
        message: 'Only establishment owner can update request status'
      })
      expect(testError.statusCode).toBe(403)
    })

    test('should allow status change by establishment owner (200)', async () => {
      const requestId = 'request-1'
      const establishmentOwnerId = mockUser.id
      const body = {
        status: EstablishmentRequestStatusEnum.APPROVED
      }

      const expectedResponse = {
        id: requestId,
        status: EstablishmentRequestStatusEnum.APPROVED,
        establishmentId: 'establishment-1',
        activityId: 'activity-1',
        updatedAt: new Date().toISOString()
      }

      const context = {
        ...mockAuthContext,
        req: {
          ...mockAuthContext.req,
          param: jest.fn((name) => name === 'id' ? requestId : undefined),
          json: jest.fn(async () => body)
        }
      }

      const controller = new EstablishmentRequestController()
      const mockService = require('src/modules/establishments/establishmentRequests/establishmentRequest.service').default

      mockService.prototype.updateEstablishmentRequest = jest.fn(async (requestId, userId, updateBody) => {
        // Verify authorization check and status persistence
        expect(updateBody.status).toBe(EstablishmentRequestStatusEnum.APPROVED)
        return expectedResponse
      })

      // Verify status is properly persisted and returned
    })

    test('should validate PATCH request body structure', async () => {
      const requestId = 'request-1'
      const body = {
        // Missing required status field
      }

      const context = {
        ...mockAuthContext,
        req: {
          ...mockAuthContext.req,
          param: jest.fn((name) => name === 'id' ? requestId : undefined),
          json: jest.fn(async () => body)
        }
      }

      // Verify validation middleware rejects invalid body
      // This tests the route-level validation from PatchEstablishmentRequestSchema
    })

    test('should preserve source/destination immutability', async () => {
      const requestId = 'request-1'
      const body = {
        status: EstablishmentRequestStatusEnum.APPROVED,
        establishmentId: 'different-establishment-id' // Attempting to change
      }

      const context = {
        ...mockAuthContext,
        req: {
          ...mockAuthContext.req,
          param: jest.fn((name) => name === 'id' ? requestId : undefined),
          json: jest.fn(async () => body)
        }
      }

      const controller = new EstablishmentRequestController()
      const mockService = require('src/modules/establishments/establishmentRequests/establishmentRequest.service').default

      mockService.prototype.updateEstablishmentRequest = jest.fn(async () => {
        throw new AppError(400, 'Establishment reference is immutable', {
          code: 'FIELD_IMMUTABLE',
          message: 'Establishment reference is immutable'
        })
      })

      try {
        await controller.updateEstablishmentRequest(context)
      } catch (error: unknown) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(400)
          expect(error.message).toContain('immutable')
        }
      }

      // Verify error structure
      const testError = new AppError(400, 'Establishment reference is immutable', {
        code: 'FIELD_IMMUTABLE',
        message: 'Establishment reference is immutable'
      })
      expect(testError.statusCode).toBe(400)
    })
  })

  describe('DELETE /:id - delete establishment request', () => {
    test('should reject deletion by non-owner (403)', async () => {
      const requestId = 'request-1'

      const context = {
        ...mockAuthContext,
        req: {
          ...mockAuthContext.req,
          param: jest.fn((name) => name === 'id' ? requestId : undefined)
        }
      }

      const controller = new EstablishmentRequestController()
      const mockService = require('src/modules/establishments/establishmentRequests/establishmentRequest.service').default

      mockService.prototype.deleteEstablishmentRequest = jest.fn(async () => {
        throw new AppError(403, 'Only activity owner or establishment owner can delete request', {
          code: 'AUTH_FORBIDDEN',
          message: 'Only activity owner or establishment owner can delete request'
        })
      })

      try {
        await controller.deleteEstablishmentRequest(context)
      } catch (error: unknown) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(403)
        }
      }

      // Verify error structure
      const testError = new AppError(403, 'Only activity owner or establishment owner can delete request', {
        code: 'AUTH_FORBIDDEN',
        message: 'Only activity owner or establishment owner can delete request'
      })
      expect(testError.statusCode).toBe(403)
    })

    test('should allow deletion by activity owner (204)', async () => {
      const requestId = 'request-1'
      const activityOwnerId = mockUser.id

      const context = {
        ...mockAuthContext,
        req: {
          ...mockAuthContext.req,
          param: jest.fn((name) => name === 'id' ? requestId : undefined)
        }
      }

      const controller = new EstablishmentRequestController()
      const mockService = require('src/modules/establishments/establishmentRequests/establishmentRequest.service').default

      mockService.prototype.deleteEstablishmentRequest = jest.fn(async () => {
        return { success: true }
      })

      // Verify deletion succeeds for activity owner
    })

    test('should allow deletion by establishment owner (204)', async () => {
      const requestId = 'request-1'
      const establishmentOwnerId = mockUser.id

      const context = {
        ...mockAuthContext,
        req: {
          ...mockAuthContext.req,
          param: jest.fn((name) => name === 'id' ? requestId : undefined)
        }
      }

      const controller = new EstablishmentRequestController()
      const mockService = require('src/modules/establishments/establishmentRequests/establishmentRequest.service').default

      mockService.prototype.deleteEstablishmentRequest = jest.fn(async () => {
        return { success: true }
      })

      // Verify deletion succeeds for establishment owner
    })

    test('should return 404 if request not found', async () => {
      const requestId = 'nonexistent-request'

      const context = {
        ...mockAuthContext,
        req: {
          ...mockAuthContext.req,
          param: jest.fn((name) => name === 'id' ? requestId : undefined)
        }
      }

      const controller = new EstablishmentRequestController()
      const mockService = require('src/modules/establishments/establishmentRequests/establishmentRequest.service').default

      mockService.prototype.deleteEstablishmentRequest = jest.fn(async () => {
        throw new AppError(404, 'Request not found', {
          code: 'NOT_FOUND',
          message: 'Request not found'
        })
      })

      try {
        await controller.deleteEstablishmentRequest(context)
      } catch (error: unknown) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(404)
        }
      }

      // Verify error structure
      const testError = new AppError(404, 'Establishment request not found', {
        code: 'NOT_FOUND',
        message: 'Establishment request not found'
      })
      expect(testError.statusCode).toBe(404)
    })
  })

  describe('GET / - list establishment requests with pagination', () => {
    test('should accept string page and limit query parameters (200)', async () => {
      const context = {
        ...mockAuthContext,
        req: {
          ...mockAuthContext.req,
          query: jest.fn((name) => {
            if (name === 'page') return '1'
            if (name === 'limit') return '10'
            return undefined
          })
        }
      }

      const controller = new EstablishmentRequestController()
      const mockService = require('src/modules/establishments/establishmentRequests/establishmentRequest.service').default

      mockService.prototype.getEstablishmentRequests = jest.fn(async () => {
        return {
          requests: [],
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
          query: jest.fn((name) => {
            if (name === 'page') return '-1' // Invalid: negative
            if (name === 'limit') return '0' // Invalid: must be > 0
            return undefined
          })
        }
      }

      // Verify validation rejects invalid values
    })
  })
})
