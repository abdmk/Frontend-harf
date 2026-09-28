import { expect, resultCount, test } from './fixtures';

test.describe('المكتبة', () => {
  test('التصنيف والبحث ومسح الكل تحفظ الحالة في الرابط', async ({ page }) => {
    await page.goto('/');
    expect(await resultCount(page)).toBe(12);

    await page.locator('#cat-chips').getByRole('button', { name: 'حديثة' }).click();
    await page.waitForURL(/cat=modern/);
    await expect.poll(() => resultCount(page)).toBe(3);

    await page.locator('#cat-chips').getByRole('button', { name: 'الكل' }).click();
    await page.getByRole('searchbox').fill('zaet');
    await page.waitForURL(/q=zaet/);
    await expect.poll(() => resultCount(page)).toBe(1);

    await page.getByRole('button', { name: 'مسح الكل' }).first().click();
    await page.waitForURL((u) => !u.search);
    await expect.poll(() => resultCount(page)).toBe(12);
  });

  test('إخفاء شرائح التصنيف يجعلها غير قابلة للتركيز', async ({ page }) => {
    await page.goto('/');
    await page.locator('button[aria-controls="cat-chips"]').click();
    await expect.poll(() => page.locator('#cat-chips').evaluate((e) => (e as HTMLElement).inert)).toBe(true);
  });

  test('الترتيب', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'الأحدث' }).click();
    await page.waitForURL(/sort=newest/);
    await expect(page.locator('article a[dir=ltr]').first()).toHaveText('Kufa Grid');
  });

  test('لوحة التصفية: لوحة المفاتيح، التطبيق، الإزالة، والعودة بالتركيز', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /تصفية/ }).click();
    const sheet = page.getByRole('dialog', { name: 'تصفية' });
    await expect(sheet).toBeVisible();

    await sheet.getByRole('radio', { name: 'تجاري' }).click();
    await sheet.getByRole('button', { name: 'العربية' }).click();
    await sheet.getByRole('button', { name: 'الفارسية' }).click();
    const thumb = sheet.getByRole('slider', { name: 'أقلّ عدد أوزان' });
    await thumb.focus();
    for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
    await expect(thumb).toHaveAttribute('aria-valuetext', '5 أوزان');

    await sheet.getByRole('button', { name: 'تطبيق' }).click();
    await page.waitForURL(/license=commercial/);
    await expect.poll(() => resultCount(page)).toBe(5);
    const params = new URL(page.url()).searchParams;
    expect(params.get('lang')).toBe('ar,fa');
    expect(params.get('weights')).toBe('5-10');

    await page.locator('button[aria-label^="إزالة ف"]').click();
    await expect.poll(() => new URL(page.url()).searchParams.get('lang') ?? '').not.toContain('fa');

    const trigger = page.getByRole('button', { name: /تصفية/ });
    await trigger.click();
    await expect(sheet).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  });

  test('المفضّلة والوضع الليلي يبقيان بعد إعادة التحميل', async ({ page }) => {
    await page.goto('/');
    const fav = page.locator('article button[aria-pressed]').first();
    await fav.click();
    await expect(fav).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'الوضع الليلي' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.locator('article button[aria-pressed="true"]')).toHaveCount(1);
  });
});
