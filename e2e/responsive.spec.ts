import { expect, test } from './fixtures';

const PAGES = [
  '/',
  '/fonts/zaetoon',
  '/account/profile?as=studio',
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

test('لوحة التصفية تفتح من الأسفل على الجوال', async ({ page }) => {
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
