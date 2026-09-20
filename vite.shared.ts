import path from 'node:path';

export const aliases = {
  api: path.resolve(import.meta.dirname, './src/api'),
  components: path.resolve(import.meta.dirname, './src/components'),
  constants: path.resolve(import.meta.dirname, './src/constants'),
  context: path.resolve(import.meta.dirname, './src/context'),
  hooks: path.resolve(import.meta.dirname, './src/hooks'),
  test: path.resolve(import.meta.dirname, './src/test'),
  types: path.resolve(import.meta.dirname, './src/types'),
  utils: path.resolve(import.meta.dirname, './src/utils'),
};
