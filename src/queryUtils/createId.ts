import {
  createId as createCuid2Id,
  init as initCuid2,
} from '@paralleldrive/cuid2';

/**
 * Middleware factory that adds a `createId` and `init` function to the context.
 * This function allows procedures to create CUID2 IDs and initialize CUID2.
 * @template TContext - The context type.
 * @param ctx - The context object.
 * @returns A middleware function that injects the `createId` and `init` helpers into the context.
 */
export const createId = <TContext>({ ctx }: { ctx: TContext }) => {
  return { ...ctx, createId: createCuid2Id, init: initCuid2 };
};
