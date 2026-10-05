import { expect, test } from './fixtures';

test.describe('لوحة الإدارة', () => {
  test('الحارس: غير المسجَّل للدخول، وغير المشرف يرى 404', async ({ page }) => {
    await page.goto('/admin/fonts?as=out');
    await expect(page).toHaveURL(/\/login\?next=%2Fadmin%2Ffonts/);
    await page.goto('/admin?as=studio');
    await expect(page.getByRole('heading', { name: 'الصفحة غير موجودة' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'أقسام الإدارة' })).toHaveCount(0);
  });

  test('التنقّل: ستّة أقسام بترويسة الموقع، والطلبات بعدد واحد يجمع الخطوط والاستوديوهات', async ({ page }) => {
    await page.goto('/admin?as=admin');
    // جزء من حرف: ترويسة الموقع نفسها
    await expect(page.getByRole('banner').getByRole('link', { name: 'عين' })).toBeVisible();
    const nav = page.getByRole('navigation', { name: 'أقسام الإدارة' }).first();
    for (const name of ['الرئيسية', 'الطلبات', 'الخطوط', 'المستخدمون', 'المحتوى', 'التحليلات'])
      await expect(nav.getByRole('link', { name: new RegExp(name) })).toBeVisible();
    await expect(nav.getByLabel('7 بانتظار قرارك')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'ما ينتظرك' })).toBeVisible();
    await expect(page.getByRole('link', { name: /5 خطوط بانتظار المراجعة/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /2 استوديوهات تطلب التوثيق/ })).toBeVisible();
    await nav.getByRole('link', { name: /الخطوط/ }).click();
    await expect(page).toHaveURL(/\/admin\/fonts$/);
    await expect(page.getByRole('heading', { level: 1, name: 'الخطوط' })).toBeVisible();
    // العناوين القديمة تُحوَّل
    await page.goto('/admin/review');
    await expect(page).toHaveURL(/\/admin\/requests$/);
    await page.goto('/admin/plans');
    await expect(page).toHaveURL(/\/admin\/content\?tab=plans$/);
  });

  test('المراجعة: الرفض يتطلّب سبباً، والقبول ينقل للطلب التالي ويُسجَّل', async ({ page }) => {
    await page.goto('/admin/requests?as=admin');
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

    await page.goto('/admin/requests');
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
    // الإجراءات على الصفّ مباشرة
    await page.getByRole('button', { name: 'إخفاء Cairo' }).click();
    await expect(page.getByRole('button', { name: 'إظهار Cairo' })).toBeVisible();

    // صفحة الخط المخفي غير متاحة للزوّار: «الصفحة غير موجودة» بدل تحويل صامت، ولا يظهر في المكتبة
    await page.goto('/fonts/cairo');
    await expect(page.getByRole('heading', { level: 1, name: 'الصفحة غير موجودة' })).toBeVisible();
    await page.goto('/');
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
    await page.getByRole('button', { name: 'استرجاع' }).click();
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

  test('المستخدمون: منح خطة يُطبَّق على الحساب، والحظر يُنهي جلسته', async ({ page }) => {
    await page.goto('/admin/users?as=admin');
    await page.getByRole('button', { name: 'إجراءات هبة عبدالحميد' }).click();
    await page.getByRole('menuitem', { name: 'تغيير الخطة' }).click();
    const dlg = page.getByRole('dialog', { name: /خطة هبة/ });
    await dlg.getByRole('radio', { name: /الاستوديو/ }).click();
    await dlg.getByRole('button', { name: /امنح الاستوديو/ }).click();
    await expect(page.getByRole('row', { name: /هبة عبدالحميد/ }).getByText('من الإدارة')).toBeVisible();

    // الحساب نفسه (المجاني التجريبي) صار استوديو
    await page.goto('/studio?as=free');
    await expect(page.getByRole('heading', { level: 1, name: 'نظرة عامة' })).toBeVisible();

    // الحظر: السبب إلزامي، ثم لا جلسة
    await page.goto('/admin/users?as=admin');
    await page.getByRole('button', { name: 'إجراءات هبة عبدالحميد' }).click();
    await page.getByRole('menuitem', { name: 'حظر' }).click();
    const ban = page.getByRole('dialog', { name: /حظر هبة/ });
    await expect(ban.getByRole('button', { name: 'حظر الحساب' })).toBeDisabled();
    await ban.getByLabel('السبب').fill('إعادة توزيع خطوط مدفوعة');
    await ban.getByRole('button', { name: 'حظر الحساب' }).click();
    await page.goto('/account?as=free');
    await expect(page).toHaveURL(/\/login/);

    // المشرف لا يُدار من هنا
    await page.goto('/admin/users?as=admin');
    await expect(page.getByRole('button', { name: 'إجراءات فريق حرف' })).toHaveCount(0);
  });

  test('المدونة: نشر مقال قيد المراجعة يظهر في /blog، وإلغاء النشر يخفيه', async ({ page }) => {
    await page.goto('/admin/content?as=admin');
    await page.getByRole('tab', { name: 'المدونة' }).click();
    const item = page.getByRole('listitem').filter({ hasText: 'الخطوط المتغيّرة في العربية' });
    await item.getByRole('button', { name: 'نشر' }).click();
    await page.goto('/blog');
    await page.getByRole('link', { name: /الخطوط المتغيّرة في العربية/ }).click();
    await expect(page).toHaveURL(/\/blog\/variable-arabic-fonts$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('الخطوط المتغيّرة');

    await page.goto('/admin/content');
    await page.getByRole('tab', { name: 'المدونة' }).click();
    await item.getByRole('button', { name: 'إلغاء النشر' }).click();
    await page.goto('/blog/variable-arabic-fonts');
    await expect(page).toHaveURL(/\/blog$/);
  });

  test('الصفحة الرئيسية: زرّ «إدارة البنرات» للمشرف وحده', async ({ page }) => {
    await page.goto('/?as=free');
    await expect(page.getByRole('button', { name: 'إدارة البنرات' })).toHaveCount(0);
    await page.goto('/?as=admin');
    await page.getByRole('button', { name: 'إدارة البنرات' }).click();
    await expect(
      page.getByRole('dialog', { name: 'بنرات الصفحة الرئيسية' }).getByRole('button', { name: 'بنر نصّي' }),
    ).toBeVisible();
  });

  test('بنر نصّي بلا صورة: العنوان مطلوب، ثم يظهر في الشريحة', async ({ page }) => {
    await page.goto('/admin/content?as=admin');
    const banners = page.locator('section').filter({ hasText: 'بنرات الصفحة الرئيسية' });
    await banners.getByRole('button', { name: 'بنر نصّي' }).click();
    await banners.getByRole('button', { name: 'حفظ البنرات' }).click();
    await expect(banners.getByText('اكتب عنوان البنر النصّي.')).toBeVisible();
    await page.getByPlaceholder('مثال: خطوط جديدة كل أسبوع').fill('خطوط جديدة كل أسبوع');
    await banners.getByRole('radio', { name: 'ذهبي' }).click();
    await banners.getByRole('button', { name: 'حفظ البنرات' }).click();
    await expect(page.getByText('حُفظت البنرات')).toBeVisible();
    await page.goto('/');
    await expect(page.getByRole('region', { name: 'المميّز' }).getByText('خطوط جديدة كل أسبوع')).toBeVisible();
  });

  test('المدونة: مقال جديد بغلاف وصورة داخل النصّ يظهر منشوراً', async ({ page }) => {
    await page.goto('/admin/content?as=admin');
    await page.getByRole('tab', { name: 'المدونة' }).click();
    await page.getByRole('button', { name: 'مقال جديد' }).click();
    const dlg = page.getByRole('dialog', { name: 'مقال جديد' });
    const png = async () => {
      const b64 = await page.evaluate(() => {
        const c = document.createElement('canvas');
        c.width = 800;
        c.height = 400;
        const ctx = c.getContext('2d')!;
        ctx.fillStyle = 'rgb(30 120 200)';
        ctx.fillRect(0, 0, 800, 400);
        return c.toDataURL('image/png').split(',')[1]!;
      });
      return { name: 'a.png', mimeType: 'image/png', buffer: Buffer.from(b64, 'base64') };
    };
    const inputs = dlg.locator('input[type=file]');
    await inputs.nth(0).setInputFiles(await png());
    await expect(dlg.getByRole('button', { name: 'إزالة' })).toBeVisible();
    await dlg.getByLabel('العنوان').fill('مقال تجريبي بالصور');
    await dlg.getByLabel('الرابط').fill('test-media-post');
    await dlg.getByLabel('الملخّص').fill('ملخّص تجريبي لمقال فيه صورة.');
    await dlg.getByLabel('الفقرة 1').fill('فقرة أولى.');
    await inputs.nth(1).setInputFiles(await png());
    await dlg.getByRole('button', { name: 'حفظ' }).click();
    await expect(dlg.getByText('صف الصورة لقارئ الشاشة.')).toBeVisible();
    await dlg.getByLabel('وصف الصورة').fill('مربّع أزرق');
    await dlg.getByRole('button', { name: 'حفظ' }).click();
    await expect(dlg).toBeHidden();

    const item = page.getByRole('listitem').filter({ hasText: 'مقال تجريبي بالصور' });
    await item.getByRole('button', { name: 'نشر' }).click();
    await page.goto('/blog/test-media-post');
    await expect(page.getByRole('img', { name: 'مربّع أزرق' })).toBeVisible();
  });

  test('نوافذ التأكيد: الحذف بنافذة تحذير قبل التنفيذ', async ({ page }) => {
    await page.goto('/admin/content?as=admin');
    await page.getByRole('tab', { name: 'المدونة' }).click();
    await page.getByRole('button', { name: 'حذف دليل مختصر لتراخيص الخطوط' }).click();
    const dlg = page.getByRole('dialog', { name: /حذف «دليل مختصر/ });
    await dlg.getByRole('button', { name: 'إلغاء' }).click();
    await expect(page.getByText('دليل مختصر لتراخيص الخطوط')).toBeVisible();
  });
  test('الخطط والأسعار: تعديل السعر والمزايا يظهر في «اختر خطتك»، والقيم غير الصالحة تُرفض', async ({ page }) => {
    await page.goto('/admin/content?tab=plans&as=admin');
    await expect(page.getByRole('tab', { name: 'الخطط والأسعار', selected: true })).toBeVisible();
    const save = page.getByRole('button', { name: 'حفظ الخطة' });
    await expect(save).toBeDisabled();

    // السنوي أعلى من الشهري ← يُرفض
    await page.getByLabel('الشهر في الدفع السنوي').fill('12');
    await save.click();
    await expect(page.getByRole('alert')).toContainText('لا يزيد على الشهري');

    await page.getByLabel('الدفع الشهري').fill('12.5');
    await page.getByLabel('الشهر في الدفع السنوي').fill('9');
    await page.getByLabel('نصّ الميزة 1').fill('تحميل بلا حدود');
    await page.getByRole('button', { name: 'إضافة ميزة' }).click();
    await page.getByLabel('نصّ الميزة 7').fill('ميزة تجريبية جديدة');
    await save.click();
    await expect(page.getByText('حُفظت خطة «الأساسية»')).toBeVisible();
    await expect(save).toBeDisabled();

    // نافذة الخطط تقرأ التعديل
    await page.goto('/?as=free');
    await page.locator('button[aria-label^="حساب"]').click();
    await page.getByRole('button', { name: 'إدارة الخطة' }).click();
    const dialog = page.getByRole('dialog', { name: 'اختر خطتك' });
    await expect(dialog.getByText('$12.50')).toBeVisible();
    await expect(dialog.getByText('ميزة تجريبية جديدة')).toBeVisible();
    await expect(dialog.getByText('تحميل بلا حدود')).toBeVisible();

    // الاستعادة بنافذة تأكيد
    await page.goto('/admin/content?tab=plans&as=admin');
    await page.getByRole('button', { name: 'استعادة الافتراضي' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'استعادة الافتراضي' }).click();
    await expect(page.getByLabel('الدفع الشهري')).toHaveValue('10');
  });
});
