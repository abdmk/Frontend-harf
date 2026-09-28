import type { Locator, Page } from '@playwright/test';

import { expect, test } from './fixtures';

/** زرّ فعل في البطاقة: رابط مباشر لخط واحد، أو قائمة لأكثر — نفتح القائمة ونختار الأول */
async function act(page: Page, card: Locator, name: 'تحميل' | 'شراء') {
  const menu = card.getByRole('button', { name, exact: true });
  if (await menu.count()) {
    await menu.click();
    await page.getByRole('menuitem').first().click();
  } else {
    await card.getByRole('link', { name: new RegExp(`^${name}`) }).click();
  }
}

async function pick(page: Page, label: string, option: string) {
  await page.getByRole('button', { name: new RegExp(`^${label}:`) }).click();
  await page.getByRole('menuitemradio', { name: option, exact: true }).click();
  await expect(page.getByRole('button', { name: `${label}: ${option}` })).toBeVisible();
}

test.describe('نسق', () => {
  test('من الترويسة: تسع تركيبات بخطوطها الحقيقية، والشريط و«تركيبات جديدة» يغيّرانها', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation', { name: 'الأقسام' }).getByRole('link', { name: 'نسق' }).click();
    await expect(page).toHaveURL(/\/tools\/nasaq$/);
    const cards = page.locator('article');
    await expect(cards).toHaveCount(9);

    // الخطوط محمّلة فعلاً لا بديلة
    await expect(page.getByRole('status', { name: 'تحميل الخطوط' })).toHaveCount(0, { timeout: 10_000 });
    const first = await cards.first().getAttribute('aria-label');

    await page.getByRole('button', { name: 'تركيبات جديدة' }).click();
    await expect.poll(() => cards.first().getAttribute('aria-label')).not.toBe(first);

    await pick(page, 'الاستخدام', 'النصوص الطويلة');
    await expect(cards).toHaveCount(9);

    await page.getByRole('group', { name: 'عدد الخطوط' }).getByRole('button', { name: '٣ خطوط' }).click();
    await expect(cards.first().getByText('الفرعي')).toBeVisible();
  });

  test('القفل يثبّت خط العنوان، ونص المعاينة يتغيّر في كل البطاقات، والحفظ يبقى', async ({ page }) => {
    await page.goto('/tools/nasaq');
    const cards = page.locator('article');
    await expect(cards).toHaveCount(9);

    const lock = cards.first().getByRole('button', { name: /^ثبّت .* لـالعناوين$/ });
    const name = (await lock.getAttribute('aria-label'))!.replace(/^ثبّت (.*) لـالعناوين$/, '$1');
    await lock.click();
    await expect(page.getByText(`${name} مثبّت لـالعناوين`)).toBeVisible();
    for (const card of await cards.all())
      await expect(card).toHaveAttribute('aria-label', new RegExp(`^تركيبة ${name} و`));

    await page.getByRole('textbox', { name: 'نص المعاينة' }).fill('مرحباً بالعالم');
    await expect(cards.nth(4)).toContainText('مرحباً بالعالم');
    await page.getByRole('button', { name: 'النص الافتراضي' }).click();
    await expect(cards.nth(4)).not.toContainText('مرحباً بالعالم');

    await cards
      .first()
      .getByRole('button', { name: /^حفظ تركيبة/ })
      .click();
    await page.reload();
    await page.getByRole('button', { name: /المحفوظة \(1\)/ }).click();
    await expect(cards).toHaveCount(1);
  });

  test('تحميل خط مجاني من حرف مباشرة', async ({ page }) => {
    await page.goto('/tools/nasaq');
    await pick(page, 'الترخيص', 'مجانية');
    const card = page.locator('article').first();
    await expect(card.getByRole('button', { name: 'شراء', exact: true })).toHaveCount(0);
    const [download] = await Promise.all([page.waitForEvent('download'), act(page, card, 'تحميل')]);
    expect(download.suggestedFilename()).toMatch(/^[a-z-]+\.zip$/);
  });

  test('شراء خط مدفوع: لوحة الترخيص ثم سلة حرف', async ({ page }) => {
    await page.goto('/tools/nasaq');
    await pick(page, 'الترخيص', 'مدفوعة');
    const card = page.locator('article').first();
    // لا ملفات للمدفوعة
    await expect(card.locator('a[download]')).toHaveCount(0);
    await act(page, card, 'شراء');
    await expect(page).toHaveURL(/\/fonts\/[a-z-]+\?license=1$/);
    const sheet = page.getByRole('dialog');
    await sheet.getByRole('button', { name: 'أضف إلى السلة' }).click();
    await expect(page.getByRole('region', { name: 'الإشعارات العابرة' }).getByText('أُضيف إلى السلة')).toBeVisible();
  });

  test('التفاصيل: رابط صفحة الخط ونسخ CSS', async ({ page }) => {
    await page.goto('/tools/nasaq');
    await page
      .locator('article')
      .first()
      .getByRole('button', { name: /^تفاصيل/ })
      .click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('link', { name: 'صفحة الخط' }).first()).toHaveAttribute('href', /^\/fonts\//);
    await expect(dialog.getByRole('button', { name: 'نسخ CSS' })).toBeVisible();
  });

  test('خيارات بلا تركيبات تُظهر حالة فارغة يمكن الخروج منها', async ({ page }) => {
    await page.goto('/tools/nasaq');
    await pick(page, 'الترخيص', 'مدفوعة');
    await pick(page, 'اللغة', 'العربية والكردية');
    await expect(page.getByRole('heading', { name: 'لا تركيبات لهذه الخيارات' })).toBeVisible();
    await page.getByRole('button', { name: 'وسّع الخيارات' }).click();
    await expect(page.locator('article')).toHaveCount(9);
  });
});
