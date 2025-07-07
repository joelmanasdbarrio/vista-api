The main heart of the project, it is used by the web frontend and mobile app to interact with the data.
It's a RESTful API built with [Hono](https://hono.dev) that implements the [OpenAPI specification](https://swagger.io/specification/) defined in the [vista-spec](https://github.com/joelmanasdbarrio/vista-spec) project using the package's [TypeScript](https://www.typescriptlang.org/) interfaces for DTOs, response objects, etc.

```txt
npm ci
npm run dev
```

```txt
npm run deploy
```

## Cloudflare Workers

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```
