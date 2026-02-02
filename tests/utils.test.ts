import { describe, it, expect } from 'vitest';
import z from 'zod';
import {
  dropQueryMiddleware,
  initProcedure,
  isPlainObject,
  isQueryBuilder,
  parseSchema,
} from '../src/utils';
import { QUERY_MARKER } from '../src/constant';
import { createModelFactory } from '../src/createModelFactory';

describe(isPlainObject.name, () => {
  it('isPlainObject differentiates objects from other types', () => {
    expect(isPlainObject({ a: 1 })).toBe(true);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(new Date())).toBe(false);
  });
});

describe(isQueryBuilder.name, () => {
  it('isQueryBuilder detects query builders by marker', () => {
    const fake = function () {
      /* empty */
    };
    (fake as unknown as { [QUERY_MARKER]: boolean })[QUERY_MARKER] = true;
    expect(isQueryBuilder(fake)).toBe(true);

    const notQB = function () {
      /* empty */
    };
    expect(isQueryBuilder(notQB)).toBe(false);
  });
});

describe(parseSchema.name, () => {
  it('parseSchema validates input and throws on invalid input', () => {
    const schema = z.string().min(1);
    expect(parseSchema(schema, 'hello')).toBe('hello');
    expect(() => parseSchema(schema, '')).toThrow('input-not-valid');
  });
});

describe(dropQueryMiddleware.name, () => {
  it('exposes a drop function on context and it throws on call', () => {
    const mw = dropQueryMiddleware({ notFound: 'not found' });
    const ctxWithDrop = mw({ ctx: {} });
    const { drop } = ctxWithDrop;
    expect(() => drop('notFound')).toThrow();
  });
  it('provides a drop function on context that throws HTTPException when invoked', async () => {
    const qb = initProcedure()
      .use(dropQueryMiddleware({ notFound: 'not found' }))
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
