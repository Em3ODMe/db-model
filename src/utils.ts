import z, { ZodAny } from 'zod';
import { QUERY_MARKER } from './constant';
import { QueryBuilder } from './types';
import { ProcedureBuilder } from './ProcedureBuilder';
import { HTTPException } from 'hono/http-exception';

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
  input: unknown
) => {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    throw new HTTPException(400, {
      message: 'input-not-valid',
    });
  }

  return parsed.data;
};
