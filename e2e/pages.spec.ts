import { expect, test } from './fixtures';

test('روابط التذييل تفتح صفحاتها، والشروط والخصوصية معلَّمتان كمسودّة', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');
  for (const [name, heading] of [
    ['حرف', 'عن حرف'],
    ['الخدمات', 'الخدمات'],
    ['المساعدة', 'المساعدة'],
  ] as const) {
    await footer.getByRole('link', { name, exact: true }).click();
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  }
  await page.locator('footer').getByRole('link', { name: 'سياسة الخصوصية' }).click();
  await expect(page.getByRole('note')).toContainText('مسودّة');
});

test('صفحة «قريباً»: من الترويسة، و«نبّهني» يبقى بعد إعادة التحميل', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'الأقسام' }).getByRole('link', { name: 'مطابقة الخطوط' }).click();
  await expect(page).toHaveURL(/\/tools\/font-matching$/);
  await expect(page.getByRole('heading', { level: 1, name: 'مطابقة الخطوط' })).toBeVisible();
  const notify = page.getByRole('button', { name: /نبّهني عند الإطلاق/ });
  await notify.click();
  await expect(page.getByRole('button', { name: 'سننبّهك عند الإطلاق' })).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.getByRole('button', { name: 'سننبّهك عند الإطلاق' })).toBeVisible();
});
