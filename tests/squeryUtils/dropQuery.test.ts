import { describe, it, expect } from 'vitest';
import z from 'zod';
import { dropQuery } from '@/queryUtils/dropQuery';
import { initProcedure } from '@/utils';
import { createModelFactory } from '@/createModelFactory';

describe(dropQuery.name, () => {
  it('exposes a drop function on context and it throws on call', () => {
    const mw = dropQuery({ notFound: 'not found' });
    const ctxWithDrop = mw({ ctx: {} });
    const { drop } = ctxWithDrop;
    expect(() => drop('notFound')).toThrow();
  });
  it('provides a drop function on context that throws HTTPException when invoked', async () => {
    const qb = initProcedure()
      .use(dropQuery({ notFound: 'not found' }))
      .input(z.string())
      .query(async ({ ctx }) => {
        // invoke drop to simulate an error path
        ctx.drop('notFound');
        return { ok: true };
      });

    const modelFactory = createModelFactory({ item: qb });
    const model = modelFactory({});

    await expect(model.item('hello')).rejects.toBeInstanceOf(Error);
  });
});
