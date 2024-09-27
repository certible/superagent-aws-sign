import globals from "globals";
import pluginJs from "@eslint/js";
import jest from "eslint-plugin-jest";
import stylisticJs from '@stylistic/eslint-plugin-js'

export default [
 {
    files: ['test/**'],
    ...jest.configs['flat/recommended'],
    rules: {
      ...jest.configs['flat/recommended'].rules,
      'jest/prefer-expect-assertions': 'off',
    },
  },
  {
    files: ["**/*.js"], 
    languageOptions: {sourceType: "commonjs"},
  },
  {
    languageOptions: { globals: globals.node },
    plugins: {
      '@stylistic/js': stylisticJs
    }
  },
  pluginJs.configs.recommended,
  stylisticJs.configs['recommended-flat'],
];