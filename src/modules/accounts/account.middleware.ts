import { AccountDTO } from '../../types/vista-spec.types'
import AppError from '../../utils/error_handling/AppError'
import AccountService from './account.service'
import { Context, Next } from 'hono'

export const accountExists = async (c: Context, next: Next) => {
  const id = c.req.param('id')

  const accountService = new AccountService()

  const account = await accountService.getOneAccount(c, id)

  if (account == null) {
    throw new AppError(404, `Account with ID "${id}" not found`, {
      code: 'ACCOUNT_NOT_FOUND',
      message: `Account with ID "${id}" not found`,
      details: 'Please, check if the desired ID or Username is correctly typed'
    })
  }

  await next()
}

// export const personalAccountRoute = async (c: Context, next: Next) => {
//   const user = c.get('user')
//   if (user.constructor.modelName !== 'PersonalAccount') return c.json({ status: 'fail', message: errorConstants.unauthorized.message }, 403)
//   await next()
// }

// export const enterpriseAccountRoute = async (c: Context, next: Next) => {
//   const user = c.get('user')
//   if (user.constructor.modelName !== 'EnterpriseAccount') return c.json({ status: 'fail', message: errorConstants.unauthorized.message }, 403)
//   await next()
// }
