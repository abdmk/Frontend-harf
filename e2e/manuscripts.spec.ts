import { expect, test } from './fixtures';

test.describe('المخطوطات', () => {
  test('التصنيف والبحث (بلا تشكيل) والترتيب تبقى في الرابط', async ({ page }) => {
    await page.goto('/manuscripts');
    const cards = page.getByRole('list', { name: 'المخطوطات' }).locator('article');
    await expect(cards).toHaveCount(36);

    // التصنيفات مطويّة خلف زرّ «التصنيف» كما في المكتبة
    await page.getByRole('button', { name: 'التصنيف', exact: true }).click();
    await page
      .getByRole('group', { name: 'التصنيفات' })
      .getByRole('button', { name: /^رمضان/ })
      .click();
    await expect(page).toHaveURL(/cat=ramadan/);
    await expect(cards).toHaveCount(4);

    await page.getByRole('group', { name: 'التصنيفات' }).getByRole('button', { name: /^الكل/ }).click();
    await page.getByRole('searchbox').fill('رَمَضان');
    await expect(page).toHaveURL(/q=/);
    await expect(cards).toHaveCount(4);

    await page.getByRole('button', { name: 'مسح الكل' }).click();
    await page.getByRole('button', { name: 'الأكثر تحميلاً' }).click();
    await expect(page).toHaveURL(/sort=popular/);
    await expect(cards).toHaveCount(36);
  });

  test('العارض: فتح، تنقّل، تكبير، تحميل SVG، وحفظ يبقى', async ({ page }) => {
    await page.goto('/manuscripts');
    await page.getByRole('button', { name: 'محمد رسول الله', exact: true }).click();
    const viewer = page.getByRole('dialog');
    await expect(viewer).toHaveAccessibleName('محمد رسول الله');
    await expect(viewer).toBeVisible();
    await expect(page).toHaveURL(/m=muhammad/);
    const counter = viewer.getByText(/\d+ \/ 36/);
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
