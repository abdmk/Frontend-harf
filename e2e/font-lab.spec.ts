import { readFileSync } from 'node:fs';

import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';

const tools = (page: Page) => page.getByRole('navigation', { name: 'أقسام المختبر' }).first();

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
    const card = page.getByRole('region', { name: 'الخط الحالي' });
    await expect(card.getByText('Amiri', { exact: true })).toBeVisible({ timeout: 20_000 });
    await card.getByRole('button', { name: /الخطوط المحمّلة/ }).click();
    await expect(page.getByRole('menuitemradio')).toHaveCount(4);
    await page.keyboard.press('Escape');

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

  test('عائلة بملفات منفصلة (Graphik Arabic): كل الملفات تُقرأ، يبدأ بالعادي، والـHero يختفي', async ({ page }) => {
    await page.goto('/tools/font-lab');
    await expect(page.getByRole('heading', { level: 1, name: /أفضل أداة لاختبار الخطوط/ })).toBeVisible();
    const weights = [250, 270, 300, 400, 500, 600];
    await page
      .locator('input[type=file][accept]')
      .first()
      .setInputFiles(
        weights.map((w) => ({
          name: `graphik-arabic-${w}.woff2`,
          mimeType: 'font/woff2',
          buffer: readFileSync(`src/assets/fonts/graphik-arabic-${w}.woff2`),
        })),
      );
    const card = page.getByRole('region', { name: 'الخط الحالي' });
    // العائلة الطباعية (name 16) لا اسم كل ملف، والبداية بالوزن العادي لا بأول ملف
    await expect(card.getByText('Graphik Arabic', { exact: true })).toBeVisible({ timeout: 20_000 });
    await expect(card).toContainText('Regular 400');
    await expect(card.getByRole('button', { name: /الخطوط المحمّلة \(6\)/ })).toBeVisible();
    // مساحة عمل: لا Hero، والعنوان هو القسم
    await expect(page.getByRole('heading', { level: 1, name: 'نظرة عامة' })).toBeVisible();
    await expect(page.getByText('أفضل أداة لاختبار الخطوط')).toHaveCount(0);

    await tools(page)
      .getByRole('button', { name: /الأوزان والمحاور/ })
      .click();
    await expect(page.getByText('حقيقي', { exact: true })).toHaveCount(6);
    await expect(page.getByText('250 · Thin')).toBeVisible();

    // «ابدأ من جديد» يعيد البداية
    await card.getByRole('button', { name: 'ابدأ من جديد بخط آخر' }).click();
    await expect(page.getByRole('heading', { level: 1, name: /أفضل أداة لاختبار الخطوط/ })).toBeVisible();
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
