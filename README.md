# db-model

A type-safe database agnostic model factory and procedure builder for constructing per-request, strongly-typed surfaces from a static blueprint.

This project provides:

- A blueprint-driven model factory that hydrates a nested API surface per-request.
- A fluent ProcedureBuilder for input validation, middleware composition, and final query handlers.
- Lightweight utilities for safe object checks, schema parsing, and error dropping.
- A helper for cursor-based pagination.

## Installation

- npm install model-blueprint
- yarn add model-blueprint
- pnpm add model-blueprint

## Quick Start

```typescript
// 1. Setup
import { createModelFactory, initProcedure } from "model-blueprint";
import { dropQuery } from "model-blueprint/dropQuery";
import { createId } from "model-blueprint/createId";
import { withCursor } from "model-blueprint/withCursor";

type Context = {
  db: DBDriver,
  authHeader: string
}

const dropMessages = {
  notAuthenticated: 'not authenticated',
  notFound: 'not found'
}

const proc = initProcedure<Context>()
  .use(dropQuery(dropMessages)) // populates ctx with drop function which throws HTTPException

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
