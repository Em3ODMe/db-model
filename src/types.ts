import { QUERY_MARKER } from './constant';

/**
 * Represents a compiled query function that is waiting for a Context to be injected.
 * @template TContext - The type of the context object (e.g., DB connection, User session) this query requires.
 * @template TInput - The Zod-inferred type of the input arguments.
 * @template TOutput - The return type of the query handler.
 */
export type QueryBuilder<TContext, TInput, TOutput> = {
  /**
   * Accepts the Context and returns the executable function.
   * @param ctx - The dependency injection context.
   */
  (ctx: TContext): (input: TInput) => Promise<TOutput>;
  /**
   * Internal marker to verify this function was created by the library.
   * @internal
   */
  [QUERY_MARKER]: true;
};

/**
 * A recursive type that transforms a Blueprint definition into a usable API client.
 * - Converts `QueryBuilder<Context, Input, Output>` -> `(input: Input) => Promise<Output>`
 * - Recursively traverses nested objects.
 * - Passes through primitives (like string constants) unchanged.
 */
export type HydratedModel<TBlueprint, TContext> = {
  [K in keyof TBlueprint]: TBlueprint[K] extends QueryBuilder<
    TContext,
    infer I,
    infer O
  >
    ? (input: I) => Promise<O>
    : TBlueprint[K] extends object
      ? HydratedModel<TBlueprint[K], TContext>
      : TBlueprint[K];
};

/**
 * A generic function type for internal middleware storage.
 * Uses `unknown` to allow storage of diverse middleware chains in the same array.
 */
export type ProcedureMiddleware = (params: {
  ctx: unknown;
  input: unknown;
}) => Promise<unknown> | unknown;
