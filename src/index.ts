import { Hono } from 'hono'
import { Variables } from 'hono/types'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { contextStorage } from 'hono/context-storage'

import AccountRouter from './modules/accounts/account.router'
import ActivityRouter from './modules/activites/activity.router'
import ActivityCategoryRouter from './modules/activites/activityCategories/activityCategory.router'
import EstablishmentRouter from './modules/establishments/establishment.router'
import EstablishmentRequestRouter from './modules/establishments/establishmentRequests/establishmentRequest.router'
import NotificationRouter from './modules/notifications/notification.router'
import FollowRequestRouter from './modules/follows/followRequests/followRequest.router'
import globalErrorHandler from './utils/error_handling/middlewares/error.middleware'

const app = new Hono()

app.use(logger())
app.use(prettyJSON({ space: 2 }))
app.use(contextStorage())

app.route('/api/v1/accounts', new AccountRouter().router)
// app.route('/api/v1/activities', activityRouter)
app.route('/api/v1/activities/categories', new ActivityCategoryRouter().router)
// app.route('/api/v1/establishments', establishmentRouter)
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
