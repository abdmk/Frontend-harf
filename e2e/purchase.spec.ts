import { expect, test } from './fixtures';

test.describe('رحلة الشراء', () => {
  test('الترخيص ← السلة ← الكود ← الدفع ← نجاح، والسلة تُفرَّغ', async ({ page }) => {
    await page.goto('/fonts/naskh');
    await page.getByRole('button', { name: 'شراء الترخيص' }).click();
    const sheet = page.getByRole('dialog', { name: 'Naskh Hadith' });
    await expect(sheet).toBeVisible();

    // قرار واحد مطلوب: لا إضافة قبل اختيار الاستخدام
    await expect(sheet.getByRole('button', { name: 'اختر الاستخدام أولاً' })).toBeDisabled();
    await sheet.getByRole('button', { name: /موقع إلكتروني/ }).click();
    // الأوزان بافتراض العائلة، ونغيّرها لوزن واحد — الإجمالي يتغيّر أمام العين
    const total = sheet.locator('footer [aria-live]');
    const before = await total.textContent();
    await sheet.getByRole('button', { name: 'تغيير' }).last().click();
    await sheet.getByRole('radio', { name: /وزن واحد/ }).click();
    await expect(total).not.toHaveText(before ?? '');
    // نطاق الاستخدام قابل للتغيير
    await sheet.getByRole('button', { name: 'تغيير' }).first().click();
    await sheet.getByRole('radio', { name: /حتى 100 ألف زيارة/ }).click();

    await sheet.getByRole('button', { name: 'أضف إلى السلة' }).click();
    await expect(page.getByRole('region', { name: 'الإشعارات العابرة' }).getByText('أُضيف إلى السلة')).toBeVisible();
    await expect(page.getByRole('button', { name: 'السلة، عنصر واحد' })).toBeVisible();

    await page.goto('/cart');
    await expect(page.getByRole('main').getByText('Naskh Hadith', { exact: true }).first()).toBeVisible();
    // الكود مطويّ خلف رابط هادئ — لا ينافس زرّ الشراء
    await expect(page.getByLabel('كود الخصم')).toHaveCount(0);
    await page.getByRole('button', { name: 'لديك رمز خصم؟' }).click();
    await page.getByLabel('كود الخصم').fill('nope');
    await page.getByRole('button', { name: 'تطبيق' }).click();
    await expect(page.getByText('هذا الكود غير صالح أو منتهٍ.')).toBeVisible();
    await page.getByLabel('كود الخصم').fill('harf10');
    await page.getByRole('button', { name: 'تطبيق' }).click();
    await expect(page.getByText('(HARF10)')).toBeVisible();

    await page.getByRole('link', { name: 'إتمام الشراء' }).first().click();
    await page.waitForURL('**/checkout');
    await page.getByRole('button', { name: /ادفع/ }).click();
    await expect(page.getByRole('status').getByText('جارٍ الدفع…')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'تمّ الدفع' })).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('button', { name: 'السلة' })).toBeVisible();
  });

  test('الرفض ثم إعادة المحاولة، والتحقّق من الاسم على الخادم', async ({ page }) => {
    await page.goto('/fonts/rawi?license=1');
    const sheet = page.getByRole('dialog', { name: 'Rawi Text' });
    await sheet.getByRole('button', { name: /تصميم ومطبوعات/ }).click();
    await sheet.getByRole('button', { name: 'اشترِ الآن مباشرة' }).click();
    await page.waitForURL('**/checkout');

    await page.getByLabel(/الاسم الكامل/).fill('x');
    await page.getByRole('button', { name: /ادفع/ }).click();
    await expect(page.getByText('اكتب الاسم الكامل أو اسم الشركة.')).toBeVisible({ timeout: 8000 });

    await page.getByLabel(/الاسم الكامل/).fill('استوديو حرف');
    await page.getByRole('checkbox', { name: /محاكاة رفض/ }).click();
    await page.getByRole('button', { name: /ادفع/ }).click();
    await expect(page.getByRole('heading', { name: 'تعذّر إتمام الدفع' })).toBeVisible({ timeout: 8000 });
    await page.getByRole('button', { name: 'أعد المحاولة' }).click();
    await expect(page.getByRole('button', { name: /ادفع/ })).toBeVisible();
  });

  test('السلة بعدّة خطوط: الحذف يُتراجع عنه، والمجموع يتبع', async ({ page }) => {
    await page.addInitScript(() => {
      if (sessionStorage.getItem('seeded')) return;
      sessionStorage.setItem('seeded', '1');
      localStorage.setItem(
        'harf_cart',
        JSON.stringify({
          items: ['naskh', 'thuluth', 'rawi'].map((fontId, i) => ({
            id: `cartitem${i}`,
            selection: { fontId, package: 'family', uses: { desktop: 'd2' } },
          })),
        }),
      );
    });
    await page.goto('/cart');
    const list = page.getByRole('list', { name: 'خطوط السلة' });
    await expect(list.getByRole('listitem')).toHaveCount(3);
    await expect(page.getByText('(3 خطوط)')).toBeVisible();
    await list.getByRole('button', { name: 'حذف Rawi Text' }).click();
    await expect(list.getByRole('listitem')).toHaveCount(2);
    await expect(page.getByText('(خطّان)')).toBeVisible();
    await page.getByRole('region', { name: 'الإشعارات العابرة' }).getByRole('button', { name: 'تراجع' }).click();
    await expect(list.getByRole('listitem')).toHaveCount(3);
    await expect(list.getByRole('heading', { name: 'Rawi Text' })).toBeVisible();
  });

  test('السلة ترفض اختياراً مزوّراً وكوكي معدّلاً', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'harf_cart',
        value: '{"items":[{"id":"x","selection":{"fontId":"naskh","package":"family","uses":{},"cents":1}}]}',
        url: 'http://localhost:3200',
      },
    ]);
    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: 'سلتك فارغة' })).toBeVisible();
  });

  test('بطاقة الخط المدفوع تفتح لوحة الترخيص في صفحته', async ({ page }) => {
    await page.goto('/?license=paid');
    await page.getByRole('link', { name: 'شراء ترخيص Naskh Hadith' }).click();
    await expect(page.getByRole('dialog', { name: 'Naskh Hadith' })).toBeVisible();
  });
});
