import { readdirSync } from 'node:fs';

import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/** كل feature لا يستورد من feature آخر — التركيب يحدث في src/app فقط (Bulletproof React) */
const FEATURES = readdirSync(new URL('./src/features', import.meta.url), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      'import/no-restricted-paths': [
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
      'import/no-cycle': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      'react/no-danger': 'error',
    },
  },
  {
    // السكربت الوحيد المضمَّن: نصّ ثابت لتطبيق الوضع قبل الرسم (بـnonce)
    files: ['src/components/shared/theme-script.tsx'],
    rules: { 'react/no-danger': 'off' },
  },
  {
    // «use» في fixtures الخاصة بـPlaywright ليست React hook
    files: ['e2e/**'],
    rules: { 'react-hooks/rules-of-hooks': 'off' },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'src/components/ui/icons/icons.generated.ts',
    // مراجع التصميم والنماذج القديمة — ليست جزءاً من الشيفرة
    'reference/**',
    'drafts/**',
    'tools/**',
    '*.html',
  ]),
]);

export default eslintConfig;
