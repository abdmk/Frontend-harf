import { expect, test } from './fixtures';

test.describe('الحساب', () => {
  test('الإشعارات وقائمة الحساب للمستخدم المجاني', async ({ page }) => {
    await page.goto('/?as=free');
    const bell = page.locator('button[aria-label^="الإشعارات"]');
    await bell.click();
    await page.getByRole('button', { name: 'تعليم الكل كمقروء' }).click();
    await expect(bell).toHaveAttribute('aria-label', 'الإشعارات');
    await page.keyboard.press('Escape');

    await page.locator('button[aria-label^="حساب"]').click();
    await expect(page.getByRole('navigation', { name: 'قائمة الحساب' })).toBeVisible();
    await expect(page.getByText('تريد تنشر أعمالك؟')).toBeVisible();
    await expect(page.locator('a[href="/account/foundry"]')).toHaveCount(0);
  });

  test('لوحة المسبك محميّة على الخادم للحساب المجاني', async ({ page }) => {
    await page.goto('/account/foundry?as=free');
    await expect(page).toHaveURL(/\/account\/subscription$/);
  });

  test('قسم غير معروف يعيد 404', async ({ page }) => {
    const res = await page.goto('/account/nope');
    expect(res?.status()).toBe(404);
  });

  test('الاستوديو: رفع ملف ثم تسجيل الخروج', async ({ page }) => {
    await page.goto('/account/foundry?as=studio');
    await page.getByRole('main').getByRole('button', { name: 'تحميل الملفات' }).click();
    await page.setInputFiles('input[type=file]', [
      { name: 'Zaetoon.zip', mimeType: 'application/zip', buffer: Buffer.alloc(4096) },
    ]);
    await expect(page.getByText('مكتمل')).toBeVisible({ timeout: 8000 });
    await page.keyboard.press('Escape');
    // ننتظر إغلاق النافذة وعودة التركيز قبل فتح القائمة
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.locator('button[aria-label^="حساب"]').click();
    await page.getByRole('dialog').getByRole('button', { name: 'تسجيل خروج' }).click();
    await page.waitForURL('/');
  });
});
