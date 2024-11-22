import antfu from '@antfu/eslint-config';

export default antfu(
  {
    ignores: ['*.d.ts'],
  },
  {
    rules: {
      'style/semi': ['error', 'always'],
    },
  },
);
