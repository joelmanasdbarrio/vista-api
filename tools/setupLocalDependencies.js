// setupLocalDependencies.js
// Script to setup local database tables and create a test user for Vista API

import fs from 'fs'
import path from 'path'
import postgres from 'postgres'

// Lightweight .dev.vars loader (no external dependencies)
function loadDotEnv () {
  try {
    const envPath = path.resolve(process.cwd(), '.dev.vars')
    if (!fs.existsSync(envPath)) {
      console.log('.dev.vars not found in project root, skipping .dev.vars load')
      return
    }

    const content = fs.readFileSync(envPath, 'utf8')
    const lines = content.split(/\r?\n/)
    for (const rawLine of lines) {
      const line = rawLine.trim()
      if (!line || line.startsWith('#')) continue
      const equalsIndex = line.indexOf('=')
      if (equalsIndex === -1) continue
      const key = line.slice(0, equalsIndex).trim()
      let val = line.slice(equalsIndex + 1).trim()
      // Remove surrounding quotes if present
      if ((val.startsWith("\'") && val.endsWith("\'")) || (val.startsWith('"') && val.endsWith('"'))) {
        val = val.slice(1, -1)
      }
      if (process.env[key] === undefined) {
        process.env[key] = val
      }
    }
    console.log('Loaded .dev.vars into process.env')
  } catch (err) {
    console.warn('Failed to load .dev.vars file:', err?.message ?? err)
  }
}

// Load .dev.vars before running migrations so DATABASE_URL is available to drizzle
loadDotEnv()

// `supabase start` (run via init-local-dependencies) blocks until all services pass their
// health checks, so Postgres is already ready by the time this script runs.
const sql = postgres(process.env.DATABASE_URL)

// Local Supabase Postgres bundles postgis but doesn't enable it by default
await sql`create extension if not exists postgis with schema public`

// `supabase start`/`supabase db reset` already applies supabase/migrations (the mirrored copy of
// drizzle/) on a fresh database, so schema creation here would collide with Drizzle's own
// migration journal. `drizzle:migrate` is only meant for applying migrations directly to a
// remote database (e.g. production) that isn't managed by the Supabase CLI.

await sql.end()
console.log('Local dependencies setup complete.')
