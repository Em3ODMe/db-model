import { describe, it, expect } from 'vitest';
import { withCursor } from '@/queryUtils/withCursor';

describe(withCursor.name, () => {
  it('should return cursor when page is full (asc)', () => {
    const entries = Array.from({ length: 5 }, (_, i) => ({ id: i }));
    const result = withCursor(entries, 'id', 5);
    expect(result.cursor).toBe(4);
  });

  it('should return null when page is not full (asc)', () => {
    const entries = Array.from({ length: 3 }, (_, i) => ({ id: i }));
    const result = withCursor(entries, 'id', 5);
    expect(result.cursor).toBeNull();
  });

  it('should return cursor when page is full (desc)', () => {
    const entries = Array.from({ length: 5 }, (_, i) => ({ id: i })).reverse();
    const result = withCursor(entries, 'id', 5, 'desc');
    expect(result.cursor).toBe(0);
  });

  it('should return null when page is not full (desc)', () => {
    const entries = Array.from({ length: 3 }, (_, i) => ({ id: i })).reverse();
    const result = withCursor(entries, 'id', 5, 'desc');
    expect(result.cursor).toBeNull();
  });
});
