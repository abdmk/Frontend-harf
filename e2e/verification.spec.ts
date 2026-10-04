import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';

/** صورة PNG حقيقية تُرسم في المتصفّح — كوثيقة هوية تجريبية */
async function pngFile(page: Page) {
  const b64 = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 1000;
    c.height = 640;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = 'lightsteelblue';
    ctx.fillRect(0, 0, 1000, 640);
    return c.toDataURL('image/png').split(',')[1]!;
  });
  return { name: 'id.png', mimeType: 'image/png', buffer: Buffer.from(b64, 'base64') };
}

test.describe('توثيق الحساب', () => {
  test('ناشر جديد: لا نشر قبل التوثيق، ثم الخطوات الخمس، ثم المجاني فقط حتى الاعتماد', async ({ page }) => {
    await page.goto('/studio/publish?as=newstudio');
    await expect(page.getByRole('heading', { name: 'قبل أوّل نشر: وثّق حسابك' })).toBeVisible();
    await page.getByRole('link', { name: 'ابدأ التوثيق' }).click();
    await expect(page).toHaveURL(/\/studio\/verify$/);
    await page.getByRole('button', { name: 'ابدأ التوثيق' }).click();

    // 1. البيانات — التالي يُظهر النواقص
    await expect(page.getByText('الخطوة 1 من 5')).toBeVisible();
    await page.getByRole('button', { name: /وثائق الهوية/ }).click();
    await expect(page.getByText(/الاسم الكامل كما في الوثيقة/)).toBeVisible();
    await page.getByLabel('الاسم القانوني الكامل').fill('هبة عبدالحميد علي');
    await page.getByLabel('الدولة').click();
    await page.getByRole('option', { name: 'العراق' }).click();
    await page.getByLabel('المدينة').fill('بغداد');
    await page.getByRole('button', { name: /وثائق الهوية/ }).click();

    // 2. الوثائق — SVG مرفوض، والصورة تُعاد ترميزها
    await expect(page.getByText('الخطوة 2 من 5')).toBeVisible();
    const uploads = page.locator('input[type=file]:not([capture])');
    await uploads.nth(0).setInputFiles({
      name: 'x.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
    });
    await expect(page.getByRole('alert').first()).toBeVisible();
    const img = await pngFile(page);
    await uploads.nth(0).setInputFiles(img);
    await expect(page.getByRole('img', { name: 'الوجه الأمامي — مرفوعة' })).toBeVisible();
    await page.locator('input[type=file]:not([capture])').nth(1).setInputFiles(img);
    await expect(page.getByRole('img', { name: 'الوجه الخلفي — مرفوعة' })).toBeVisible();
    await page.getByRole('button', { name: /استلام الأرباح/ }).click();

    // 3. الاستلام: كي كارد (العراق) + رمز التأكيد
    // النموذج في الصفحة مباشرة — خطوة واحدة بلا نافذة
    const dlg = page.getByRole('main');
    await dlg.getByRole('radio', { name: /كي كارد/ }).click();
    await dlg.getByLabel('الاسم على البطاقة').fill('هبة عبدالحميد');
    await dlg.getByLabel('رقم بطاقة كي كارد').fill('4111 1111 1111 1111');
    await dlg.getByRole('checkbox').click();
    await dlg.getByRole('button', { name: 'متابعة' }).click();
    await page.getByLabel('الرقم 1 من 6').fill('246810');
    await page.getByRole('button', { name: 'تأكيد وحفظ' }).click();
    await expect(page.getByText('كي كارد •••• 1111')).toBeVisible();
    await page.getByRole('button', { name: /اتفاقية الناشر/ }).click();

    // 4. الاتفاقية: 35٪ واضحة، والتوقيع يتطلّب الإقرار
    await expect(page.getByText(/تستقطع حرف 35٪ من قيمة كل عملية بيع/)).toBeVisible();
    await page.getByRole('checkbox', { name: /صحيحة وكاملة/ }).click();
    await page.getByRole('checkbox', { name: /قرأت اتفاقية الناشر/ }).click();
    await page.getByRole('button', { name: 'وقّع الاتفاقية' }).click();
    const sign = page.getByRole('dialog', { name: 'توقيع الاتفاقية' });
    await sign.getByRole('button', { name: 'اكتب اسمك' }).click();
    await sign.getByRole('button', { name: 'وقّع الاتفاقية' }).click();
    await expect(sign.getByText('أكّد موافقتك على البنود قبل التوقيع.')).toBeVisible();
    await sign.getByRole('switch').click();
    await sign.getByRole('button', { name: 'وقّع الاتفاقية' }).click();
    await expect(sign).toBeHidden();
    await expect(page.getByText(/وقّعها هبة عبدالحميد علي/)).toBeVisible();
    await page.getByRole('button', { name: /مراجعة التفاصيل/ }).click();

    // 5. المراجعة والإرسال
    await expect(page.getByText('الخطوة 5 من 5')).toBeVisible();
    await expect(page.getByText('2 من 2')).toBeVisible();
    await page.getByRole('button', { name: 'إرسال للمراجعة' }).click();
    await expect(page.getByRole('heading', { name: 'طلبك قيد المراجعة' })).toBeVisible();

    // لا شيء حسّاس كامل في التخزين
    const stored = await page.evaluate(() => localStorage.getItem('harf_studio_verification_v2') ?? '');
    expect(stored).not.toContain('4111111111111111');

    // قيد المراجعة: النشر متاح للمجاني فقط
    await page.goto('/studio/publish');
    await expect(page.getByRole('heading', { name: 'قبل أوّل نشر: وثّق حسابك' })).toHaveCount(0);
  });

  test('الإدارة: الرفض يتطلّب سبباً يصل للناشر، والاعتماد يفتح البيع', async ({ page }) => {
    await page.goto('/admin/requests?type=studios&as=admin');
    const nav = page.getByRole('navigation', { name: 'أقسام الإدارة' }).first();
    await expect(nav.getByLabel('7 بانتظار قرارك')).toBeVisible();
    await page.getByRole('list', { name: 'طلبات التوثيق' }).getByRole('link', { name: 'راجِع' }).first().click();
    await expect(page.getByRole('heading', { level: 1, name: 'استوديو نون' })).toBeVisible();
    await expect(page.getByText('كي كارد •••• 4410')).toBeVisible();

    await page.getByRole('button', { name: 'رفض' }).click();
    const dlg = page.getByRole('dialog', { name: /رفض توثيق/ });
    await expect(dlg.getByRole('button', { name: 'رفض الطلب' })).toBeDisabled();
    await dlg.getByLabel('السبب').fill('صورة الوجه الخلفي غير واضحة، أعد تصويرها.');
    await dlg.getByRole('button', { name: 'رفض الطلب' }).click();
    await expect(page.getByText(/سبب الرفض:/)).toBeVisible();

    await page.goto('/admin/requests?type=studios');
    await page.getByRole('list', { name: 'طلبات التوثيق' }).getByRole('link', { name: 'راجِع' }).first().click();
    await page.getByRole('button', { name: 'اعتماد الاستوديو' }).click();
    await expect(page.getByText(/اعتُمد «Raqam Type»/)).toBeVisible();
    await expect(nav.getByLabel('5 بانتظار قرارك')).toBeVisible();
  });
});
