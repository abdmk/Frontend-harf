import { expect, test } from './fixtures';

test.describe('الاستوديو والإدارة', () => {
  test('مساحة الاستوديو للاستوديو وحده، بعمودها الجانبي وأقسامها', async ({ page }) => {
    await page.goto('/studio/finance?as=free');
    await expect(page).toHaveURL(/\/account\/subscription$/);
    await page.goto('/studio?as=studio');
    await expect(page.getByRole('heading', { level: 1, name: 'نظرة عامة' })).toBeVisible();
    const nav = page.getByRole('navigation', { name: 'أقسام الاستوديو' }).filter({ visible: true });
    await expect(nav.getByRole('link', { name: 'نظرة عامة' })).toHaveAttribute('aria-current', 'page');

    // «خطوطي»: المجاني بلا أرقام بيع، والمدفوع بها؛ قيد المراجعة يفتح النشر
    await nav.getByRole('link', { name: 'خطوطي' }).click();
    await expect(page).toHaveURL(/\/studio\/fonts$/);
    const list = page.getByRole('list', { name: 'خطوط الاستوديو' });
    const free = list.getByRole('listitem').filter({ hasText: 'تجاريب' });
    await expect(free.getByText('مبيعات')).toHaveCount(0);
    await expect(list.getByRole('listitem').filter({ hasText: 'رواق' }).getByText('مبيعات')).toBeVisible();
    await page.getByRole('button', { name: 'مدفوعة' }).click();
    await expect(list.getByRole('listitem')).toHaveCount(3);
    await list.getByRole('link', { name: 'نقش', exact: true }).click();
    await expect(page).toHaveURL(/\/studio\/publish$/);
    await page.goto('/studio/fonts');
    await page.getByRole('list', { name: 'خطوط الاستوديو' }).getByRole('link', { name: 'تجاريب', exact: true }).click();
    await expect(page).toHaveURL(/\/fonts\/tajarib$/);
  });

  test('المالية قسم واحد بأربع صفحات، والعناوين القديمة تُحوَّل إليه', async ({ page }) => {
    await page.goto('/account/earnings?as=studio');
    await expect(page).toHaveURL(/\/studio\/finance\/earnings$/);
    await expect(page.getByRole('heading', { level: 1, name: 'الأرباح' })).toBeVisible();
    const nav = page.getByRole('navigation', { name: 'أقسام الاستوديو' }).filter({ visible: true });
    await nav.getByRole('link', { name: 'نظرة عامة مالية' }).click();
    await expect(page).toHaveURL(/\/studio\/finance$/);
    await expect(page.getByText('الرصيد المتاح للسحب')).toBeVisible();
    await page.getByRole('link', { name: 'كل المبيعات' }).click();
    await expect(page.getByRole('table', { name: 'سجلّ المبيعات' })).toBeVisible();
    await page.getByRole('button', { name: 'مستردّة' }).click();
    await expect(page.getByRole('table', { name: 'سجلّ المبيعات' }).getByRole('row')).toHaveCount(2);
    // الحساب الشخصي لم يعد يحمل أقسام المال
    await page.goto('/account/profile');
    const acc = page.getByRole('navigation', { name: 'قائمة الحساب' });
    await expect(acc.getByRole('link', { name: 'المبيعات' })).toHaveCount(0);
    await expect(acc.getByRole('link', { name: 'الاستوديو', exact: true })).toBeVisible();
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

  test('صور الخط: تُرتَّب بالسحب، وبالأسهم من لوحة المفاتيح', async ({ page }) => {
    await page.goto('/studio/publish?as=studio');
    await page.getByRole('button', { name: /الصور/ }).first().click();
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    );
    await page
      .locator('input[type=file][accept*="image"]')
      .setInputFiles(['a', 'b', 'c'].map((n) => ({ name: `${n}.png`, mimeType: 'image/png', buffer: png })));
    const items = page.getByRole('list', { name: /صور الخط/ }).getByRole('listitem');
    const order = () => items.evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')!.split('،')[0]));
    await expect.poll(order).toEqual(['a.png', 'b.png', 'c.png']);

    // سحب الأولى إلى مكان الثالثة، بحركة تدريجية كما يفعل المستخدم
    const from = (await items.nth(0).boundingBox())!;
    const to = (await items.nth(2).boundingBox())!;
    await page.mouse.move(from.x + from.width / 2, from.y + 40);
    await page.mouse.down();
    await page.mouse.move(to.x + to.width / 2, to.y + 40, { steps: 25 });
    await page.mouse.up();
    await expect.poll(order).toEqual(['b.png', 'c.png', 'a.png']);

    // لوحة المفاتيح: السهم الأيمن يقدّم الصورة المركّز عليها (الصفحة من اليمين)
    await items.nth(2).focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(order).toEqual(['b.png', 'a.png', 'c.png']);
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

test.describe('السحوبات', () => {
  test('طلب سحب يقلّل الرصيد ويظهر في السجلّ، وIBAN خاطئ يُرفض', async ({ page }) => {
    await page.goto('/studio/finance/payouts?as=studio');
    await page.getByRole('button', { name: 'اطلب سحباً' }).click();
    const dlg = page.getByRole('dialog', { name: 'اطلب سحباً' });
    await dlg.getByLabel('المبلغ (دولار)').fill('10');
    await dlg.getByRole('button', { name: 'تأكيد السحب' }).click();
    await expect(dlg.getByText(/الحدّ الأدنى للسحب/)).toBeVisible();
    await dlg.getByLabel('المبلغ (دولار)').fill('100');
    await dlg.getByRole('button', { name: 'تأكيد السحب' }).click();
    await expect(dlg).toBeHidden();
    await expect(page.getByText('$1,184.50').first()).toBeVisible();
    await expect(page.getByRole('table', { name: 'سجلّ التحويلات' }).getByText('قيد المعالجة')).toBeVisible();

    await page.getByRole('button', { name: 'تغيير', exact: true }).click();
    const acc = page.getByRole('dialog', { name: 'تغيير حساب التحويل' });
    await acc.getByLabel('اسم صاحب الحساب').fill('مسبك تجاريب');
    await acc.getByLabel('رقم الحساب الدولي (IBAN)').fill('IQ98 NBIQ 8501 2345 6789 013');
    await acc.getByRole('checkbox').click();
    await acc.getByRole('button', { name: 'حفظ الحساب' }).click();
    await expect(acc.getByText('رقم IBAN غير صحيح — راجِع الأرقام.')).toBeVisible();
    await acc.getByLabel('رقم الحساب الدولي (IBAN)').fill('IQ98 NBIQ 8501 2345 6789 012');
    await acc.getByRole('button', { name: 'حفظ الحساب' }).click();
    await expect(acc).toBeHidden();
    await expect(page.getByText('•••• 9012').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'اطلب سحباً' })).toBeDisabled();
    // الرقم الكامل لا يُحفظ في المتصفّح
    expect(await page.evaluate(() => localStorage.getItem('harf_payouts'))).not.toContain('NBIQ');
  });
});

test('الملف العام: صور آمنة فقط، روابط بأسماء مستخدمين، و«غير مكتمل» يختفي عند الاكتمال', async ({ page }) => {
  await page.goto('/studio/profile?as=studio');
  const side = page.getByRole('navigation', { name: 'أقسام الاستوديو' }).filter({ visible: true });
  await expect(side.getByText('غير مكتمل')).toBeVisible();

  // صورة PNG حقيقية بمقاس محدّد — تُرسم في المتصفّح
  const png = async (w: number, h: number) =>
    Buffer.from(
      await page.evaluate(
        ([w, h]) => {
          const c = document.createElement('canvas');
          c.width = w!;
          c.height = h!;
          c.getContext('2d')!.fillRect(0, 0, w!, h!);
          return c.toDataURL('image/png').split(',')[1]!;
        },
        [w, h],
      ),
      'base64',
    );
  const avatarInput = page.locator('input[type=file][data-kind="avatar"]');
  const coverInput = page.locator('input[type=file][data-kind="cover"]');

  await avatarInput.setInputFiles({
    name: 'logo.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'),
  });
  await expect(page.getByRole('alert')).toHaveText('الصيغ المقبولة: PNG أو JPG أو WebP.');
  await avatarInput.setInputFiles({ name: 'tiny.png', mimeType: 'image/png', buffer: await png(40, 40) });
  await expect(page.getByRole('alert')).toContainText('الصورة صغيرة');
  await avatarInput.setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: await png(256, 256) });
  await expect(page.getByRole('img', { name: 'شعار الاستوديو' })).toBeVisible();
  await coverInput.setInputFiles({ name: 'cover.png', mimeType: 'image/png', buffer: await png(1600, 400) });
  await expect(page.getByRole('img', { name: 'غلاف الاستوديو' })).toBeVisible();

  await page.getByLabel('Instagram').fill('bad handle!');
  await page.getByRole('button', { name: 'حفظ الملف العام' }).click();
  await expect(page.getByText('اسم المستخدم فقط — حروف لاتينية وأرقام و . _ -')).toBeVisible();
  await page.getByLabel('Instagram').fill('@tajarib.type');
  await page.getByRole('button', { name: 'حفظ الملف العام' }).click();
  await expect(side.getByText('غير مكتمل')).toHaveCount(0);
  // الصور مُعاد ترميزها JPEG — لا يُحفظ الملف الأصلي
  expect(await page.evaluate(() => localStorage.getItem('harf_public_profile'))).toContain('data:image/jpeg');

  await page.goto('/foundries/tajarib');
  await expect(page.getByRole('img', { name: 'شعار مسبك تجاريب' })).toBeVisible();
  await expect(page.getByRole('main').getByRole('link', { name: 'Instagram' })).toHaveAttribute(
    'href',
    'https://instagram.com/tajarib.type',
  );
});
