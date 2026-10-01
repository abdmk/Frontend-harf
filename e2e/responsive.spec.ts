import { expect, test } from './fixtures';

const PAGES = [
  '/',
  '/fonts/zaetoon',
  '/account/profile?as=studio',
  '/notifications?as=studio',
  '/design-system',
  '/cart',
  '/checkout',
  '/fonts/naskh?license=1',
  '/login',
  '/register',
  '/account?as=free',
  '/account/subscription?as=studio',
  '/account/purchases',
  '/account/security',
  '/studio?as=studio',
  '/studio/fonts?as=studio',
  '/studio/analytics?as=studio',
  '/studio/finance?as=studio',
  '/studio/finance/payouts?as=studio',
  '/studio/profile?as=studio',
  '/studio/publish',
  '/foundries/tajarib',
  '/admin?as=admin',
  '/admin/review?as=admin',
  '/admin/review/REV-4830?as=admin',
  '/admin/fonts?as=admin',
  '/admin/fonts/cairo?as=admin',
  '/admin/content?as=admin',
  '/admin/users?as=admin',
  '/blog/kufi-from-stone-to-screen',
  '/admin/analytics?as=admin',
  '/tools/reverse-text',
  '/tools/nasaq',
  '/tools/font-matching',
  '/tools/font-lab?font=cairo',
  '/manuscripts',
  '/?license=paid',
  '/about',
  '/services',
  '/help',
  '/terms',
  '/privacy',
  '/blog',
  '/designers/aj',
  '/studio/finance/sales?as=studio',
  '/account/preferences?as=free',
  '/account/usage?as=free',
  '/account/library?as=free',
  '/account/favorites?as=free',
  '/does-not-exist',
];

for (const path of PAGES) {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`لا تمرير أفقي: ${path} (${colorScheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(path, { waitUntil: 'networkidle' });
      const [scroll, width] = await page.evaluate(() => [
        document.documentElement.scrollWidth,
        document.documentElement.clientWidth,
      ]);
      expect(scroll).toBeLessThanOrEqual(width);
    });
  }
}

test('لوحة التصفية تفتح من الأسفل على الجوال', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'على التابلت والحاسوب تُفتح في الوسط');
  await page.goto('/');
  await page.getByRole('button', { name: /تصفية/ }).click();
  const sheet = page.getByRole('dialog', { name: 'تصفية' });
  const vh = page.viewportSize()?.height ?? 0;
  // ننتظر انتهاء حركة الانزلاق ثم نتحقّق أنّ الورقة ملتصقة بأسفل الشاشة
  await expect
    .poll(async () => {
      const box = await sheet.boundingBox();
      return box ? Math.round(box.y + box.height) : -1;
    })
    .toBe(vh);
});
