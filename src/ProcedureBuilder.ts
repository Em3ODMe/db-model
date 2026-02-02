import z from 'zod';
import type { ProcedureMiddleware, QueryBuilder } from './types';
import { QUERY_MARKER } from './constant';
import { parseSchema } from './utils';

/**
 * The core builder class for creating type-safe database procedures.
 * Implements a fluent interface to chain validation, middleware, and handlers.
 * @template TRootContext - The initial Context type provided by the application (e.g., Raw Request Context).
 * @template TCurrentContext - The Context type at the current stage of the pipeline (modified by previous middlewares).
 * @template TInput - The validated input type (inferred from Zod).
 */
export class ProcedureBuilder<
  TRootContext,
  TCurrentContext,
  TInput extends z.ZodType,
> {
  private readonly _middlewares: ProcedureMiddleware[];
  private readonly _schema: TInput | undefined;

  constructor(schema?: TInput, middlewares: ProcedureMiddleware[] = []) {
    this._schema = schema;
    this._middlewares = middlewares;
  }
  /**
   * Define input validation.
   * Resets TInput to the inferred Zod type.
   */
  public input<TSchema extends z.ZodType>(schema: TSchema) {
    return new ProcedureBuilder<TRootContext, TCurrentContext, TSchema>(
      schema,
      this._middlewares
    );
  }

  /**
   * Add middleware.
   * Transforms TCurrentContext -> TNextContext.
   */
  public use<TNextContext>(
    middleware: (params: {
      ctx: TCurrentContext;
      input: z.infer<TInput>;
    }) => Promise<TNextContext> | TNextContext
  ) {
    // We cast the middleware to the internal unknown type to store it
    const storedMiddleware: ProcedureMiddleware = async (p) => {
      // Safe casting because the class generics enforce strict usage upstream
      return middleware({
        ctx: p.ctx as TCurrentContext,
        input: p.input as z.infer<TInput>,
      });
    };

    return new ProcedureBuilder<TRootContext, TNextContext, TInput>(
      this._schema,
      [...this._middlewares, storedMiddleware]
    );
  }

  /**
   * Finalize the query.
   * Returns a QueryBuilder that expects TRootContext.
   */
  public query<TResult>(
    handler: (params: {
      ctx: TCurrentContext;
      input: z.infer<TInput>;
    }) => Promise<TResult>
  ): QueryBuilder<TRootContext, z.infer<TInput>, TResult> {
    // The Factory-Compatible Builder
    const builder = (rootCtx: TRootContext) => {
      return async (rawInput: z.infer<TInput>): Promise<TResult> => {
        // A. Validation
        if (!this._schema) {
          throw new Error('No schema provided for query');
        }
        const validatedInput = parseSchema(this._schema, rawInput);

        // B. Middleware Pipeline
        // We start with the Root Context
        let ctxCursor: unknown = rootCtx;

        for (const mw of this._middlewares) {
          ctxCursor = await mw({ ctx: ctxCursor, input: validatedInput });
        }

        // C. Handler
        return handler({
          ctx: ctxCursor as TCurrentContext,
          input: validatedInput,
        });
      };
    };

    // Attach Marker safely
    Object.defineProperty(builder, QUERY_MARKER, {
      value: true,
      writable: false,
      enumerable: false,
      configurable: false,
    });

    return builder as QueryBuilder<TRootContext, z.infer<TInput>, TResult>;
  }
}
