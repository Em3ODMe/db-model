# db-model

A type-safe database agnostic model factory and procedure builder for constructing per-request, strongly-typed surfaces from a static blueprint.

This project provides:

- A blueprint-driven model factory that hydrates a nested API surface per-request.
- A fluent ProcedureBuilder for input validation, middleware composition, and final query handlers.
- Lightweight utilities for safe object checks, schema parsing, and error dropping.
- A helper for cursor-based pagination.

## Installation

- npm install db-model
- yarn add db-model
- pnpm add db-model

## Quick Start

```typescript
// 1. Setup
import { createModelFactory, initProcedure, dropQueryMiddleware, withCursor } from "db-model";

type Context = {
  db: DBDriver,
  authHeader: string
}

const dropMessages = {
  notAuthenticated: 'not authenticated',
  notFound: 'not found'
}

const proc = initProcedure<Context>()
  .use(dropQueryMiddleware(dropMessages)) // populates ctx with drop function which throws HTTPException

const userGetQuery = proc
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    const user = await ctx.db.users.findUnique({ where: { id: input.id } });
    if (!user) throw ctx.drop('notFound', 404);
    return user;
  });

const usersQuery = proc
  .use(async ({ ctx, input }) => { // Auth middleware example
    if (!ctx.authHeader) throw ctx.drop('notAuthenticated', 401);
    return { ...ctx, input };
  })
  .input(z.object({ cursor: z.string().optional(), limit: z.number().optional() }))
  .query(async ({ ctx, { cursor, limit } }) => {
    const users = await ctx.db.users.all({ cursor, limit });
    return withCursor(users, 'id', limit); // returns { entries, cursor }
  });

const modelFactory = createModelFactory<Context>({
  users: {
    get: userGetQuery,
    list: usersQuery
  }
});

// 2. Hydrate the model
const model = modelFactory({ db: myDbInstance, authHeader });

// 3. Use model
const user = await model.users.get({ id: 1 });
const { entries, cursor } = await mode.users.list({ limit: 20})
```

What happens here:

- The blueprint is walked recursively.
- When a leaf value is a QueryBuilder, it is invoked with the provided context to produce a concrete API method for that leaf.
- Non-object leaves are copied through; nested objects are hydrated recursively.

## API Reference

This project is organized into a few focused modules. Below is a concise reference for each public API.

### src/utils.ts

- dropQueryMiddleware<Messages extends Record<string, string>>(dropMessages: Messages)
  - Factory that injects a drop helper into the context. Useful for controlled HTTP-errors with localized messages.

### src/queryUtils.ts

- withCursor<T extends Record<string, unknown | number>>(entries: Array<T>, parameter: keyof T, pageSize: number, orderedBy: 'asc' | 'desc' = 'asc')
  - Returns { entries, cursor } where cursor is the last value of the given parameter if the page is full; otherwise null.

### src/ProcedureBuilder.ts

- ProcedureBuilder<TRootContext, TCurrentContext, TInput extends z.ZodType>
  - Fluent builder to:
  - input<TSchema extends z.ZodType>(schema: TSchema): ProcedureBuilder<TRootContext, TCurrentContext, TSchema>
  - use<TNextContext>(middleware: (params: { ctx: TCurrentContext; input: z.infer<TInput> }) => Promise<TNextContext> | TNextContext): ProcedureBuilder<TRootContext, TNextContext, TInput>
  - query<TResult>(handler: (params: { ctx: TCurrentContext; input: z.infer<TInput> }) => Promise<TResult>): QueryBuilder<TRootContext, z.infer<TInput>, TResult>
  - The builder attaches a QUERY_MARKER to the returned function to support runtime type checks.

### src/createModelFactory.ts

- createModelFactory<TBlueprint extends Record<string, unknown>>(blueprint: TBlueprint)
  - Returns a function createModel<TContext>(ctx: TContext): HydratedModel<TBlueprint, TContext>
  - Hydrates the blueprint by walking the tree; leaves that are QueryBuilders are invoked with the provided context.
  - Uses isPlainObject and isQueryBuilder to drive hydration decisions.

## Advanced usage

- Chain middleware with ProcedureBuilder.use to build a pipeline that mutates the context before the final handler runs.
- Compose multiple leaf QueryBuilders within a blueprint to expose a rich, nested API surface hydrated per request.
