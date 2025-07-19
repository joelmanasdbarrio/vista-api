import { Context } from "hono"
import { createClient } from "@supabase/supabase-js"
import { drizzle } from "drizzle-orm/postgres-js"

export default abstract class BaseRepository implements Repository {
  protected layer: string = 'Repository'
  protected supabase
  protected drizzle

  constructor(c: Context) {
    this.supabase = createClient(
      c.env.DATABASE_URL,
      c.env.SUPABASE_API_KEY
    )

    this.drizzle = drizzle(c.env.DATABASE_URL)
  }

  abstract getAllPaginated(query: any): Promise<any>
  abstract getAll(query: any): Promise<any>
  abstract getOneById(id: string): Promise<any>
  abstract createOne(data: any): Promise<any>
  abstract updateOneById(id: string, data: any, obj: any): Promise<any>
  abstract deleteOneById(id: string): Promise<void>
}

interface Repository {
  getAllPaginated: (query: any) => Promise<any>
  getAll: (query: any) => Promise<any>
  getOneById: (id: string) => Promise<any>
  createOne: (data: any) => Promise<any>
  updateOneById: (id: string, data: any, obj: any) => Promise<any>
  deleteOneById: (id: string) => Promise<void>
}