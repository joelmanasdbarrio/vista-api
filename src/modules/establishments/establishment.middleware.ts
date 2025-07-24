import { Context, Next } from 'hono'
import '../../types/hono.types'

export const establishmentExists = async (c: Context, next: Next) => {
  const id = c.req.param('id')

  // TODO: Fix missing establishment service import
  // const { establishment } = await getOneEstablishment(id)
  // if (!establishment) return c.json({ status: 'fail', message: 'Establishment not found' }, 404)
  // c.set('establishment', establishment)

  await next()
}
