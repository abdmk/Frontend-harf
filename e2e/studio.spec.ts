import { expect, test } from './fixtures';

test.describe('الاستوديو والإدارة', () => {
  test('لوحة المسبك للاستوديو فقط', async ({ page }) => {
    await page.goto('/studio?as=free');
    await expect(page).toHaveURL(/\/account\/subscription$/);
    await page.goto('/studio?as=studio');
    await expect(page.getByRole('heading', { level: 1, name: 'مسبك تجاريب' })).toBeVisible();
    await expect(page.getByText('$1,284.50')).toBeVisible();
  });

  // ⚠️ يتطلّب خادماً حقيقياً: ملف ثابت (SPA) يعيد 200 لأي مسار — حماية الصفحة والتصدير هنا
  // على العميل فقط (التوجيه للدخول والتحقّق من الدور)، لا حجب على مستوى HTTP كما في الاختبار.
  test.fixme('التحليلات مخفية عن غير المشرف، والتصدير كذلك', async ({ page, request }) => {
    const res = await page.goto('/admin/analytics?as=basic');
    expect(res?.status()).toBe(404);
    const csv = await request.get('/admin/analytics/export', { headers: { cookie: 'harf_demo_as=free' } });
    expect(csv.status()).toBe(404);
  });

  test('قائمة الحساب: «رفع خط» للاستوديو، و«لوحة الإدارة» للمشرف وحده', async ({ page }) => {
    await page.goto('/?as=studio');
    await page.getByRole('button', { name: /^حساب/ }).click();
    const menu = page.getByRole('dialog');
    await expect(menu.getByRole('link', { name: 'لوحة الإدارة' })).toHaveCount(0);
    await menu.getByRole('link', { name: 'رفع خط' }).click();
    await expect(page).toHaveURL(/\/studio\/publish$/);

    await page.goto('/?as=admin');
    await page.getByRole('button', { name: /^حساب/ }).click();
    await expect(page.getByRole('dialog').getByRole('link', { name: 'لوحة الإدارة' })).toBeVisible();
  });

  test('المشرف: التبويبات، الفلتر، والتصدير', async ({ page }) => {
    await page.goto('/admin/analytics?as=admin');
    await expect(page.getByRole('heading', { level: 1, name: 'التحليلات' })).toBeVisible();
    await page.getByRole('tab', { name: 'المستخدمون' }).click();
    await page.getByRole('searchbox').fill('zzz-nobody');
    await expect(page.getByRole('heading', { name: 'لا نتائج مطابقة' })).toBeVisible();
    await page.getByRole('tab', { name: 'المبيعات' }).click();
    await page.getByRole('button', { name: 'اشتراكات' }).click();
    await expect(page.getByRole('cell', { name: 'T-1042' })).toHaveCount(0);

    // التصدير في هذا الـSPA تنزيل من العميل مباشرة (Blob)، لا طلب خادم — نتحقّق من حدث التنزيل
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'تصدير CSV' }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });

  test('مساحة النشر: «التالي» يسمّي النواقص، والمراجعة تعرض المُدخل ثم إرسال ناجح', async ({ page }) => {
    await page.goto('/studio/publish?as=studio');
    await expect(page.getByText('الخطوة 1 من 5')).toBeVisible();
    // «التالي» بلا ملفات: يسمّي الناقص ولا يتقدّم
    await page.getByRole('button', { name: 'التالي: الصور' }).click();
    await expect(page.getByText('ارفع ملف خط واحداً على الأقل.')).toBeVisible();
    await expect(page.getByText('الخطوة 1 من 5')).toBeVisible();

    await page.locator('input[type=file]').setInputFiles([
      { name: 'Tufula-Regular.otf', mimeType: 'font/otf', buffer: Buffer.alloc(2048) },
      { name: 'Tufula-Bold.otf', mimeType: 'font/otf', buffer: Buffer.alloc(2048) },
    ]);
    await expect(page.getByText('700 Bold')).toBeVisible();
    await page.getByRole('button', { name: 'التالي: الصور' }).click();

    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    );
    await page.locator('input[type=file]').setInputFiles([{ name: 'cover.png', mimeType: 'image/png', buffer: png }]);
    await expect(page.getByText('الغلاف')).toBeVisible();
    await page.getByRole('button', { name: 'التالي: المعلومات' }).click();

    await page.getByLabel(/الاسم بالعربية/).fill('طفولة');
    await page.getByLabel(/المصمّمون/).fill('عبدالملك جاسم');
    await page.getByRole('group', { name: 'التصنيف' }).getByRole('button', { name: 'عناوين' }).click();
    await page.getByRole('group', { name: 'اللغات' }).getByRole('button', { name: 'العربية' }).click();
    await page.getByRole('button', { name: 'التالي: الإتاحة' }).click();
    await page.getByRole('button', { name: 'التالي: المراجعة' }).click();

    // المراجعة تعرض ما أُدخل، والإرسال بلا إقرار يسمّيه
    await expect(page.getByText('كل شيء جاهز')).toBeVisible();
    await expect(page.getByRole('definition').filter({ hasText: 'عبدالملك جاسم' })).toBeVisible();
    await page.getByRole('button', { name: 'إرسال للمراجعة' }).click();
    await expect(page.getByText('أقرّ بملكية الحقوق قبل الإرسال.')).toBeVisible();
    await page.getByRole('checkbox').click();
    await page.getByRole('button', { name: 'إرسال للمراجعة' }).click();
    await expect(page.getByRole('heading', { name: 'أُرسل الخط للمراجعة' })).toBeVisible();
  });

  test('المصمّم والمسبك: من صفحة الخط إلى ملف المصمّم ثم مسبكه ومصمّميه', async ({ page }) => {
    await page.goto('/fonts/zaetoon');
    await page
      .getByRole('link', { name: /Abdulmlik Jassim/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/designers\/aj$/);
    await expect(page.getByRole('heading', { level: 1, name: 'عبدالملك جاسم' })).toBeVisible();
    // الصفحة الجديدة تبدأ من أعلاها
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.getByRole('heading', { name: /خطوط المصمّم/ })).toContainText('(4)');

    await page.getByRole('link', { name: /ينشر مع/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'مسبك تجاريب' })).toBeVisible();
    await page.getByRole('link', { name: 'سارة نبيل' }).click();
    await expect(page).toHaveURL(/\/designers\/sn$/);
  });
});
