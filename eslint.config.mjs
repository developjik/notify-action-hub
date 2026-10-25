// ESLint flat config
//
// 대상: notify-on-*/index.js, notify-on-*/lib.js, common/, tests/
// 소스는 전부 CommonJS, 테스트만 ESM(import)으로 작성한다.
// dist/는 ncc 생성물이므로 검사하지 않는다.
import js from '@eslint/js';

export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/dist-check/**', 'site/**'],
  },
  js.configs.recommended,
  {
    files: ['notify-on-*/index.js', 'notify-on-*/lib.js', 'common/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
      },
    },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
      },
    },
  },
];
