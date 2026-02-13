import { describe, it, expect } from 'vitest';
import { createId } from '@/queryUtils/createId';

describe(createId.name, () => {
  it('should create a valid cuid2 id', () => {
    const mw = createId({ ctx: {} });
    expect(mw.createId).toBeInstanceOf(Function);
    expect(mw.init).toBeInstanceOf(Function);
  });
});
