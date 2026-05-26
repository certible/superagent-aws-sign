import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.js'],
  format: ['cjs', 'esm'],
  outDir: '.',
  clean: false,
  dts: true,
  target: 'node22',
  cjsDefault: true,
  footer({ format }) {
    if (format === 'cjs') {
      return {
        js: 'module.exports.default = module.exports;',
      };
    }
  },
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.mjs',
    };
  },
});
