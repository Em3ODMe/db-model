import { describe, it, expect } from 'vitest';
import { createModelFactory } from '@/createModelFactory';
import { initProcedure } from '@/utils';
import z from 'zod';

describe(createModelFactory.name, () => {
  it('when plain blueprint provided', async () => {
    const modelFactory = createModelFactory({
      name: 'alice',
      age: 30,
    });
    const model = modelFactory({});
    expect(model).toEqual({ name: 'alice', age: 30 });
  });
  it('hydrates nested blueprint path that touches value(ctx)', async () => {
    const qb = initProcedure()
      .input(z.string())
      .query(async ({ input }) => input);
    const blueprint = {
      a: {
        b: qb,
      },
    };
    const modelFactory = createModelFactory(blueprint);
    const model = modelFactory({});
    const res = await model.a.b('x');
    expect(res).toBe('x');
  });
  it('hydrates a simple blueprint and executes a query', async () => {
    const qb = initProcedure()
      .input(z.string())
      .query(async ({ ctx, input }) => {
        // simple echo of ctx and input to validate wiring
        return { ctx, input } as const;
      });

    const blueprint = {
      user: {
        get: qb,
      },
    };

    const modelFactory = createModelFactory(blueprint);
    const rootCtx = { db: { connected: true } };
    const model = modelFactory(rootCtx);

    const res = await model.user.get('alice');

    // ensure we passed the root context and input correctly through the pipeline
    expect(res.ctx).toBe(rootCtx);
    expect(res.input).toBe('alice');
  });
});
