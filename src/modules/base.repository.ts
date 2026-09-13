import { Context } from 'hono'
import getDatabase from 'src/db/client'
import config from 'src/utils/config'

export default abstract class BaseRepository implements Repository {
  protected layer: string = 'Repository'
  // protected supabase
  protected drizzle: ReturnType<typeof getDatabase>
  protected c: Context

  constructor (c: Context) {
    this.c = c
    // this.supabase = createClient(
    //   config.get(c, 'DATABASE_URL'),
    //   config.get(c, 'SUPABASE_API_KEY')
    // )

    this.drizzle = getDatabase(config.get(c, 'DATABASE_URL'))
  }

  abstract getAllPaginated (query: any): Promise<any>
  abstract getAll (query: any): Promise<any>
  abstract getOneById (id: string): Promise<any>
  abstract createOne (data: any): Promise<any>
  abstract updateOneById (id: string, data: any): Promise<any>
  abstract deleteOneById (id: string): Promise<void>
}

interface Repository {
  getAllPaginated: (query: any) => Promise<any>
  getAll: (query: any) => Promise<any>
  getOneById: (id: string) => Promise<any>
  createOne: (data: any) => Promise<any>
  updateOneById: (id: string, data: any) => Promise<any>
  deleteOneById: (id: string) => Promise<void>
}
