import z, { ZodAny } from 'zod';
import { QUERY_MARKER } from './constant';
import { QueryBuilder } from './types';
import { ProcedureBuilder } from './ProcedureBuilder';
import { Logger } from 'hierarchical-area-logger';
import { HTTPException } from 'hono/http-exception';
import type { ClientErrorStatusCode } from 'hono/utils/http-status';

/**
 * Type guard to check if a value is a valid `QueryBuilder`.
 * Used internally by the repository factory during hydration.
 * @param value - The value to check.
 * @returns True if the value is a QueryBuilder function.
 */
export function isQueryBuilder<TContext>(
  value: unknown
): value is QueryBuilder<TContext, unknown, unknown> {
  return (
    typeof value === 'function' &&
    QUERY_MARKER in value &&
    (value as { [QUERY_MARKER]: boolean })[QUERY_MARKER] === true
  );
}

/**
 * Type guard to check if a value is a plain JavaScript object.
 * Used to determine if recursion is needed during repository hydration.
 * Excludes null, Arrays, and Dates.
 * @param value - The value to check.
 * @returns True if the value is a plain object.
 */
export function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

/**
 * Initialize a new procedure builder.
 * @template TRootContext - The initial Context type provided by the application (e.g., Raw Request Context).
 * @returns A new ProcedureBuilder instance.
 */
export function initProcedure<TRootContext>() {
  // Initial state: Root = Current, Input = unknown
  return new ProcedureBuilder<TRootContext, TRootContext, ZodAny>();
}

export const parseSchema = <TInput extends z.ZodType>(
  schema: TInput,
  input: unknown,
  logger?: ReturnType<Logger['getArea']>
) => {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    logger?.error('Input not valid', {
      error: z.prettifyError(parsed.error),
    });
    throw new HTTPException(400, {
      message: 'input-not-valid',
    });
  }

  return parsed.data;
};

/**
 * Middleware factory that adds a `drop` function to the context.
 * This function allows procedures to throw controlled HTTP errors with specific messages.
 * @template Messages - A map of error keys to their corresponding message strings.
 * @param dropMessages - An object mapping error keys to messages.
 * @returns A middleware function that injects the `drop` helper into the context.
 */
export const dropQueryMiddleware =
  <Messages extends Record<string, string>>(dropMessages: Messages) =>
  <TContext>({ ctx }: { ctx: TContext }) => {
    const drop = <Key extends keyof Messages>(
      message: Key,
      code?: ClientErrorStatusCode
    ) => {
      throw new HTTPException(code ?? 400, {
        message: dropMessages[message],
      });
    };

    return { ...ctx, drop };
  };
