import { expect, test } from './fixtures';

test('روابط التذييل تفتح صفحاتها، والوثائق القانونية كاملة بفهرسها', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');
  for (const [name, heading] of [
    ['حرف', 'عن حرف'],
    ['الخدمات', 'الخدمات'],
    ['المساعدة', 'المساعدة'],
  ] as const) {
    await footer.getByRole('link', { name, exact: true }).click();
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  }
  await page.locator('footer').getByRole('link', { name: 'سياسة الخصوصية' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'سياسة الخصوصية' })).toBeVisible();
  await expect(page.locator('main section[id^="s-"]')).toHaveCount(19);
  await expect(page.getByText(/آخر تحديث:/)).toBeVisible();

  // الوثيقة الأخرى من التذييل، و«في هذه الصفحة» يقفز إلى القسم
  await page.locator('footer').getByRole('link', { name: 'الشروط والأحكام' }).click();
  await expect(page).toHaveURL(/\/terms$/);
  await expect(page.locator('main section[id^="s-"]')).toHaveCount(26);
  await page
    .getByRole('navigation', { name: 'فهرس الشروط والأحكام' })
    .getByRole('link', { name: /الدفع عبر Stripe/ })
    .filter({ visible: true })
    .click();
  await expect(page).toHaveURL(/#s-6$/);
  await expect(page.getByRole('link', { name: 'abdulmalik@harflibrary.com' }).last()).toHaveAttribute(
    'href',
    'mailto:abdulmalik@harflibrary.com',
  );
});

test('صفحة «قريباً»: من الترويسة، و«نبّهني» يبقى بعد إعادة التحميل', async ({ page }) => {
  await page.goto('/');
  await page.locator('footer').getByRole('link', { name: 'المدونة' }).click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(page.getByRole('heading', { level: 1, name: 'المدونة' })).toBeVisible();
  const notify = page.getByRole('button', { name: /نبّهني عند الإطلاق/ });
  await notify.click();
  await expect(page.getByRole('button', { name: 'سننبّهك عند الإطلاق' })).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.getByRole('button', { name: 'سننبّهك عند الإطلاق' })).toBeVisible();
});

test('حسابات التواصل في التذييل حقيقية، وتلغرام مخفي حتى يُضاف رابطه، ولا روابط ميتة', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');
  await expect(footer.getByRole('link', { name: 'حرف على X' })).toHaveAttribute('href', 'https://x.com/harflibrary');
  await expect(footer.getByRole('link', { name: 'حرف على LinkedIn' })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/company/harflibrary',
  );
  await expect(footer.getByRole('link', { name: 'حرف على Instagram' })).toHaveAttribute(
    'href',
    'https://www.instagram.com/harflibrary/',
  );
  await expect(footer.getByRole('link', { name: 'حرف على Telegram' })).toHaveCount(0);
  await expect(page.locator('a[href="#"]')).toHaveCount(0);
});

test('إعدادات ملفات تعريف الارتباط: من التذييل وسياسة الخصوصية، والاختيار يُحفظ', async ({ page }) => {
  await page.goto('/');
  await page.locator('footer').getByRole('button', { name: 'إعدادات ملفات تعريف الارتباط' }).click();
  const dialog = page.getByRole('dialog', { name: 'إعدادات ملفات تعريف الارتباط' });
  await expect(dialog.getByRole('switch', { name: /الضرورية/ })).toBeDisabled();
  await expect(dialog.getByRole('switch', { name: 'التحليلات' })).not.toBeChecked();
  await dialog.getByRole('switch', { name: 'التحليلات' }).click();
  await dialog.getByRole('button', { name: 'حفظ اختياري' }).click();
  await expect(dialog).toBeHidden();

  await page.goto('/privacy');
  await page.getByRole('main').getByRole('button', { name: 'إعدادات ملفات تعريف الارتباط' }).click();
  await expect(dialog.getByRole('switch', { name: 'التحليلات' })).toBeChecked();
  await expect(dialog.getByRole('switch', { name: 'التسويق' })).not.toBeChecked();
  await dialog.getByRole('button', { name: 'الضرورية فقط' }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('harf_consent')!).analytics)).toBe(false);
  // لا شريط موافقة ما دامت لا أداة غير ضرورية مفعّلة
  await expect(page.getByRole('region', { name: 'ملفات تعريف الارتباط' })).toHaveCount(0);
});
