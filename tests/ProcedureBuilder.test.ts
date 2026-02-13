import { describe, it, expect } from 'vitest';
import z from 'zod';
import { initProcedure } from '@/utils';

describe(initProcedure.name, () => {
  it('throws when no schema is provided', async () => {
    const qb = initProcedure().query(async ({ input }) => {
      return input;
    });

    await expect(qb({})('hello')).rejects.toThrowError(
      'No schema provided for query'
    );
  });
  it('executes validated input path when schema is provided', async () => {
    const qb = initProcedure()
      .input(z.string())
      .query(async ({ input }) => {
        return input;
      });

    const result = await qb({})('hello');
    expect(result).toBe('hello');
  });
});
