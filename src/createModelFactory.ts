import type { HydratedModel } from './types';
import { isPlainObject, isQueryBuilder } from './utils';

/**
 * Creates a Model Factory based on your API Blueprint.
 * @template TBlueprint - The structure of your API (nested objects containing QueryBuilders).
 * @param blueprint - The static object defining your API structure.
 * @returns A function `createModel(ctx)` that takes your Context and returns the fully typed API.
 * @example
 * const modelFactory = createModelFactory({
 *   users: { get: userGetQuery }
 * });
 * const DB = modelFactory({ db: myDb });
 */
export function createModelFactory<TBlueprint extends Record<string, unknown>>(
  blueprint: TBlueprint
) {
  /**
   * The actual factory function used at runtime per-request.
   * @param ctx - The dependency injection context (must match TRootContext of your builders).
   */
  return function createModel<TContext>(
    ctx: TContext
  ): HydratedModel<TBlueprint, TContext> {
    // Recursive function to walk the blueprint tree and inject context.
    const hydrate = (structure: Record<string, unknown>): unknown => {
      const result: Record<string, unknown> = {};

      for (const key in structure) {
        const value = structure[key];

        if (isQueryBuilder(value)) {
          // Safe execution via Type Guard
          // value is strictly QueryBuilder<unknown, unknown, unknown>
          result[key] = value(ctx);
          // Note: We perform one specific cast here because TypeScript
          // cannot correlate the TContext generic of the *specific* builder
          // with the TContext passed to the factory without excessive complexity.
          // However, the *Generics* on the class ensure safety for the user.
        } else if (isPlainObject(value)) {
          result[key] = hydrate(value);
        } else {
          result[key] = value;
        }
      }
      return result;
    };

    return hydrate(blueprint) as HydratedModel<TBlueprint, TContext>;
  };
}
