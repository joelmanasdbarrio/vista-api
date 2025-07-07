import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

import authRouter from './modules/auth/auth.router'
import accountRouter from './modules/accounts/account.router'
import activityRouter from './modules/activites/activity.router'
import activityCategoryRouter from './modules/activites/activityCategories/activityCategory.router'
import establishmentRouter from './modules/establishments/establishment.router'
import establishmentRequestRouter from './modules/establishments/establishmentRequests/establishmentRequest.router'
import notificationRouter from './modules/notifications/notification.router'
import followRequestRouter from './modules/follows/followRequests/followRequest.router'
import globalErrorHandler from './utils/error_handling/middlewares/error.middleware'

const app = new Hono()

app.use(logger())
app.use(prettyJSON({ space: 2 }))

app.route('/api/v1/', authRouter)
app.route('/api/v1/accounts', accountRouter)
app.route('/api/v1/activities', activityRouter)
app.route('/api/v1/activity-categories', activityCategoryRouter)
app.route('/api/v1/establishments', establishmentRouter)
app.route('/api/v1/establishment-requests', establishmentRequestRouter)
app.route('/api/v1/notifications', notificationRouter)
app.route('/api/v1/follow-requests', followRequestRouter)

app.onError(globalErrorHandler)

app.all('*', (c) => {
  return c.json({
    status: 'fail',
    message: `Can't find ${c.req.url} on this server!`
  }, 404)
})

export default app
