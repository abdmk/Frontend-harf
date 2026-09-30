import { AxeBuilder } from '@axe-core/playwright';

import { expect, test } from './fixtures';

/**
 * فحص الوصول الآلي (axe — WCAG 2.1 AA) للصفحات الرئيسية في الوضعين الفاتح والداكن.
 * يحرس تباين الألوان وأسماء العناصر من التراجع؛ لا يغني عن التجربة بقارئ شاشة حقيقي.
 */
const ROUTES = [
  '/',
  '/?license=paid',
  '/fonts/cairo',
  '/fonts/naskh',
  '/foundries/tajarib',
  '/manuscripts',
  '/tools/reverse-text',
  '/tools/nasaq',
  '/tools/font-matching',
  '/tools/font-lab',
  '/about',
  '/account?as=free',
  '/account/subscription?as=studio',
  '/account/usage',
  '/studio?as=studio',
  '/studio/fonts?as=studio',
  '/studio/analytics?as=studio',
  '/studio/finance?as=studio',
  '/studio/finance/payouts?as=studio',
  '/studio/profile?as=studio',
  '/design-system',
];

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`الوصول — ${scheme === 'light' ? 'الفاتح' : 'الداكن'}`, () => {
    test.use({ colorScheme: scheme });
    for (const route of ROUTES) {
      test(route, async ({ page }) => {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        const summary = violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`);
        expect(summary).toEqual([]);
      });
    }
  });
}
