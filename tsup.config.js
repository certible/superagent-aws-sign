import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.js'],
  format: ['cjs', 'esm'],
  outDir: '.',
  esbuildOptions(options, context) {
    if (context.format === 'cjs') {
      options.footer = {
        js: 'module.exports = module.exports.default || module.exports;',
      };
    }
  },
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.mjs',
    };
  },
});
