import { expect, test } from './fixtures';

test.describe('صفحة الخط', () => {
  test('المعرض والمختبر بالخط نفسه', async ({ page }) => {
    await page.goto('/fonts/cairo');
    await expect(page).toHaveTitle(/^Cairo/);

    const thumb = page.getByRole('button', { name: 'الصورة 3' });
    await thumb.click();
    await expect(thumb).toHaveAttribute('aria-current', 'true');
    await page.getByRole('button', { name: 'ملء الشاشة' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');

    const box = page.getByRole('textbox');
    await page.getByRole('button', { name: 'عنوان' }).click();
    await expect(box).toHaveText('حرف يصنع الهوية');
    await page.getByRole('button', { name: 'وسط', exact: true }).click();
    await expect(box).toHaveCSS('text-align', 'center');
  });

  test('خط بلا ملفات معاينة: إشارة صريحة بدل معرض فارغ، ولا تجربة بخط الموقع', async ({ page }) => {
    await page.goto('/fonts/zaetoon');
    await expect(page).toHaveTitle(/^Zaetoon Typeface/);
    await expect(page.getByText('المعاينة غير متاحة بعد')).toBeVisible();
    await expect(page.getByRole('button', { name: 'الصورة 1' })).toHaveCount(0);
    await expect(page.getByRole('textbox')).toHaveCount(0);

    await page.getByRole('tab', { name: 'محتويات الحزمة' }).click();
    await expect(page.getByText('License.pdf')).toBeVisible();
  });

  // ⚠️ يتطلّب خادماً حقيقياً: ملف ثابت (SPA) يعيد 200 دائماً لأي مسار غير معروف للمتصفّح؛
  // 404 حقيقي على مستوى HTTP يحتاج تحقّقاً من الخادم بمعرفة معرّفات الخطوط الصحيحة.
  test.fixme('خط غير موجود يعيد 404', async ({ page }) => {
    const res = await page.goto('/fonts/does-not-exist');
    expect(res?.status()).toBe(404);
  });
});
