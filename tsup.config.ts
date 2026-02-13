import { type Options, defineConfig } from 'tsup';

const defaultOptions: Options = {
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  minify: false,
};

export default defineConfig([
  {
    ...defaultOptions,
    entry: ['src/index.ts'],
    outDir: 'dist',
  },
  {
    ...defaultOptions,
    entry: ['src/queryUtils/withCursor.ts'],
    outDir: 'dist/withCursor',
  },
  {
    ...defaultOptions,
    entry: ['src/queryUtils/createId.ts'],
    outDir: 'dist/createId',
  },
  {
    ...defaultOptions,
    entry: ['src/queryUtils/dropQuery.ts'],
    outDir: 'dist/dropQuery',
  },
]);
