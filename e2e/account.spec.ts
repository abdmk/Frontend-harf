import { expect, test } from './fixtures';

test.describe('الحساب', () => {
  test('الإشعارات وقائمة الحساب للمستخدم المجاني', async ({ page }) => {
    await page.goto('/?as=free');
    const bell = page.locator('button[aria-label^="الإشعارات"]');
    await bell.click();
    await page.getByRole('button', { name: 'تعليم الكل كمقروء' }).click();
    await expect(bell).toHaveAttribute('aria-label', 'الإشعارات');
    await page.keyboard.press('Escape');

    await page.locator('button[aria-label^="حساب"]').click();
    await expect(page.getByRole('navigation', { name: 'قائمة الحساب' })).toBeVisible();
    await expect(page.getByText('تريد تنشر أعمالك؟')).toBeVisible();
    await expect(page.locator('a[href="/account/foundry"]')).toHaveCount(0);
  });

  test('«إدارة الخطة» في القائمة يفتح نافذة الخطط مباشرة', async ({ page }) => {
    await page.goto('/?as=free');
    await page.locator('button[aria-label^="حساب"]').click();
    await page.getByRole('button', { name: 'إدارة الخطة' }).click();
    const dialog = page.getByRole('dialog', { name: 'اختر خطتك' });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'قائمة الحساب' })).toHaveCount(0);

    await dialog.getByRole('button', { name: 'ابدأ الأساسية' }).click();
    await page.getByRole('button', { name: 'اشترك الآن' }).click();
    await expect(page.getByText('أنت الآن على خطة الأساسية')).toBeVisible({ timeout: 8000 });
    await page.getByRole('button', { name: 'تمّ' }).click();
    await expect(page.getByRole('link', { name: 'خطّتك: أساسي' })).toBeVisible();
  });

  test('حالة الاستخدام: الحدّ النافد يعرض الترقية ويفتح نافذة الخطط', async ({ page }) => {
    await page.goto('/account/usage?as=free');
    await expect(page.getByRole('heading', { level: 1, name: 'حالة الاستخدام' })).toBeVisible();
    await expect(page.getByText('استُخدمت جميع التحميلات المتاحة')).toBeVisible();
    await expect(page.getByText('المتبقّي: مطابقة واحدة')).toBeVisible();
    await expect(page.getByRole('meter', { name: 'تحميل الخطوط' })).toHaveAttribute('aria-valuenow', '5');
    await expect(page.getByRole('button', { name: 'ترقية الخطة' })).toHaveCount(1);
    await page.getByRole('button', { name: 'ترقية الخطة' }).click();
    await expect(page.getByRole('dialog', { name: 'اختر خطتك' })).toBeVisible();
  });

  test('لوحة المسبك محميّة على الخادم للحساب المجاني', async ({ page }) => {
    await page.goto('/account/foundry?as=free');
    await expect(page).toHaveURL(/\/account\/subscription$/);
  });

  // ⚠️ يتطلّب خادماً حقيقياً: ملف ثابت (SPA) يعيد 200 لأي مسار؛ القسم غير المعروف يُعاد توجيهه
  // على العميل إلى /account (Navigate)، لا حجب على مستوى HTTP كما في الاختبار.
  test.fixme('قسم غير معروف يعيد 404', async ({ page }) => {
    const res = await page.goto('/account/nope');
    expect(res?.status()).toBe(404);
  });

  test('الاستوديو: لوحة المسبك مباشرة، رفع ملف، ثم تسجيل الخروج', async ({ page }) => {
    await page.goto('/account/foundry?as=studio');
    await expect(page).toHaveURL(/\/studio$/);

    await page.goto('/design-system');
    await page.getByRole('button', { name: 'افتح نافذة «تحميل الملفات»' }).click();
    await page.setInputFiles('input[type=file]', [
      { name: 'Zaetoon.zip', mimeType: 'application/zip', buffer: Buffer.alloc(4096) },
    ]);
    await expect(page.getByRole('dialog').getByText('مكتمل')).toBeVisible({ timeout: 8000 });
    await page.keyboard.press('Escape');
    // ننتظر إغلاق النافذة وعودة التركيز قبل فتح القائمة
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.locator('button[aria-label^="حساب"]').click();
    await page.getByRole('dialog').getByRole('button', { name: 'تسجيل خروج' }).click();
    await page.waitForURL('/');
  });

  test('المظهر وموضع الإشعارات ببطاقات المعاينة، ويبقيان بعد إعادة التحميل', async ({ page }) => {
    await page.goto('/account/preferences?as=free');
    await page.getByRole('radio', { name: 'داكن' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.getByRole('radio', { name: 'أسفل اليسار' }).click();
    const region = page.getByRole('region', { name: 'الإشعارات العابرة' });
    await expect(region).toHaveAttribute('data-position', 'end');
    await expect(region.getByText('هنا تظهر الإشعارات')).toBeVisible();
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.getByRole('radio', { name: 'أسفل اليسار' })).toBeChecked();
    await expect(page.getByRole('region', { name: 'الإشعارات العابرة' })).toHaveAttribute('data-position', 'end');
  });
});

test('تعديل الاسم يظهر فوراً في الترويسة والقائمة، ويبقى بعد إعادة التحميل', async ({ page }) => {
  await page.goto('/account/profile?as=free');
  const name = page.getByLabel('الاسم', { exact: true });
  await name.fill('ريم سالم');
  await page.getByRole('button', { name: 'حفظ التغييرات' }).click();
  // الترويسة (زرّ الحساب) والبطاقة في الصفحة من المصدر نفسه — بلا إعادة تحميل
  await expect(page.getByRole('button', { name: 'حساب ريم سالم' })).toBeVisible();
  await expect(page.getByText('ريم سالم').first()).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'حساب ريم سالم' })).toBeVisible();
  await page.getByRole('button', { name: 'حساب ريم سالم' }).click();
  await expect(page.getByRole('dialog').getByText('ريم سالم')).toBeVisible();
});
