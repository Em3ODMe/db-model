import { HTTPException } from 'hono/http-exception';
import type { ClientErrorStatusCode } from 'hono/utils/http-status';

/**
 * Middleware factory that adds a `drop` function to the context.
 * This function allows procedures to throw controlled HTTP errors with specific messages.
 * @template Messages - A map of error keys to their corresponding message strings.
 * @param dropMessages - An object mapping error keys to messages.
 * @returns A middleware function that injects the `drop` helper into the context.
 */
export const dropQuery =
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
