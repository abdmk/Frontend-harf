import { expect, test } from './fixtures';

test.describe('التحميل', () => {
  test('خط مجاني (OFL) يُحمَّل ملفاً حقيقياً من حرف', async ({ page }) => {
    await page.goto('/fonts/cairo');
    const link = page.getByRole('link', { name: /تحميل الخط Cairo/ });
    await expect(link).toHaveAttribute('href', '/downloads/fonts/cairo.zip');
    const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
    expect(download.suggestedFilename()).toBe('cairo.zip');
    const res = await page.request.get('/downloads/fonts/cairo.zip');
    expect(res.ok()).toBe(true);
    expect((await res.body()).subarray(0, 2).toString()).toBe('PK');
  });

  test('الخط المدفوع لا يملك رابط ملف في الصفحة', async ({ page }) => {
    await page.goto('/fonts/lyon-arabic');
    await expect(page.getByRole('heading', { name: 'Lyon Arabic Display' })).toBeVisible();
    await expect(page.locator('a[href*="lyon"][href*="/downloads/"]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /تحميل الخط/ })).toHaveCount(0);
    // لا ملف بهذا المسار أصلاً: الطلب يرجع صفحة التطبيق لا أرشيفاً
    const res = await page.request.get('/downloads/fonts/lyon-arabic.zip');
    expect((await res.body()).subarray(0, 2).toString()).not.toBe('PK');
  });
});
