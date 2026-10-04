import { readFileSync } from 'node:fs';

import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';

const tools = (page: Page) => page.getByRole('navigation', { name: 'أقسام المختبر' }).first();

test.describe('مختبر الخط', () => {
  test('رفع عائلة كاملة بملف ZIP: الأنماط في الشريط، والأوزان الحقيقية تُكتشف', async ({ page }) => {
    await page.goto('/tools/font-lab');
    await page
      .locator('input[type=file][accept]')
      .first()
      .setInputFiles({
        name: 'amiri.zip',
        mimeType: 'application/zip',
        buffer: readFileSync('public/downloads/fonts/amiri.zip'),
      });
    await expect(page.getByRole('heading', { level: 1, name: 'Amiri' })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('radiogroup', { name: 'النمط' }).getByRole('radio')).toHaveCount(4);
    // المعاينة هي المشهد الأول، وفيها الأنماط والأوزان
    await expect(page.getByText('حقيقي', { exact: true })).toHaveCount(2); // Regular 400 + Bold 700

    // جرد OpenType: اسم المجموعة الأسلوبية كما كتبه المصمّم في الملف، وما تغيّره، والربطات
    await tools(page)
      .getByRole('button', { name: /جرد OpenType/ })
      .click();
    await expect(page.getByText('خفض نقطة الباء المسبوقة براء أو واو').first()).toBeVisible();
    await expect(page.getByRole('group', { name: 'ما تغيّره ss04' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'الربطات' }).getByRole('img').first()).toBeVisible();

    // من الجرد إلى اللوحة: «جرّب في النص» يفعّل الميزة، ويضع نصها، ويفتح OpenType في المفتش
    await page
      .getByRole('region', { name: 'أثر الميزات' })
      .getByRole('listitem')
      .filter({ hasText: 'ss03' })
      .getByRole('button', { name: 'جرّب في النص' })
      .click();
    await expect(page.getByRole('switch', { name: /^ss03/ })).toBeChecked();
    await expect(page.getByRole('button', { name: 'إلغاء ss03' })).toBeVisible();
    // «قبل / بعد»: افتراضي الخط بجانب الميزات المفعّلة
    await page.getByRole('button', { name: 'قبل / بعد' }).click();
    await expect(page.getByText('افتراضي الخط')).toBeVisible();
  });

  test('خط من المكتبة: الفحص السريع، ميزات OpenType، اللغات، والمحارف', async ({ page }) => {
    await page.goto('/tools/font-lab?font=cairo');
    // الجواب الأول في الرأس، والتفصيل في «الدعم»
    await page.getByRole('button', { name: /الفحص السريع/ }).click({ timeout: 20_000 });
    await expect(page).toHaveURL(/view=support/);
    await expect(page.getByRole('region', { name: 'فحص سريع' })).toContainText('أشكال الحروف السياقية');
    await expect(page.getByRole('region', { name: 'العربية' })).toContainText('مدعومة بالكامل');
    // OpenType في المفتش بجانب لوحة الاختبار
    await page
      .getByRole('group', { name: 'لوحة الإعدادات' })
      .getByRole('button', { name: /OpenType/ })
      .click();
    await page.getByRole('switch', { name: /^kern/ }).click();
    await expect(page.getByText('font-feature-settings: "kern" 0;')).toBeVisible();

    await tools(page)
      .getByRole('button', { name: /الحروف/ })
      .click();
    await page.getByRole('button', { name: 'كل المحارف' }).click();
    await page.getByRole('searchbox').fill('U+0628');
    await expect(page.getByRole('img', { name: /رسم المحرف ب/ })).toBeVisible();

    await tools(page).getByRole('button', { name: /الملف/ }).click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'تنزيل JSON' }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.json$/);
  });

  test('Graphik Arabic بملفات منفصلة: كل الملفات تُقرأ، النص يتبع كل المشاهد، والـHero يختفي', async ({ page }) => {
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
    // العائلة الطباعية (name 16) لا اسم كل ملف؛ والبداية بالوزن العادي لا بأول ملف
    await expect(page.getByRole('heading', { level: 1, name: 'Graphik Arabic' })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('أفضل أداة لاختبار الخطوط')).toHaveCount(0);
    const styles = page.getByRole('radiogroup', { name: 'النمط' });
    await expect(styles.getByRole('radio')).toHaveCount(6);
    await expect(styles.getByRole('radio', { name: 'Regular' })).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByText('حقيقي', { exact: true })).toHaveCount(6);
    await expect(page.getByText('250 · Thin')).toBeVisible();

    // نصّ واحد في الشريط يتبعه كل مشهد
    // اللوحة هي مكان الكتابة، والنص نفسه يتبعه تحليل الأنماط تحتها
    await page.getByLabel('نص العيّنة — قابل للتحرير').fill('مكتبة حرف');
    await expect(page.getByText('مكتبة حرف').first()).toBeVisible();
    await styles.getByRole('radio', { name: 'SemiBold' }).click();
    await expect(styles.getByRole('radio', { name: 'SemiBold' })).toHaveAttribute('aria-checked', 'true');

    await page.getByRole('button', { name: 'ابدأ من جديد' }).click();
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
