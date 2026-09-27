import { expect, test } from './fixtures';

test.describe('الاستوديو والإدارة', () => {
  test('لوحة المسبك للاستوديو فقط', async ({ page }) => {
    await page.goto('/studio?as=free');
    await expect(page).toHaveURL(/\/account\/subscription$/);
    await page.goto('/studio?as=studio');
    await expect(page.getByRole('heading', { level: 1, name: 'مسبك تجاريب' })).toBeVisible();
    await expect(page.getByText('$1,284.50')).toBeVisible();
  });

  test('التحليلات مخفية عن غير المشرف، والتصدير كذلك', async ({ page, request }) => {
    const res = await page.goto('/admin/analytics?as=basic');
    expect(res?.status()).toBe(404);
    const csv = await request.get('/admin/analytics/export', { headers: { cookie: 'harf_demo_as=free' } });
    expect(csv.status()).toBe(404);
  });

  test('المشرف: التبويبات، الفلتر، والتصدير', async ({ page, request }) => {
    await page.goto('/admin/analytics?as=studio');
    await expect(page.getByRole('heading', { level: 1, name: 'التحليلات' })).toBeVisible();
    await page.getByRole('tab', { name: 'المستخدمون' }).click();
    await page.getByRole('searchbox').fill('zzz-nobody');
    await expect(page.getByRole('heading', { name: 'لا نتائج مطابقة' })).toBeVisible();
    await page.getByRole('tab', { name: 'المبيعات' }).click();
    await page.getByRole('button', { name: 'اشتراكات' }).click();
    await expect(page.getByRole('cell', { name: 'T-1042' })).toHaveCount(0);
    const csv = await request.get('/admin/analytics/export?range=7', { headers: { cookie: 'harf_demo_as=studio' } });
    expect(csv.status()).toBe(200);
    expect(csv.headers()['content-type']).toContain('text/csv');
  });

  test('مساحة النشر: النواقص مسمّاة ثم إرسال ناجح', async ({ page }) => {
    await page.goto('/studio/publish?as=studio');
    await page.getByRole('button', { name: 'إرسال للمراجعة' }).first().click();
    await expect(page.getByText('ارفع ملف خط واحداً على الأقل.')).toBeVisible();

    await page.getByRole('button', { name: /الملفات/ }).click();
    await page.locator('input[type=file]').setInputFiles([
      { name: 'Tufula-Regular.otf', mimeType: 'font/otf', buffer: Buffer.alloc(2048) },
      { name: 'Tufula-Bold.otf', mimeType: 'font/otf', buffer: Buffer.alloc(2048) },
    ]);
    await expect(page.getByRole('cell', { name: '700 Bold' })).toBeVisible();

    await page.getByRole('button', { name: /الصور/ }).click();
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    );
    await page.locator('input[type=file]').setInputFiles([{ name: 'cover.png', mimeType: 'image/png', buffer: png }]);
    await expect(page.getByText('الغلاف')).toBeVisible();

    await page.getByRole('button', { name: /المعلومات/ }).click();
    await page.getByLabel(/الاسم بالعربية/).fill('طفولة');
    await page.getByLabel(/المصمّمون/).fill('عبدالملك جاسم');
    await page.getByRole('group', { name: 'التصنيف' }).getByRole('button', { name: 'عناوين' }).click();
    await page.getByRole('group', { name: 'اللغات' }).getByRole('button', { name: 'العربية' }).click();

    await page.getByRole('button', { name: /المراجعة/ }).click();
    await page.getByRole('checkbox').click();
    await page.getByRole('button', { name: 'إرسال للمراجعة' }).last().click();
    await expect(page.getByRole('heading', { name: 'أُرسل الخط للمراجعة' })).toBeVisible();
  });
});
