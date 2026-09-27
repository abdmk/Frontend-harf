import { expect, test } from './fixtures';

test.describe('صفحة الخط', () => {
  test('المعرض، المختبر، والتبويبات', async ({ page }) => {
    await page.goto('/fonts/zaetoon');
    await expect(page).toHaveTitle(/^Zaetoon Typeface/);

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

    await page.getByRole('tab', { name: 'محتويات الحزمة' }).click();
    await expect(page.getByText('License.pdf')).toBeVisible();
  });

  test('خط غير موجود يعيد 404', async ({ page }) => {
    const res = await page.goto('/fonts/does-not-exist');
    expect(res?.status()).toBe(404);
  });
});
