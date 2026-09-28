import { readdirSync } from 'node:fs';

import { defineConfig, globalIgnores } from 'eslint/config';
import importX from 'eslint-plugin-import-x';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

/** كل feature لا يستورد من feature آخر — التركيب يحدث في src/app فقط (Bulletproof React) */
const FEATURES = readdirSync(new URL('./src/features', import.meta.url), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const eslintConfig = defineConfig([
  ...tseslint.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  reactHooks.configs.flat.recommended,
  {
    settings: {
      'import-x/resolver': { typescript: true },
    },
    rules: {
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            ...FEATURES.map((f) => ({
              target: `./src/features/${f}`,
              from: './src/features',
              except: [`./${f}`],
              message: 'لا استيراد بين الـfeatures — ركّبها في src/app.',
            })),
            {
              target: './src/features',
              from: './src/app',
              message: 'الـfeatures لا تعرف طبقة التطبيق.',
            },
            {
              target: [
                './src/components',
                './src/hooks',
                './src/lib',
                './src/types',
                './src/config',
                './src/mocks',
                './src/design-system',
              ],
              from: ['./src/features', './src/app'],
              message: 'الشيفرة المشتركة لا تستورد من الـfeatures أو التطبيق.',
            },
          ],
        },
      ],
      'import-x/no-cycle': 'error',
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
    },
  },
  {
    files: ['e2e/**'],
    rules: {
      /* Playwright's fixture `use` هي معامل الاختبارات، لا React Hook */
      'react-hooks/rules-of-hooks': 'off',
    },
  },
  globalIgnores([
    'dist/**',
    '.next/**',
    'src/components/ui/icons/icons.generated.ts',
    'reference/**',
    'tools/**',
  ]),
]);

export default eslintConfig;
