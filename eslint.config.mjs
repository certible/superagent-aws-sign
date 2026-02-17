import antfu from '@antfu/eslint-config';

export default antfu(
  {
    ignores: ['*.d.ts', '*.d.cts', 'index.cjs', 'index.mjs'],
  },
  {
    rules: {
      'style/semi': ['error', 'always'],
    },
  },
);
