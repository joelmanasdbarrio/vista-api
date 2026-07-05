// setupLocalDependencies.js
// Script to setup local database tables and create a test user for Vista API

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// Lightweight .env loader (no external dependencies)
function loadDotEnv () {
  try {
    const envPath = path.resolve(process.cwd(), '.env')
    if (!fs.existsSync(envPath)) {
      console.log('.env not found in project root, skipping .env load')
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
    console.log('Loaded .env into process.env')
  } catch (err) {
    console.warn('Failed to load .env file:', err?.message ?? err)
  }
}

function run(command, options = {}) {
  try {
    console.log(`Running: ${command}`)
    execSync(command, { stdio: 'inherit', ...options })
  } catch (err) {
    console.error(`Error running command: ${command}`)
    process.exit(1)
  }
}

// Load .env before running migrations so DATABASE_URL is available to drizzle
loadDotEnv()

// Wait for PostgreSQL to be ready
console.log('Waiting for PostgreSQL to be ready...')
let retries = 10
let connected = false

while (!connected && retries > 0) {
  try {
    execSync('docker exec vista_postgres pg_isready -U testusr -d vista_db -h localhost', { stdio: 'pipe' })
    connected = true
    console.log('PostgreSQL is ready!')
  } catch (err) {
    retries--
    console.log(`PostgreSQL not ready yet, retrying... (${retries} attempts left)`)
    execSync('sleep 2', { stdio: 'pipe' })
  }
}

if (!connected) {
  console.error('PostgreSQL failed to become ready after waiting')
  process.exit(1)
}

// Step 1: Run Drizzle migrations to create tables
run('npm run drizzle:migrate')

// Step 2: Insert test users into the database
// You can customize these values as needed
const TEST_USERS = [
  {
    name: 'Test User',
    username: 'testuser',
    email: 'testuser@gmail.com',
    biography: 'Test biography',
    gender: 'other',
    birthdate: '2000-01-01T00:00:00Z',
    avatar: '',
    website: '',
    is_private: false,
    is_verified: false,
    type: 'personal'
  },
  {
    name: 'Alice Example',
    username: 'alice',
    email: 'alice@example.com',
    biography: 'Alice personal account',
    gender: 'female',
    birthdate: '1995-05-15T00:00:00Z',
    avatar: '',
    website: '',
    is_private: true,
    is_verified: false,
    type: 'personal'
  },
  {
    name: 'Bob Example',
    username: 'bob',
    email: 'bob@example.com',
    biography: 'Bob personal account',
    gender: 'male',
    birthdate: '1990-09-09T00:00:00Z',
    avatar: '',
    website: '',
    is_private: false,
    is_verified: false,
    type: 'personal'
  },
  {
    name: 'Acme Corp',
    username: 'acmecorp',
    email: 'contact@acmecorp.com',
    biography: 'Acme Corp enterprise account',
    gender: 'other',
    birthdate: '1980-01-01T00:00:00Z',
    avatar: '',
    website: 'https://acmecorp.com',
    is_private: false,
    is_verified: true,
    type: 'enterprise'
  },
  {
    name: 'Beta LLC',
    username: 'betallc',
    email: 'info@betallc.com',
    biography: 'Beta LLC enterprise account',
    gender: 'other',
    birthdate: '1985-06-30T00:00:00Z',
    avatar: '',
    website: 'https://betallc.com',
    is_private: false,
    is_verified: true,
    type: 'enterprise'
  }
]

for (const user of TEST_USERS) {
  const insertUserSQL = `INSERT INTO account (id, name, username, email, biography, gender, birthdate, avatar, website, is_private, is_verified, type, created_at, updated_at) VALUES (gen_random_uuid(), '${user.name}', '${user.username}', '${user.email}', '${user.biography}', '${user.gender}', '${user.birthdate}', '${user.avatar}', '${user.website}', ${user.is_private}, ${user.is_verified}, '${user.type}', NOW(), NOW());`
  run(`docker exec -i vista_postgres psql -U testusr -d vista_db -c "${insertUserSQL}"`)
}

console.log('Local dependencies setup complete.')
