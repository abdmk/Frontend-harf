import { expect, test } from './fixtures';

test.describe('لوحة الإدارة', () => {
  test('الحارس: غير المسجَّل للدخول، وغير المشرف يرى 404', async ({ page }) => {
    await page.goto('/admin/fonts?as=out');
    await expect(page).toHaveURL(/\/login\?next=%2Fadmin%2Ffonts/);
    await page.goto('/admin?as=studio');
    await expect(page.getByRole('heading', { name: 'الصفحة غير موجودة' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'أقسام الإدارة' })).toHaveCount(0);
  });

  test('التنقّل: خمسة أقسام، وعدد المراجعة على القائمة', async ({ page }) => {
    await page.goto('/admin?as=admin');
    const nav = page.getByRole('navigation', { name: 'أقسام الإدارة' }).first();
    for (const name of ['الرئيسية', 'المراجعة', 'مخزن الخطوط', 'المحتوى', 'التحليلات'])
      await expect(nav.getByRole('link', { name: new RegExp(name) })).toBeVisible();
    await expect(nav.getByLabel('5 بانتظار المراجعة')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'يحتاج انتباهك' })).toBeVisible();
    await nav.getByRole('link', { name: /مخزن الخطوط/ }).click();
    await expect(page).toHaveURL(/\/admin\/fonts$/);
    await expect(page.getByRole('heading', { level: 1, name: 'مخزن الخطوط' })).toBeVisible();
  });

  test('المراجعة: الرفض يتطلّب سبباً، والقبول ينقل للطلب التالي ويُسجَّل', async ({ page }) => {
    await page.goto('/admin/review?as=admin');
    // الأقدم أولاً
    await expect(page.getByRole('list', { name: 'طلبات المراجعة' }).getByRole('listitem').first()).toContainText(
      'Naqsh',
    );
    await page.goto('/admin/review/REV-4837');
    await page.getByRole('radio', { name: /رفض/ }).click();
    await page.getByRole('button', { name: 'تأكيد: رفض' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'اكتب سبباً واضحاً' })).toBeVisible();
    await page.getByRole('button', { name: 'لم يُرفق الترخيص أو إقرار ملكية التصميم.' }).click();
    await page.getByRole('button', { name: 'تأكيد: رفض' }).click();
    // ينتقل إلى الأقدم التالي
    await expect(page).toHaveURL(/\/admin\/review\/REV-4821$/);

    await page.getByRole('radio', { name: /قبول ونشر/ }).click();
    await page.getByRole('button', { name: 'تأكيد: قبول ونشر' }).click();
    await expect(page).toHaveURL(/\/admin\/review\/REV-4830$/);

    await page.goto('/admin/review');
    await page.getByRole('button', { name: /مرفوضة 1/ }).click();
    await expect(page.getByText('Kalima Display')).toBeVisible();

    // سجلّ النشاط في الرئيسية
    await page.goto('/admin');
    await expect(page.getByText('قبول خط')).toBeVisible();
    await expect(page.getByText('رفض خط')).toBeVisible();
  });

  test('مخزن الخطوط: الإخفاء يُخرج الخط من الموقع، والحذف يتطلّب الاسم ويُسترجع', async ({ page }) => {
    await page.goto('/admin/fonts?as=admin');
    await page.getByRole('searchbox', { name: 'بحث في الخطوط' }).fill('Cairo');
    await page.getByRole('switch', { name: 'ظهور Cairo' }).click();
    await expect(page.getByRole('switch', { name: 'ظهور Cairo' })).not.toBeChecked();

    // صفحة الخط المخفي غير متاحة للزوّار: تعيد إلى المكتبة
    await page.goto('/fonts/cairo');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('link', { name: /^Cairo/ })).toHaveCount(0);

    await page.goto('/admin/fonts/cairo');
    await page.getByRole('button', { name: 'إظهار' }).click();
    await page.getByRole('button', { name: 'حذف', exact: true }).click();
    const dlg = page.getByRole('dialog', { name: /حذف «Cairo»/ });
    await expect(dlg.getByRole('button', { name: 'حذف الخط' })).toBeDisabled();
    await dlg.getByRole('textbox').fill('Cairo');
    await dlg.getByRole('button', { name: 'حذف الخط' }).click();
    await expect(page.getByRole('button', { name: 'استرجاع' })).toBeVisible();

    await page.goto('/admin/fonts');
    await page.getByRole('button', { name: /المحذوفة 1/ }).click();
    await expect(page.getByRole('link', { name: 'Cairo' })).toBeVisible();
    await page.getByRole('button', { name: 'إجراءات Cairo' }).click();
    await page.getByRole('menuitem', { name: 'استرجاع' }).click();
    await page.goto('/fonts/cairo');
    await expect(page.getByRole('heading', { level: 1 }).first()).toContainText('Cairo');
  });

  test('مخزن الخطوط: التعديل يتحقّق من القيم ويظهر في الموقع', async ({ page }) => {
    await page.goto('/admin/fonts/tajawal?as=admin');
    await page.getByRole('button', { name: 'تعديل' }).click();
    const dlg = page.getByRole('dialog', { name: 'تعديل الخط' });
    await dlg.getByLabel('الاسم').fill('T');
    await dlg.getByRole('button', { name: 'حفظ' }).click();
    await expect(dlg.getByText('الاسم قصير جداً.')).toBeVisible();
    await dlg.getByLabel('الاسم').fill('Tajawal Pro');
    await dlg.getByRole('button', { name: 'حفظ' }).click();
    await expect(dlg).toBeHidden();
    await page.goto('/fonts/tajawal');
    await expect(page.getByRole('heading', { level: 1 }).first()).toContainText('Tajawal Pro');
  });

  test('المحتوى: شريط الإعلان ونصوص الدعوة تظهر في الموقع، والرابط غير الآمن مرفوض', async ({ page }) => {
    await page.goto('/admin/content?as=admin');
    const bar = page.getByRole('region', { name: 'إعلان' });
    const section = page.locator('section').filter({ hasText: 'شريط الإعلان' });
    await section.getByRole('switch').click();
    await section.getByLabel('النص').fill('خصم 30% على الخطة السنوية');
    await section.getByLabel('الرابط (اختياري)').fill('javascript:alert(1)');
    await section.getByRole('button', { name: 'حفظ' }).click();
    await expect(section.getByText('رابط داخلي يبدأ بـ«/» أو رابط https فقط.')).toBeVisible();
    await section.getByLabel('الرابط (اختياري)').fill('/account/subscription');
    await section.getByRole('button', { name: 'حفظ' }).click();

    const cta = page.locator('section').filter({ hasText: 'دعوة التواصل' });
    await cta.getByLabel('العنوان').fill('خط خاص بهويتك؟');
    await cta.getByRole('button', { name: 'حفظ' }).click();

    await page.goto('/');
    await expect(bar).toContainText('خصم 30% على الخطة السنوية');
    await expect(bar.getByRole('link', { name: 'التفاصيل' })).toHaveAttribute('href', '/account/subscription');
    await expect(page.getByRole('heading', { name: 'خط خاص بهويتك؟' })).toBeVisible();
  });

  test('المحتوى: بنر جديد يُعاد ترميزه ويظهر في الشريحة، وSVG مرفوض', async ({ page }) => {
    await page.goto('/admin/content?as=admin');
    const banners = page.locator('section').filter({ hasText: 'بنرات الصفحة الرئيسية' });
    const input = banners.locator('input[type=file]');

    await input.setInputFiles({
      name: 'x.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'),
    });
    await expect(banners.getByText('الصيغ المقبولة: PNG أو JPG أو WebP.')).toBeVisible();

    // صورة PNG حقيقية بمقاس مناسب تُصنع في المتصفّح
    const b64 = await page.evaluate(() => {
      const c = document.createElement('canvas');
      c.width = 1120;
      c.height = 290;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = 'rgb(220 40 40)';
      ctx.fillRect(0, 0, 1120, 290);
      return c.toDataURL('image/png').split(',')[1]!;
    });
    await input.setInputFiles({ name: 'banner.png', mimeType: 'image/png', buffer: Buffer.from(b64, 'base64') });
    await banners.getByRole('button', { name: 'حفظ البنرات' }).click();
    await expect(banners.getByText('صف الصورة لقارئ الشاشة (3 أحرف على الأقل).')).toBeVisible();
    await banners.getByLabel('وصف الصورة').fill('عرض الخطوط الجديدة');
    await banners.getByRole('button', { name: 'حفظ البنرات' }).click();
    await expect(banners.getByText('تغييرات غير محفوظة')).toHaveCount(0);

    await page.goto('/');
    const img = page.getByRole('img', { name: 'عرض الخطوط الجديدة' });
    await expect(img).toBeVisible();
    expect(await img.getAttribute('src')).toMatch(/^data:image\/jpeg;base64,/);
  });
});
