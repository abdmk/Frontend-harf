import { readFileSync } from 'node:fs';

import type { Page } from '@playwright/test';

import { expect, seedVerifiedStudio, test } from './fixtures';

test.describe('المخطوطات', () => {
  test('التصنيف والبحث (بلا تشكيل) والترتيب تبقى في الرابط', async ({ page }) => {
    await page.goto('/manuscripts');
    const cards = page.getByRole('list', { name: 'المخطوطات' }).locator('article');
    await expect(cards).toHaveCount(42);

    // التصنيفات مطويّة خلف زرّ «التصنيف» كما في المكتبة
    await page.getByRole('button', { name: 'التصنيف', exact: true }).click();
    await page
      .getByRole('group', { name: 'التصنيفات' })
      .getByRole('button', { name: /^رمضان/ })
      .click();
    await expect(page).toHaveURL(/cat=ramadan/);
    await expect(cards).toHaveCount(4);

    // «اليوم الوطني» ليس فارغاً: سبعة أعمال
    await page
      .getByRole('group', { name: 'التصنيفات' })
      .getByRole('button', { name: /^اليوم الوطني/ })
      .click();
    await expect(page).toHaveURL(/cat=national/);
    await expect(cards).toHaveCount(7);

    await page.getByRole('group', { name: 'التصنيفات' }).getByRole('button', { name: /^الكل/ }).click();
    await page.getByRole('searchbox').fill('رَمَضان');
    await expect(page).toHaveURL(/q=/);
    await expect(cards).toHaveCount(4);

    await page.getByRole('button', { name: 'مسح الكل' }).click();
    await page.getByRole('button', { name: 'الأكثر تحميلاً' }).click();
    await expect(page).toHaveURL(/sort=popular/);
    await expect(cards).toHaveCount(42);
  });

  test('التصنيفات المدموجة: خمسة، والروابط القديمة تفتح التصنيف الذي صارت فيه', async ({ page }) => {
    await page.goto('/manuscripts?cat=jumua');
    const cards = page.getByRole('list', { name: 'المخطوطات' }).locator('article');
    await expect(cards).toHaveCount(17);
    await page.getByRole('button', { name: 'التصنيف', exact: true }).click();
    const cats = page.getByRole('group', { name: 'التصنيفات' }).getByRole('button');
    await expect(cats).toHaveCount(6); // الكل + خمسة
    await expect(cats.filter({ hasText: 'إسلامية' })).toHaveAttribute('aria-pressed', 'true');
    await expect(cats.filter({ hasText: 'اليوم الوطني' })).toBeVisible();
  });

  test('العارض: فتح، تنقّل، تكبير، تحميل SVG، وحفظ يبقى', async ({ page }) => {
    await page.goto('/manuscripts');
    await page.getByRole('button', { name: 'محمد رسول الله', exact: true }).click();
    const viewer = page.getByRole('dialog');
    await expect(viewer).toHaveAccessibleName('محمد رسول الله');
    await expect(viewer).toBeVisible();
    await expect(page).toHaveURL(/m=muhammad/);
    const counter = viewer.getByText(/\d+ \/ 42/);
    const before = await counter.textContent();

    await page.keyboard.press('ArrowLeft');
    await expect(counter).not.toHaveText(before ?? '');

    await viewer.getByRole('button', { name: 'تكبير' }).click();
    await expect(viewer.getByRole('button', { name: 'الحجم الأصلي' })).toHaveText('150%');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      viewer.getByRole('link', { name: 'تحميل SVG' }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.svg$/);

    await viewer.getByRole('button', { name: 'حفظ' }).click();
    await page.keyboard.press('Escape');
    await page.reload();
    await page.getByRole('button', { name: /^تصفية/ }).click();
    const sheet = page.getByRole('dialog', { name: 'تصفية' });
    await sheet.getByRole('radio', { name: /^المحفوظة/ }).click();
    await sheet.getByRole('button', { name: 'عرض عمل واحد' }).click();
    await expect(page).toHaveURL(/view=saved/);
    await expect(page.getByRole('list', { name: 'المخطوطات' }).locator('article')).toHaveCount(1);
  });

  test('البطاقة: شارة «مجاني»، المصمّم رابط لصفحته، وتحميل SVG؛ والتصفية بالمصمّم تُزال من سطر الحالة', async ({
    page,
  }) => {
    await page.goto('/manuscripts');
    const card = page.getByRole('list', { name: 'المخطوطات' }).locator('article').first();
    await expect(card.getByText('مجاني', { exact: true })).toBeVisible();
    await expect(card.getByRole('link').first()).toHaveAttribute('href', /^\/designers\//);
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      card.getByRole('link', { name: /^تحميل .*\(SVG،/ }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^harf-.*\.svg$/);

    await page.getByRole('button', { name: /^تصفية/ }).click();
    const sheet = page.getByRole('dialog', { name: 'تصفية' });
    const designer = sheet.getByRole('toolbar', { name: 'المصمّم' }).getByRole('button').first();
    const name = (await designer.textContent())!.trim();
    await designer.click();
    await sheet.getByRole('button', { name: /^عرض/ }).click();
    await expect(page).toHaveURL(/by=/);
    await page.getByRole('button', { name: `إزالة ${name}` }).click();
    await expect(page).not.toHaveURL(/by=/);
  });
});

test.describe('رفع مخطوطة', () => {
  test('الاستوديو الموثّق يرفع SVG ويرسله للمراجعة، والملف الذي فيه سكربت يُرفض', async ({ page }) => {
    await seedVerifiedStudio(page);
    await page.goto('/manuscripts?as=studio');
    await page.getByRole('link', { name: 'ارفع مخطوطة' }).click();
    await expect(page).toHaveURL(/\/studio\/manuscripts\/new$/);
    await expect(page.getByRole('heading', { level: 1, name: 'رفع مخطوطة' })).toBeVisible();

    const input = page.locator('input[type=file]').first();
    // ملف فيه سكربت: يُرفض قبل أي معاينة
    await input.setInputFiles({
      name: 'bad.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><script>alert(1)</script></svg>',
      ),
    });
    await expect(page.getByText(/عنصراً غير مسموح/)).toBeVisible();

    await input.setInputFiles({
      name: 'ramadan-kareem.svg',
      mimeType: 'image/svg+xml',
      buffer: readFileSync('public/manuscripts/ahlan-ramadan.svg'),
    });
    await expect(page.getByRole('img', { name: /معاينة/ })).toBeVisible();

    // إرسال ناقص: الأخطاء بجانب حقولها
    await page.getByRole('button', { name: 'إرسال للمراجعة' }).click();
    await expect(page.getByText('اختر التصنيف.')).toBeVisible();
    await expect(page.getByText('أكّد أنك صاحب العمل أو تملك حقّ نشره.')).toBeVisible();

    await page.getByRole('combobox', { name: 'التصنيف' }).click();
    await page.getByRole('option', { name: 'رمضان' }).click();
    await page.getByRole('combobox', { name: 'الخطوط المستخدمة' }).fill('Cairo');
    await page.getByRole('option', { name: /Cairo/ }).first().click();
    await page.getByRole('checkbox').click();
    await page.getByRole('button', { name: 'إرسال للمراجعة' }).click();
    await expect(page.getByRole('heading', { name: 'أُرسلت المخطوطة للمراجعة' })).toBeVisible();
  });

  test('بلا توثيق: بوّابة التوثيق بدل الرفع', async ({ page }) => {
    await page.goto('/studio/manuscripts/new?as=studio');
    await expect(page.getByRole('button', { name: 'ارفع مخطوطة' })).toHaveCount(0);
    await expect(page.getByText(/وثّق/).first()).toBeVisible();
  });
});

test.describe('مراجعة المخطوطات', () => {
  /** يرفع الاستوديو الموثّق مخطوطة بعنوان محدّد */
  async function upload(page: Page, title: string) {
    await page.goto('/studio/manuscripts/new?as=studio');
    await page
      .locator('input[type=file]')
      .first()
      .setInputFiles({
        name: 'eid.svg',
        mimeType: 'image/svg+xml',
        buffer: readFileSync('public/manuscripts/ahlan-ramadan.svg'),
      });
    await page.getByLabel('عنوان العمل').fill(title);
    await page.getByRole('combobox', { name: 'التصنيف' }).click();
    await page.getByRole('option', { name: 'العيد' }).click();
    await page.getByRole('combobox', { name: 'الخطوط المستخدمة' }).fill('Cairo');
    await page.getByRole('option', { name: /Cairo/ }).first().click();
    await page.getByRole('checkbox').click();
    await page.getByRole('button', { name: 'إرسال للمراجعة' }).click();
    await expect(page.getByRole('heading', { name: 'أُرسلت المخطوطة للمراجعة' })).toBeVisible();
  }

  test('رفع ← رفض بسبب يراه صاحبه ← إعادة رفع ← قبول ← يظهر في المكتبة', async ({ page }) => {
    await seedVerifiedStudio(page);
    await upload(page, 'تهنئة العيد الأولى');
    await page.getByRole('button', { name: 'ارفع مخطوطة أخرى' }).click();
    const mine = page.getByRole('region', { name: 'طلباتك' });
    await expect(mine.getByText('تهنئة العيد الأولى')).toBeVisible();
    await expect(mine.getByText('بانتظار المراجعة')).toBeVisible();

    // المشرف: الطلب في «الطلبات › مخطوطات» بعدّاده
    await page.goto('/admin/requests?type=manuscripts&as=admin');
    await expect(page.getByRole('tab', { name: /مخطوطات\s*1/ })).toBeVisible();
    await page.getByRole('link', { name: 'راجِع' }).click();
    await expect(page).toHaveURL(/\/admin\/manuscripts\/MS-\d+$/);
    await expect(page.getByRole('img', { name: 'معاينة تهنئة العيد الأولى' })).toBeVisible();
    await expect(page.getByText('نجح').first()).toBeAttached();

    const reason = 'العمل مقصوص من الأطراف — صدّره بهامش أوسع.';
    await page.getByRole('radio', { name: /رفض/ }).click();
    await page.getByLabel('السبب').fill(reason);
    await page.getByRole('button', { name: 'تأكيد: رفض' }).click();
    await expect(page).toHaveURL(/\/admin\/requests\?type=manuscripts$/);

    // صاحب العمل يرى القرار وسببه كما كُتب
    await page.goto('/studio/manuscripts/new?as=studio');
    await expect(mine.getByText('مرفوضة')).toBeVisible();
    await expect(mine.getByText(reason)).toBeVisible();

    await upload(page, 'تهنئة العيد المعدّلة');
    await page.goto('/admin/requests?type=manuscripts&as=admin');
    await page.getByRole('link', { name: 'تهنئة العيد المعدّلة' }).click();
    await page.getByRole('radio', { name: /قبول ونشر/ }).click();
    await page.getByRole('button', { name: 'تأكيد: قبول ونشر' }).click();

    // المقبول في المكتبة — والمرفوض لا
    await page.goto('/manuscripts?q=تهنئة العيد');
    const cards = page.getByRole('list', { name: 'المخطوطات' }).locator('article');
    await expect(cards).toHaveCount(1);
    await expect(cards.first().getByText('تهنئة العيد المعدّلة')).toBeVisible();
    await expect(cards.first().locator('img').first()).toHaveJSProperty('complete', true);
  });

  test('صفحة المراجعة للمشرف وحده', async ({ page }) => {
    await page.goto('/admin/manuscripts/MS-1234?as=studio');
    await expect(page.getByRole('heading', { name: 'الصفحة غير موجودة' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'أقسام الإدارة' })).toHaveCount(0);
  });
});
