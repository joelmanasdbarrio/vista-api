import { Hono } from 'hono'
import { contextStorage } from 'hono/context-storage'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import './types/hono.types'

import AccountRouter from './modules/accounts/account.router'
import ActivityCategoryRouter from './modules/activites/activityCategories/activityCategory.router'
import EstablishmentRouter from './modules/establishments/establishment.router'
import globalErrorHandler from './utils/error_handling/middlewares/error.middleware'

const app = new Hono()

app.use(logger())
app.use(prettyJSON({ space: 2 }))
app.use(contextStorage())

app.route('/api/v1/accounts', new AccountRouter().router)
// app.route('/api/v1/activities', activityRouter)
app.route('/api/v1/activities/categories', new ActivityCategoryRouter().router)
app.route('/api/v1/establishments', new EstablishmentRouter().router)
// app.route('/api/v1/establishment-requests', establishmentRequestRouter)
// app.route('/api/v1/notifications', notificationRouter)
// app.route('/api/v1/follow-requests', followRequestRouter)

app.onError(globalErrorHandler)

app.all('*', (c) => {
  return c.json({
    status: 'error',
    message: `Can't find ${c.req.url} on this server!`
  }, 404)
})

export default app
