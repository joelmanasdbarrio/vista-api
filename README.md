The main heart of the Vista project, it is used by the web frontend and mobile app to interact with the data.
It's a RESTful API built with [Hono](https://hono.dev) deployed on serverless edge servers from Cloudflare Workers, that implements the [OpenAPI specification](https://swagger.io/specification/) defined in the [vista-spec](https://github.com/joelmanasdbarrio/vista-spec) project generating [TypeScript](https://www.typescriptlang.org/) interfaces for DTOs, and response objects, as well asquery, path and body parameters, based on the specification's schema.

```bash
npm ci
npm run dev
```

## Vista Spec

The `@joelmanasdbarrio/vista-spec` project is included as a dev-dependency in the `package.json` file. It allows to generate the TypeScript interfaces from the OpenAPI specification defined in @joelmanasdbarrio/vista-spec/openapi/openapi-rest.yaml using:

```bash
npm run types:generate
```

This command will execute `openapi-typescript` to create the `./src/types/schema/vista-spec.schema.ts` file with all the interfaces and types needed to work with the API.
Once you execute the command, note that `openapi-typescript` package has an error by default where the discriminator is duplicated in the generated schema with 2 different values, which may cause errors in the source code. In that case, you will need to manually rename the duplicated discriminator from the generated file to just 'type'. As a general rule, always rename the property with the shortest value, for example:

```diff
- accountType: 'personal'
- accountType: 'AccountPersonalDTO'
+ type: 'personal'
+ accountType: 'AccountPersonalDTO'
```

Then, `vista-spec.types.ts` will export ready-to-use interfaces from the `schema/vista-spec.schema.ts`

## Supabase

Vista uses multiple [Supabase](https://supabase.com/) services to provide a complete backend solution:

- Supabase Database: PostgreSQL database defined with [Drizzle ORM](https://orm.drizzle.team/) schema and migrations.
- Supabase Auth: User management and authentication with email & password / OAuth providers (Google, X, Facebook, etc.).
- Supabase Realtime: Real-time updates for map and notifications changes.

### Database

Supabase uses PostgreSQL as the database engine. The database schema is defined in `./src/db/schema.ts` using [Drizzle ORM](https://orm.drizzle.team/). Migrations are generated and run using the Drizzle CLI.

Generate migrations based on `./src/db/schema.ts`:

```bash
npm run drizzle:generate
```

Create custom migrations under `./drizzle/_migration_name_`:

```bash
npx drizzle-kit generate --name=_migration_name_ --custom
```

A custom migration `./drizzle/0001_sync-auth-users.sql` has been made to sync the `auth.users` table with the `account` table in the database. This migration ensures that when a user is created, updated or deleted in Supabase Auth, their corresponding account in the `account` table is treated equaly.

To run migrations locally, you will need to set up the `DATABASE_URL` environment variable in a `.env` file. You can use the `.env.example` file as a reference. Run migrations from `./drizzle`:

```bash
npm run drizzle:migrate
```