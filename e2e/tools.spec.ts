import { expect, test } from './fixtures';

test('عكس النص: من الترويسة، والنتيجة متّصلة ومعكوسة، والمفاتيح تعمل', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'عكس النص' }).first().click();
  await expect(page).toHaveURL(/\/tools\/reverse-text$/);
  await expect(page.getByRole('heading', { level: 1, name: 'عكس النص' })).toBeVisible();

  await page.getByRole('textbox', { name: 'النص العربي' }).fill('سلام 2026');
  const out = page.getByRole('textbox', { name: 'النتيجة' });
  // «سلام» ← س(أول) لا(متّصلة) م(آخر)، ثم عكس مع إبقاء الرقم
  await expect(out).toHaveValue('2026 ﻢﻼﺳ');

  await page.getByText('عكس الاتجاه').click();
  await expect(out).toHaveValue('ﺳﻼﻢ 2026');
  await page.getByText('وصل الحروف').click();
  await expect(out).toHaveValue('سلام 2026');
});
