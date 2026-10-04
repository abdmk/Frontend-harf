import { readFileSync } from 'node:fs';

import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';

const tool = (page: Page, name: RegExp) =>
  page.getByRole('navigation', { name: 'أدوات الفحص' }).getByRole('button', { name });
const context = (page: Page, name: string) =>
  page.getByRole('group', { name: 'سياق الاختبار' }).getByRole('button', { name, exact: true });

test.describe('مختبر الخط', () => {
  test('رفع عائلة كاملة بملف ZIP: الأدوات بترتيبها، الأوزان الحقيقية، وOpenType من الأداة إلى العيّنة', async ({
    page,
  }) => {
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
    await page.getByRole('combobox', { name: 'النمط' }).click();
    await expect(page.getByRole('option')).toHaveCount(4);
    await page.keyboard.press('Escape');

    // الأوزان أداة مستقلّة في القائمة — الحقيقية منها تُكتشف من ملفات العائلة
    await tool(page, /^الأوزان/).click();
    await expect(page).toHaveURL(/tool=weights/);
    await expect(page.getByText('حقيقي', { exact: true })).toHaveCount(2); // Regular 400 + Bold 700

    // عيّنة النص: سياقات الاختبار كلها بالإعدادات نفسها
    await tool(page, /^عيّنة النص/).click();
    await context(page, 'اختبارات').click();
    await expect(page.getByRole('article', { name: /الحروف المفردة/ })).toContainText('كل الحروف موجودة');
    await context(page, 'فقرات').click();
    await expect(page.getByRole('article', { name: /الفارسية/ })).toBeVisible();
    await context(page, 'اكتب').click();
    // ميزات الملف الاختيارية ظاهرة فوق العيّنة مباشرة
    await expect(
      page.getByRole('group', { name: 'OpenType في العيّنة' }).getByRole('button', { name: /^ss01/ }),
    ).toBeVisible();

    // كل محارف الملف بترتيبها، وأسماؤها مشتقّة حين يخلو الملف منها (Amiri: post v3)
    await tool(page, /^المحارف/).click();
    await page.getByRole('button', { name: /كل محارف الملف/ }).click();
    await page.getByRole('searchbox').fill('uni0628.init');
    await expect(page.getByRole('button', { name: /uni0628\.init$/ }).first()).toBeVisible();

    // أداة OpenType: مفاتيح الملف باسمها ووصفها، وأثر الميزة حين تُشغَّل
    await tool(page, /^ميزات OpenType/).click();
    await expect(page.getByRole('region', { name: 'أشكال وبدائل' })).toContainText('مجموعة أشكال بديلة رسمها المصمّم');
    await page.getByRole('switch', { name: /^ss03/ }).click();
    await expect(page.getByRole('switch', { name: /^ss03/ })).toBeChecked();
    await expect(page.getByRole('group', { name: 'ما تغيّره ss03' })).toBeVisible();

    // «جرّب في العيّنة» يعود إلى العيّنة بنصّ يُظهر الميزة، والميزة مفعّلة في شريطها
    await page
      .getByRole('listitem')
      .filter({ has: page.getByRole('group', { name: 'ما تغيّره ss03' }) })
      .getByRole('button', { name: 'جرّب في العيّنة' })
      .click();
    await expect(page).not.toHaveURL(/tool=/);
    await expect(
      page.getByRole('group', { name: 'OpenType في العيّنة' }).getByRole('button', { name: /^ss03/ }),
    ).toHaveAttribute('aria-pressed', 'true');
    // «قبل / بعد»: افتراضي الخط بجانب الميزات المفعّلة
    await page.getByRole('button', { name: 'قبل / بعد' }).click();
    await expect(page.getByText('افتراضي الخط')).toBeVisible();

    // جرد الملف: اسم المجموعة الأسلوبية كما كتبه المصمّم، والربطات
    await tool(page, /^ميزات OpenType/).click();
    await page.getByRole('button', { name: 'جرد الملف' }).click();
    await expect(page).toHaveURL(/sub=inventory/);
    await expect(page.getByText('خفض نقطة الباء المسبوقة براء أو واو').first()).toBeVisible();
    await expect(page.getByRole('region', { name: 'الربطات' }).getByRole('img').first()).toBeVisible();
  });

  test('خط من المكتبة: الفحص السريع، ميزات OpenType، اللغات، والمحارف', async ({ page }) => {
    await page.goto('/tools/font-lab?font=cairo');
    // الجواب الأول في بطاقة الخط، والتفصيل في «اللغات»
    await page.getByRole('button', { name: /الفحص السريع/ }).click({ timeout: 20_000 });
    await expect(page).toHaveURL(/tool=languages/);
    await expect(page.getByRole('region', { name: 'فحص سريع' })).toContainText('أشكال الحروف السياقية');
    await expect(page.getByRole('region', { name: 'العربية' })).toContainText('مدعومة بالكامل');

    await tool(page, /^ميزات OpenType/).click();
    await page.getByRole('switch', { name: /^kern/ }).click();
    await expect(page.getByText('font-feature-settings: "kern" 0;')).toBeVisible();

    await tool(page, /^المحارف/).click();
    await page.getByRole('searchbox').fill('U+0628');
    await expect(page.getByRole('img', { name: /رسم المحرف ب/ })).toBeVisible();

    await tool(page, /^معلومات الخط/).click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'تنزيل JSON' }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.json$/);
  });

  test('روابط الإصدار السابق تفتح أداتها', async ({ page }) => {
    await page.goto('/tools/font-lab?font=cairo&view=opentype');
    await expect(page.getByRole('heading', { level: 2, name: 'ميزات OpenType' })).toBeVisible({ timeout: 20_000 });
  });

  test('Graphik Arabic بملفات منفصلة: كل الملفات تُقرأ، النص يتبع كل الأدوات، والـHero يختفي', async ({ page }) => {
    await page.goto('/tools/font-lab');
    await expect(page.getByRole('heading', { level: 1, name: /اكتشف خطّك قبل أن تستخدمه/ })).toBeVisible();
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
    await expect(page.getByText('اكتشف خطّك')).toHaveCount(0);
    const style = page.getByRole('combobox', { name: 'النمط' });
    await expect(style).toContainText('Regular');
    await style.click();
    await expect(page.getByRole('option')).toHaveCount(6);
    await page.keyboard.press('Escape');

    await tool(page, /^الأوزان/).click();
    await expect(page.getByText('حقيقي', { exact: true })).toHaveCount(6);
    await expect(page.getByText('250 · Thin')).toBeVisible();

    // نصّ واحد في العيّنة يتبعه كل أداة
    await tool(page, /^عيّنة النص/).click();
    await page.getByLabel('نص العيّنة — قابل للتحرير').fill('مكتبة حرف');
    await tool(page, /^تدرّج الأحجام/).click();
    await expect(page.getByText('مكتبة حرف').first()).toBeVisible();
    await tool(page, /^عيّنة النص/).click();
    await style.click();
    await page.getByRole('option', { name: /SemiBold/ }).click();
    await expect(style).toContainText('SemiBold');

    await page.getByRole('button', { name: 'ابدأ من جديد' }).click();
    await expect(page.getByRole('heading', { level: 1, name: /اكتشف خطّك قبل أن تستخدمه/ })).toBeVisible();
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

test.describe('مختبر الخط — النسخة «ب»', () => {
  test('تبويبات مجمّعة مثبّتة، وشريط نصّ واحد يتبع أدوات «جرّب»', async ({ page }) => {
    await page.goto('/tools/font-lab-b?font=cairo');
    await expect(page.getByRole('heading', { level: 1, name: 'Cairo' })).toBeVisible({ timeout: 20_000 });
    const nav = page.getByRole('navigation', { name: 'أدوات الفحص' });
    for (const g of ['جرّب', 'افحص', 'تحقّق']) await expect(nav.getByRole('group', { name: g })).toBeVisible();

    // شريط النص نفسه في العيّنة والأحجام — والحجم يبقى كما ضُبط
    const bar = page.getByRole('region', { name: 'إعدادات النص' });
    await expect(bar).toBeVisible();
    await nav.getByRole('button', { name: 'الأحجام' }).click();
    await expect(page).toHaveURL(/tool=waterfall/);
    await bar.getByLabel('نص المعاينة').fill('مكتبة حرف');
    await expect(page.getByText('مكتبة حرف').nth(1)).toBeVisible();

    // أدوات «افحص» بلا شريط النص — لكلٍّ إعداداتها
    await nav.getByRole('button', { name: /^OpenType/ }).click();
    await expect(bar).toHaveCount(0);
    await page.getByRole('switch', { name: /^kern/ }).click();
    await expect(page.getByText('font-feature-settings: "kern" 0;')).toBeVisible();

    await page.getByRole('button', { name: /الفحص السريع/ }).click();
    await expect(page).toHaveURL(/tool=languages/);
    await expect(page.getByRole('region', { name: 'فحص سريع' })).toBeVisible();
  });

  test('الجوال: الإعدادات في لوحة سفلية', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/tools/font-lab-b?font=cairo');
    await page.getByRole('button', { name: 'إعدادات النص' }).click({ timeout: 20_000 });
    const sheet = page.getByRole('dialog', { name: 'إعدادات النص' });
    await expect(sheet.getByRole('slider', { name: 'الحجم' })).toBeVisible();
    await expect(sheet.getByRole('group', { name: 'الألوان' })).toBeVisible();
  });
});
