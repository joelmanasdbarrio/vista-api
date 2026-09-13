import { loginRateLimit } from 'src/modules/auth/auth.middleware'

jest.mock('src/modules/accounts/account.service', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('loginRateLimit', () => {
  test('allows five requests and rejects the sixth request per IP', async () => {
    const context = {
      req: {
        header: (name: string) => name === 'CF-Connecting-IP' ? 'test-login-ip' : undefined
      }
    } as any
    const next = jest.fn().mockResolvedValue(undefined)

    for (let attempt = 0; attempt < 5; attempt++) {
      await loginRateLimit(context, next)
    }

    await expect(loginRateLimit(context, next)).rejects.toThrow('Too many requests')
    expect(next).toHaveBeenCalledTimes(5)
  })
})
