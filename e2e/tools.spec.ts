import { expect, test } from './fixtures';

test('عكس النص: من الترويسة، والنتيجة متّصلة ومعكوسة، والمفاتيح تعمل', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'عكس النص' }).first().click();
  await expect(page).toHaveURL(/\/tools\/reverse-text$/);
  await expect(page.getByRole('heading', { level: 1, name: 'عكس النص' })).toBeVisible();

  await page.getByRole('textbox', { name: 'النص العربي' }).fill('سلام 2026');
  const out = page.getByRole('textbox', { name: 'النتيجة' });
  // «سلام» ← س(أول) لا(متّصلة) م(آخر)، ثم عكس مع إبقاء الرقم
  await expect(out).toHaveValue('2026 ﻡﻼﺳ');

  await page.getByRole('switch', { name: 'عكس الاتجاه' }).click();
  await expect(out).toHaveValue('ﺳﻼﻡ 2026');
  await page.getByRole('switch', { name: 'وصل الحروف' }).click();
  await expect(out).toHaveValue('سلام 2026');
});

test('عكس النص: إزالة التشكيل وتنزيل النتيجة، بلا معاينة في البرنامج', async ({ page }) => {
  await page.goto('/tools/reverse-text');
  await page.getByRole('textbox', { name: 'النص العربي' }).fill('بَت');
  const out = page.getByRole('textbox', { name: 'النتيجة' });
  // ب(أول) + فتحة، ت(آخر)، ثم عكس: العنقود (حرف + حركته) يبقى معاً
  await expect(out).toHaveValue('\ufe96\ufe91\u064e');
  await page.getByRole('switch', { name: 'إزالة التشكيل' }).click();
  await expect(out).toHaveValue('\ufe96\ufe91');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /تنزيل/ }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('harf-reversed.txt');
  await expect(page.getByRole('button', { name: 'معاينة في البرنامج' })).toHaveCount(0);
});
