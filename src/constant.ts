/**
 * A unique symbol used to identify `QueryBuilder` functions at runtime.
 * This prevents accidental execution of arbitrary functions found in the blueprint object.
 * @internal
 */
export const QUERY_MARKER = Symbol('QUERY_BUILDER');
