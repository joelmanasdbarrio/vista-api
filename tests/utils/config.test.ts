import { NODE_ENV } from 'src/types/hono.types'
import config from 'src/utils/config'

describe('config', () => {
  test('reads values from Cloudflare bindings', () => {
    const context = {
      env: {
        NODE_ENV: NODE_ENV.DEVELOPMENT,
        DATABASE_URL: 'postgres://localhost/vista',
        SUPABASE_JWT_SECRET: 'jwt-secret',
        SUPABASE_API_KEY: 'api-key'
      }
    } as any

    expect(config.get(context, 'NODE_ENV')).toBe(NODE_ENV.DEVELOPMENT)
    expect(config.get(context, 'DATABASE_URL')).toBe('postgres://localhost/vista')
  })

  test('throws when a binding is missing', () => {
    const context = { env: {} } as any

    expect(() => config.get(context, 'SUPABASE_JWT_SECRET')).toThrow('Missing environment variable: SUPABASE_JWT_SECRET')
  })
})
