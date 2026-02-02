const getCursor = <T extends Record<string, unknown | number>>(
  entries: Array<T>,
  parameter: keyof T,
  pageSize: number
) =>
  entries.length && pageSize === entries.length
    ? (entries[entries.length - 1][parameter] as number)
    : null;

export const withCursor = <T extends Record<string, unknown | number>>(
  entries: Array<T>,
  parameter: keyof T,
  pageSize: number,
  orderedBy: 'asc' | 'desc' = 'asc'
) => {
  const cursor = getCursor<T>(entries, parameter, pageSize);

  return {
    entries: orderedBy === 'asc' ? entries : entries.reverse(),
    cursor,
  };
};
