import { drizzle } from 'drizzle-orm/postgres-js'

type Database = ReturnType<typeof drizzle>

const databases = new Map<string, Database>()

export default function getDatabase (databaseUrl: string): Database {
  const existingDatabase = databases.get(databaseUrl)
  if (existingDatabase != null) return existingDatabase

  const database = drizzle(databaseUrl)
  databases.set(databaseUrl, database)
  return database
}
