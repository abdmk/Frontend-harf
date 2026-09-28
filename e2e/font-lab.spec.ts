import { readFileSync } from 'node:fs';

import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';

const tools = (page: Page) => page.getByRole('navigation', { name: 'أدوات المختبر' }).first();

test.describe('مختبر الخط', () => {
  test('رفع عائلة كاملة بملف ZIP: الأوزان الحقيقية تُكتشف', async ({ page }) => {
    await page.goto('/tools/font-lab');
    await page
      .locator('input[type=file][accept]')
      .first()
      .setInputFiles({
        name: 'amiri.zip',
        mimeType: 'application/zip',
        buffer: readFileSync('public/downloads/fonts/amiri.zip'),
      });
    const shelf = page.getByRole('region', { name: 'الخطوط المحمّلة' });
    await expect(shelf.getByText('Amiri Bold', { exact: true })).toBeVisible({ timeout: 20_000 });
    await expect(shelf.locator('button[aria-pressed]')).toHaveCount(4);

    await tools(page)
      .getByRole('button', { name: /الأوزان والمحاور/ })
      .click();
    await expect(page.getByText('حقيقي', { exact: true })).toHaveCount(2); // Regular 400 + Bold 700
  });

  test('خط من المكتبة: نظرة عامة، ميزات OpenType، اللغات، والمحارف', async ({ page }) => {
    await page.goto('/tools/font-lab?font=cairo');
    await expect(page.getByRole('region', { name: 'فحص سريع' })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('region', { name: 'فحص سريع' })).toContainText('أشكال الحروف السياقية');

    await tools(page)
      .getByRole('button', { name: /ميزات OpenType/ })
      .click();
    await page.getByRole('switch', { name: /^kern/ }).click();
    await expect(page.getByText('font-feature-settings: "kern" 0;')).toBeVisible();
    await expect(page).toHaveURL(/tool=features/);

    await tools(page)
      .getByRole('button', { name: /اللغات/ })
      .click();
    await expect(page.getByRole('region', { name: 'العربية' })).toContainText('مدعومة بالكامل');

    await tools(page)
      .getByRole('button', { name: /المحارف/ })
      .click();
    await page.getByRole('searchbox').fill('U+0628');
    await expect(page.getByRole('img', { name: /رسم المحرف ب/ })).toBeVisible();

    await tools(page)
      .getByRole('button', { name: /المعلومات والتصدير/ })
      .click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'تنزيل JSON' }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.json$/);
  });

  test('ملف ليس خطاً يُرفض برسالة', async ({ page }) => {
    await page.goto('/tools/font-lab');
    await page
      .locator('input[type=file][accept]')
      .first()
      .setInputFiles({
        name: 'notes.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('hello'),
      });
    await expect(page.getByText('ليست ملف خط')).toBeVisible();
  });
});
