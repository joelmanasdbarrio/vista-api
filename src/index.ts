import { Hono } from 'hono'
import { contextStorage } from 'hono/context-storage'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import './types/hono.types'

import AccountRouter from './modules/accounts/account.router'
import ActivityRouter from './modules/activites/activity.router'
import AuthRouter from './modules/auth/auth.router'
import EstablishmentRouter from './modules/establishments/establishment.router'
import globalErrorHandler from './utils/error_handling/middlewares/error.middleware'

const app = new Hono()

app.use(logger())
app.use(prettyJSON({ space: 2 }))
app.use(contextStorage())

app.route('/api/v1/', new AuthRouter().router)
app.route('/api/v1/accounts', new AccountRouter().router)
app.route('/api/v1/activities', new ActivityRouter().router)
app.route('/api/v1/establishments', new EstablishmentRouter().router)
// app.route('/api/v1/notifications', notificationRouter)
// app.route('/api/v1/follow-requests', followRequestRouter)

app.onError(globalErrorHandler)

app.all('*', (c) => {
  return c.json({
    status: 'error',
    statusCode: 404,
    error: {
      code: 'NOT_FOUND',
      message: `Can't find ${c.req.url} on this server!`
    }
  }, 404)
})

export default app
