import { expect, test } from './fixtures';

test.describe('دليل التصميم', () => {
  test('يعرض الأقسام ولا يُفهرس', async ({ page }) => {
    await page.goto('/design-system');
    await expect(page.getByRole('heading', { level: 1, name: 'دليل تصميم حرف' })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    for (const id of ['color', 'buttons', 'inputs', 'badges', 'feedback', 'table', 'font-card']) {
      await expect(page.locator(`section#${id}`)).toHaveCount(1);
    }
  });

  test('الإشعار العابر يظهر ويُغلق', async ({ page }) => {
    await page.goto('/design-system');
    await page.getByRole('button', { name: 'إشعار نجاح عابر' }).click();
    const region = page.getByRole('region', { name: 'الإشعارات العابرة' });
    await expect(region.getByText('اكتمل رفع الخط')).toBeVisible();
    await region.getByRole('button', { name: 'إغلاق التنبيه' }).click();
    await expect(region.getByText('اكتمل رفع الخط')).toHaveCount(0);
  });

  test('النافذة تحبس التركيز وتعيده عند الإغلاق', async ({ page }) => {
    await page.goto('/design-system');
    const trigger = page.getByRole('button', { name: 'حذف الخط' });
    await trigger.click();
    await expect(page.getByRole('dialog', { name: /حذف/ })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  });

  test('حقل البريد يعلن الخطأ ويربطه بالحقل', async ({ page }) => {
    await page.goto('/design-system');
    const email = page.getByLabel('البريد الإلكتروني');
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await email.fill('ahmed@harf.co');
    await expect(email).toHaveAttribute('aria-invalid', 'false');
  });
});
