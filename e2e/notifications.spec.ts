import { expect, test } from './fixtures';

test.describe('الإشعارات', () => {
  test('القائمة مجمّعة، التعليم كمقروء، والانتقال إلى الصفحة', async ({ page }) => {
    await page.goto('/?as=studio');
    const bell = page.getByRole('button', { name: /^الإشعارات — 2 غير مقروءة$/ });
    await bell.click();
    const menu = page.getByRole('dialog');
    await expect(menu.getByRole('heading', { name: 'اليوم' })).toBeVisible();
    await expect(menu.getByRole('heading', { name: 'هذا الأسبوع' })).toBeVisible();
    await expect(menu.getByText('قبل 20 دقيقة')).toBeVisible();
    await expect(menu.getByRole('heading', { name: 'أقدم' })).toHaveCount(0);

    await menu.getByRole('button', { name: 'تعليم الكل كمقروء' }).click();
    await expect(page.getByRole('button', { name: 'الإشعارات', exact: true })).toBeVisible();

    await menu.getByRole('link', { name: 'عرض كل الإشعارات' }).click();
    await expect(page).toHaveURL(/\/notifications$/);
    await expect(page.getByRole('heading', { level: 1, name: 'الإشعارات' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'أقدم' })).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('صفحة الإشعارات تتطلّب الدخول', async ({ page, baseURL }) => {
    await page.context().addCookies([{ name: 'harf_demo_as', value: 'out', url: baseURL! }]);
    await page.goto('/notifications');
    await expect(page).toHaveURL(/\/login\?next=%2Fnotifications$/);
  });
});
