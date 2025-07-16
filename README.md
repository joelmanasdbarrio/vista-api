The main heart of the Vista project, it is used by the web frontend and mobile app to interact with the data.
It's a RESTful API built with [Hono](https://hono.dev) that implements the [OpenAPI specification](https://swagger.io/specification/) defined in the [vista-spec](https://github.com/joelmanasdbarrio/vista-spec) project using the package's [TypeScript](https://www.typescriptlang.org/) interfaces for DTOs, response objects, etc.

```txt
npm ci
npm run dev
```

## Supabase

Vista uses multiple [Supabase](https://supabase.com/) services to provide a complete backend solution:

- Supabase Database: PostgreSQL database defined with [Drizzle ORM](https://orm.drizzle.team/) schema and migrations.
- Supabase Auth: User management and authentication with email & password / OAuth providers (Google, X, Facebook, etc.).
- Supabase Realtime: Real-time updates for map and notifications changes.

### Database

Supabase uses PostgreSQL as the database engine. The database schema is defined in `./src/db/schema.ts` using [Drizzle ORM](https://orm.drizzle.team/). Migrations are generated and run using the Drizzle CLI.

Generate migrations based on `./src/db/schema.ts`:

```txt
npm run drizzle:generate
```

Create custom migrations under `./drizzle/_migration_name_`:

```txt
npx drizzle-kit generate --name=_migration_name_ --custom
```

A custom migration `./drizzle/0001_sync-auth-users.sql` has been made to sync the `auth.users` table with the `account` table in the database. This migration ensures that when a user is created, updated or deleted in Supabase Auth, their corresponding account in the `account` table is treated equaly.

To run migrations locally, you will need to set up the `DATABASE_URL` environment variable in a `.env` file. You can use the `.env.example` file as a reference. Run migrations from `./drizzle`:

```txt
npm run drizzle:migrate
```