import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.js'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: false,
  outDir: '.',
  cjsInterop: true,
  shims: true,
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
