import { describe, it, expect } from 'vitest';
import z from 'zod';
import { isPlainObject, isQueryBuilder, parseSchema } from '@/utils';
import { QUERY_MARKER } from '@/constant';

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
