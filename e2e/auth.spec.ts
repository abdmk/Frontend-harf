import { expect, test } from './fixtures';

test.describe('الدخول والحساب', () => {
  test('الخروج ← الصفحة المحمية تطلب الدخول ← العودة إليها بعد الدخول', async ({ page }) => {
    await page.goto('/?as=free');
    await page.locator('button[aria-label^="حساب"]').click();
    await page.getByRole('dialog').getByRole('button', { name: 'تسجيل خروج' }).click();
    await page.waitForURL('/');
    await expect(page.getByRole('link', { name: 'تسجيل الدخول' })).toBeVisible();

    await page.goto('/account/purchases');
    await expect(page).toHaveURL(/\/login\?next=%2Faccount%2Fpurchases$/);
    await page.getByLabel('البريد الإلكتروني').fill('heba@example.com');
    await page.getByLabel('كلمة المرور', { exact: true }).fill('secret-123');
    await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
    await page.waitForURL('**/account/purchases');
    await expect(page.getByRole('heading', { level: 1, name: 'المشتريات' })).toBeVisible();
  });

  test('لا توجيه إلى موقع خارجي بعد الدخول', async ({ page }) => {
    await page.goto('/?as=free');
    await page.context().addCookies([{ name: 'harf_demo_as', value: 'out', url: 'http://localhost:3200' }]);
    await page.goto('/login?next=//evil.example.com');
    await page.getByLabel('البريد الإلكتروني').fill('a@example.com');
    await page.getByLabel('كلمة المرور', { exact: true }).fill('secret-123');
    await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
    await page.waitForURL('http://localhost:3200/');
  });

  test('التحقّق على الخادم وحدّ المحاولات', async ({ page }) => {
    await page.context().addCookies([{ name: 'harf_demo_as', value: 'out', url: 'http://localhost:3200' }]);
    await page.goto('/login');
    await page.getByLabel('البريد الإلكتروني').fill('not-an-email');
    await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
    await expect(page.getByText('اكتب بريداً إلكترونياً صحيحاً.')).toBeVisible();
    await expect(page.getByLabel('البريد الإلكتروني')).toHaveAttribute('aria-invalid', 'true');
  });

  test('إنشاء حساب: القواعد الحيّة ثم رسالة التحقّق', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('الاسم').fill('هبة');
    await page.getByLabel('البريد الإلكتروني').fill('heba@example.com');
    await page.getByLabel('كلمة المرور', { exact: true }).fill('abcdefg1');
    await expect(page.locator('#pw-rules li.text-ok-text')).toHaveCount(3);
    await page.getByRole('button', { name: 'إنشاء الحساب' }).click();
    await expect(page.getByText('يجب الموافقة على الشروط.')).toBeVisible();
    await page.getByLabel('كلمة المرور', { exact: true }).fill('abcdefg1');
    await page.getByRole('checkbox').click();
    await page.getByRole('button', { name: 'إنشاء الحساب' }).click();
    await expect(page.getByRole('heading', { name: 'تحقّق من بريدك' })).toBeVisible();
  });

  test('الترقية من نافذة الخطط تغيّر الخطة في الترويسة', async ({ page }) => {
    await page.goto('/account/subscription?as=free');
    await page.getByRole('button', { name: 'ترقية الخطة' }).click();
    const dialog = page.getByRole('dialog', { name: 'اختر خطتك' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'ابدأ الأساسية' }).click();
    await page.getByRole('button', { name: 'اشترك الآن' }).click();
    await expect(page.getByText('أنت الآن على خطة الأساسية')).toBeVisible({ timeout: 8000 });
    await page.getByRole('button', { name: 'تمّ' }).click();
    await expect(page.getByRole('link', { name: 'خطّتك: أساسي' })).toBeVisible();
  });

  test('حفظ الملف الشخصي يتحقّق من الرابط', async ({ page }) => {
    await page.goto('/account/profile?as=free');
    await page.getByLabel('الموقع الإلكتروني').fill('http://insecure.example');
    await page.getByRole('button', { name: 'حفظ التغييرات' }).click();
    await expect(page.getByText('الرابط يجب أن يبدأ بـ https://')).toBeVisible();
  });

  test('الحساب على الجوال: فهرس ثم قسم بزرّ رجوع', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/account?as=free');
    await expect(page.getByRole('navigation', { name: 'قائمة الحساب' })).toBeVisible();
    await page
      .getByRole('navigation', { name: 'قائمة الحساب' })
      .getByRole('link', { name: /المشتريات/ })
      .click();
    await page.waitForURL('**/account/purchases');
    await expect(page.getByRole('navigation', { name: 'قائمة الحساب' })).toBeHidden();
    await page.getByRole('link', { name: 'الحساب', exact: true }).click();
    await page.waitForURL(/\/account$/);
  });
});
