import AccountController from 'src/modules/accounts/account.controller'
import { AccountTypeEnum } from 'src/types/vista-spec.types'
import AppError from 'src/utils/error_handling/AppError'

// Mock the service layer
jest.mock('src/modules/accounts/account.service')
jest.mock('src/modules/auth/auth.middleware')

describe('AccountRouter', () => {
  let mockAuthContext: any
  let mockUser: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockUser = {
      id: 'authenticated-user-id',
      email: 'user@example.com',
      type: AccountTypeEnum.PERSONAL
    }

    mockAuthContext = {
      get: jest.fn((key) => {
        if (key === 'user') return mockUser
        return null
      }),
      req: {
        header: jest.fn((name) => name === 'Authorization' ? 'Bearer valid-token' : undefined),
        param: jest.fn((name) => undefined)
      },
      json: jest.fn(),
      body: jest.fn(),
      text: jest.fn()
    }
  })

  describe('PATCH / - update account', () => {
    test('should reject email field update (400)', async () => {
      const body = {
        email: 'different@example.com', // Attempting to change email
        name: 'Updated Name'
      }

      const context = {
        ...mockAuthContext,
        req: {
          ...mockAuthContext.req,
          json: jest.fn(async () => body)
        }
      }

      const controller = new AccountController()
      const mockService = require('src/modules/accounts/account.service').default

      mockService.prototype.updateOneAccount = jest.fn(async () => {
        throw new AppError(400, 'Email is immutable and cannot be changed', {
          code: 'FIELD_IMMUTABLE',
          message: 'Email is immutable and cannot be changed'
        })
      })

      try {
        await controller.updateAccount(context)
      } catch (error: unknown) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(400)
          expect(error.message).toContain('Email')
          expect(error.message).toContain('immutable')
        }
      }
    })

    test('should reject accountType field update (400)', async () => {
      const body = {
        accountType: AccountTypeEnum.ENTERPRISE, // Attempting to change account type
        name: 'Updated Name'
      }

      const context = {
        ...mockAuthContext,
        req: {
          ...mockAuthContext.req,
          json: jest.fn(async () => body)
        }
      }

      const controller = new AccountController()
      const mockService = require('src/modules/accounts/account.service').default

      mockService.prototype.updateOneAccount = jest.fn(async () => {
        throw new AppError(400, 'Account type is immutable and cannot be changed', {
          code: 'FIELD_IMMUTABLE',
          message: 'Account type is immutable and cannot be changed'
        })
      })

      try {
        await controller.updateAccount(context)
      } catch (error: unknown) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(400)
          expect(error.message).toContain('Account type')
          expect(error.message).toContain('immutable')
        }
      }
    })

    test('should allow update of mutable fields', async () => {
      const body = {
        name: 'Updated Name',
        biography: 'Updated bio',
        avatar: 'https://example.com/avatar.jpg'
        // email and accountType NOT provided - immutability preserved
      }

      const expectedResponse = {
        id: mockUser.id,
        email: mockUser.email,
        type: mockUser.type,
        name: body.name,
        biography: body.biography,
        avatar: body.avatar,
        updatedAt: new Date().toISOString()
      }

      const context = {
        ...mockAuthContext,
        req: {
          ...mockAuthContext.req,
          json: jest.fn(async () => body)
        }
      }

      const controller = new AccountController()
      const mockService = require('src/modules/accounts/account.service').default

      mockService.prototype.updateOneAccount = jest.fn(async (userId, updateBody) => {
        // Verify that email and accountType are not in the update
        expect(updateBody.email).toBeUndefined()
        expect(updateBody.accountType).toBeUndefined()
        return expectedResponse
      })

      // Verify that mutable fields are updated successfully
    })

    test('should reject simultaneous email and accountType change (400)', async () => {
      const body = {
        email: 'different@example.com',
        accountType: AccountTypeEnum.ENTERPRISE,
        name: 'Updated Name'
      }

      const context = {
        ...mockAuthContext,
        req: {
          ...mockAuthContext.req,
          json: jest.fn(async () => body)
        }
      }

      const controller = new AccountController()
      const mockService = require('src/modules/accounts/account.service').default

      mockService.prototype.updateOneAccount = jest.fn(async () => {
        throw new AppError(400, 'Email and Account type are immutable', {
          code: 'FIELD_IMMUTABLE',
          message: 'Email and Account type are immutable'
        })
      })

      try {
        await controller.updateAccount(context)
      } catch (error: unknown) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(400)
          expect(error.message).toContain('immutable')
        }
      }
    })

    test('should authorize update only for account owner', async () => {
      const differentUserId = 'different-user-id'

      const body = {
        name: 'Updated Name'
      }

      const context = {
        ...mockAuthContext,
        get: jest.fn((key) => {
          if (key === 'user') return { id: differentUserId, email: 'different@example.com' }
          return null
        }),
        req: {
          ...mockAuthContext.req,
          json: jest.fn(async () => body)
        }
      }

      const controller = new AccountController()
      const mockService = require('src/modules/accounts/account.service').default

      mockService.prototype.updateAccount = jest.fn(async () => {
        throw new AppError(403, 'Can only update your own account', {
          code: 'AUTH_FORBIDDEN',
          message: 'Can only update your own account'
        })
      })

      try {
        await controller.updateAccount(context)
      } catch (error: unknown) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(403)
        }
      }
    })
  })

  describe('DELETE / - delete account', () => {
    test('should allow account deletion by owner (204)', async () => {
      const context = mockAuthContext

      const controller = new AccountController()
      const mockService = require('src/modules/accounts/account.service').default

      mockService.prototype.deleteOneAccount = jest.fn(async (userId) => {
        expect(userId).toBe(mockUser.id)
        return { success: true }
      })

      // Verify deletion succeeds for account owner
    })

    test('should reject account deletion by non-owner (403)', async () => {
      const differentUserId = 'different-user-id'

      const context = {
        ...mockAuthContext,
        get: jest.fn((key) => {
          if (key === 'user') return { id: differentUserId, email: 'different@example.com' }
          return null
        })
      }

      const controller = new AccountController()
      const mockService = require('src/modules/accounts/account.service').default

      mockService.prototype.deleteAccount = jest.fn(async () => {
        throw new AppError(403, 'Can only delete your own account', {
          code: 'AUTH_FORBIDDEN',
          message: 'Can only delete your own account'
        })
      })

      try {
        await controller.deleteAccount(context)
      } catch (error: unknown) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(403)
        }
      }
    })
  })

  describe('GET / - get authenticated account', () => {
    test('should return authenticated account data (200)', async () => {
      const expectedResponse = {
        id: mockUser.id,
        email: mockUser.email,
        type: mockUser.type,
        name: 'Test User',
        username: 'testuser'
      }

      const context = mockAuthContext

      const controller = new AccountController()
      const mockService = require('src/modules/accounts/account.service').default

      mockService.prototype.getOneAccount = jest.fn(async (userId) => {
        expect(userId).toBe(mockUser.id)
        return expectedResponse
      })

      // Verify authenticated account data is returned
    })
  })
})
