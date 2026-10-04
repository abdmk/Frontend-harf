import { expect, seedVerifiedStudio, test } from './fixtures';

test.describe('الاستوديو والإدارة', () => {
  test('مساحة الاستوديو للاستوديو وحده، في العمود الجانبي نفسه الذي في الحساب', async ({ page }) => {
    await page.goto('/studio/finance?as=free');
    await expect(page).toHaveURL(/\/account\/subscription$/);
    await page.goto('/account/library?as=studio');
    const nav = page.getByRole('navigation', { name: 'قائمة الحساب' });
    const items = await nav.getByRole('link').allInnerTexts();
    await page.goto('/studio');
    await expect(page.getByRole('heading', { level: 1, name: 'نظرة عامة' })).toBeVisible();
    // البنود نفسها وبالترتيب نفسه — يتغيّر المحدّد فقط
    expect(await nav.getByRole('link').allInnerTexts()).toEqual(items);
    await expect(nav.getByRole('link', { name: 'الاستوديو', exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: /^مكتبتي/ })).not.toHaveAttribute('aria-current');

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

  test('المالية قسم واحد بثلاث صفحات، والعناوين القديمة تُحوَّل إليه', async ({ page }) => {
    // «الأرباح» حُذف: عناوينه القديمة تذهب إلى النظرة المالية
    await page.goto('/account/earnings?as=studio');
    await expect(page).toHaveURL(/\/studio\/finance$/);
    await page.goto('/studio/finance/earnings');
    await expect(page).toHaveURL(/\/studio\/finance$/);
    const nav = page.getByRole('navigation', { name: 'أقسام المالية' });
    await expect(nav.getByRole('link', { name: 'الأرباح' })).toHaveCount(0);
    await expect(
      page.getByRole('navigation', { name: 'قائمة الحساب' }).getByRole('link', { name: 'المالية' }),
    ).toHaveAttribute('aria-current', 'page');
    await nav.getByRole('link', { name: 'السحوبات' }).click();
    await expect(page).toHaveURL(/\/studio\/finance\/payouts$/);
    await nav.getByRole('link', { name: 'نظرة عامة مالية' }).click();
    await expect(page).toHaveURL(/\/studio\/finance$/);
    await expect(page.getByText('الرصيد المتاح للسحب')).toBeVisible();
    await page.getByRole('link', { name: 'كل المبيعات' }).click();
    await expect(page.getByRole('table', { name: 'سجلّ المبيعات' })).toBeVisible();
    await page.getByRole('button', { name: 'مستردّة' }).click();
    await expect(page.getByRole('table', { name: 'سجلّ المبيعات' }).getByRole('row')).toHaveCount(2);
    // الحساب الشخصي لم يعد يحمل أقسام المال (ملفّه الشخصي صار في الاستوديو؛ نتفقّد قسماً آخر)
    await page.goto('/account/library');
    const acc = page.getByRole('navigation', { name: 'قائمة الحساب' });
    await expect(acc.getByRole('link', { name: 'المبيعات' })).toHaveCount(0);
    await expect(acc.getByRole('link', { name: 'الاستوديو', exact: true })).toBeVisible();
  });

  test('الجوال: «الحساب» من صفحات الاستوديو يفتح القائمة نفسها (لا يرتدّ إلى الملف)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/studio/finance?as=studio');
    await page.getByRole('main').getByRole('link', { name: 'الحساب', exact: true }).click();
    await expect(page).toHaveURL(/\/account$/);
    const nav = page.getByRole('navigation', { name: 'قائمة الحساب' });
    await nav.getByRole('link', { name: 'التحليلات' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'التحليلات' })).toBeVisible();
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
    await expect(menu.getByRole('link', { name: 'مراجعة طلبات النشر' })).toHaveCount(0);
    await menu.getByRole('link', { name: 'رفع خط' }).click();
    await expect(page).toHaveURL(/\/studio\/publish$/);

    await page.goto('/?as=admin');
    await page.getByRole('button', { name: /^حساب/ }).click();
    await expect(page.getByRole('dialog').getByRole('link', { name: 'لوحة الإدارة' })).toBeVisible();
    await page.getByRole('dialog').getByRole('link', { name: 'مراجعة طلبات النشر' }).click();
    await expect(page).toHaveURL(/\/admin\/requests$/);
  });

  test('صور الخط: تُرتَّب بالسحب، وبالأسهم من لوحة المفاتيح', async ({ page }) => {
    await seedVerifiedStudio(page);
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
    await seedVerifiedStudio(page);
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

    // الاسم اللاتيني أوّلاً وإلزامي؛ العربي اختياري
    await page.getByRole('button', { name: 'التالي: الإتاحة' }).click();
    await expect(page.getByText('اكتب اسم الخط بالحروف اللاتينية.')).toBeVisible();
    await page.getByLabel(/الاسم اللاتيني/).fill('Tufula Sans');
    await page.getByLabel(/الاسم بالعربية/).fill('طفولة');

    // المصمّمون بالإشارة: اكتب ثم اختر بالأسهم وEnter، وBackspace يحذف الأخير
    const who = page.getByRole('combobox', { name: /المصمّمون/ });
    await who.fill('@sara');
    await page.getByRole('option', { name: /سارة نبيل/ }).click();
    await who.fill('عبدالملك');
    await who.press('ArrowDown');
    await who.press('ArrowUp');
    await who.press('Enter');
    await expect(page.getByRole('list', { name: 'المصمّمون المختارون' }).getByRole('listitem')).toHaveCount(2);
    await who.press('Backspace');
    await expect(page.getByRole('list', { name: 'المصمّمون المختارون' }).getByRole('listitem')).toHaveCount(1);
    await who.fill('عبدالملك');
    await who.press('Enter');
    await page.getByRole('combobox', { name: /المسبك/ }).fill('تجاريب');
    await page.getByRole('option', { name: /مسبك تجاريب/ }).click();

    // «كلاسيكية» تفتح أنماطها، وإلغاؤها يلغيها
    const cats = page.getByRole('group', { name: 'التصنيف' });
    await cats.getByRole('button', { name: 'كلاسيكية' }).click();
    await page
      .getByRole('toolbar', { name: /أي خط كلاسيكي/ })
      .getByRole('button', { name: 'الخط الكوفي' })
      .click();
    await page
      .getByRole('toolbar', { name: /أي خط كلاسيكي/ })
      .getByRole('button', { name: 'خط الثلث' })
      .click();
    await page.getByRole('group', { name: 'التصنيف' }).getByRole('button', { name: 'عناوين' }).click();
    await page.getByRole('group', { name: 'اللغات' }).getByRole('button', { name: 'العربية' }).click();
    await page.getByRole('button', { name: 'التالي: الإتاحة' }).click();
    await page.getByRole('button', { name: 'التالي: المراجعة' }).click();

    // المراجعة تعرض ما أُدخل، والإرسال بلا إقرار يسمّيه
    await expect(page.getByText('كل شيء جاهز')).toBeVisible();
    await expect(page.getByRole('definition').filter({ hasText: 'سارة نبيل، عبدالملك جاسم' })).toBeVisible();
    await expect(page.getByRole('definition').filter({ hasText: 'الخط الكوفي، خط الثلث' })).toBeVisible();
    await page.getByRole('button', { name: 'إرسال للمراجعة' }).click();
    await expect(page.getByText('أقرّ بملكية الحقوق قبل الإرسال.')).toBeVisible();
    await page.getByRole('checkbox').click();
    await page.getByRole('button', { name: 'إرسال للمراجعة' }).click();
    await expect(page.getByRole('heading', { name: 'أُرسل الخط للمراجعة' })).toBeVisible();
    await expect(page.getByText('أرسلنا إشعاراً إلى سارة نبيل، عبدالملك جاسم')).toBeVisible();
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

    await page.getByRole('button', { name: 'تحديث', exact: true }).click();
    const acc = page.getByRole('dialog', { name: 'وسيلة استلام الأرباح' });
    await acc.getByLabel('اسم صاحب الحساب').fill('مسبك تجاريب');
    await acc.getByLabel('رقم الحساب الدولي (IBAN)').fill('IQ98 NBIQ 8501 2345 6789 013');
    await acc.getByRole('checkbox').click();
    await acc.getByRole('button', { name: 'متابعة' }).click();
    await expect(acc.getByText('رقم IBAN غير صحيح — راجِع الأرقام.')).toBeVisible();
    await acc.getByLabel('رقم الحساب الدولي (IBAN)').fill('IQ98 NBIQ 8501 2345 6789 012');
    await acc.getByRole('button', { name: 'متابعة' }).click();
    // رمز التأكيد: الخطأ مرفوض، الصحيح يحفظ
    const otp = page.getByRole('dialog', { name: 'تأكيد أنه أنت' });
    await otp.getByLabel('الرقم 1 من 6').fill('111111');
    await otp.getByRole('button', { name: 'تأكيد وحفظ' }).click();
    await expect(otp.getByText(/الرمز غير صحيح/)).toBeVisible();
    await otp.getByLabel('الرقم 1 من 6').fill('246810');
    await otp.getByRole('button', { name: 'تأكيد وحفظ' }).click();
    await expect(otp).toBeHidden();
    await expect(page.getByText('IBAN •••• 9012').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'اطلب سحباً' })).toBeDisabled();
    // الرقم الكامل لا يُحفظ في المتصفّح
    expect(await page.evaluate(() => localStorage.getItem('harf_payouts'))).not.toContain('NBIQ');
  });
});

test('الملف الشخصي: صور آمنة فقط، روابط بأسماء مستخدمين، و«غير مكتمل» يختفي عند الاكتمال', async ({ page }) => {
  await page.goto('/studio/profile?as=studio');
  const side = page.getByRole('navigation', { name: 'قائمة الحساب' });
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
  await expect(page.getByRole('img', { name: 'شعار المسبك' })).toBeVisible();
  await coverInput.setInputFiles({ name: 'cover.png', mimeType: 'image/png', buffer: await png(1600, 400) });
  await expect(page.getByRole('img', { name: 'غلاف الاستوديو' })).toBeVisible();

  // الروابط مطويّة افتراضياً
  await page.getByText('روابط التواصل', { exact: true }).click();
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

test('الملف العام: صاحبه يختار مسبكاً أو مصمّماً، ويغيّر اسمه — والصفحة العامة تتبعه', async ({ page }) => {
  await page.goto('/studio/profile?as=studio');
  await page.getByRole('radio', { name: /مصمّم مستقلّ/ }).click();
  await page.getByLabel('اسمك').fill('عبدالملك جاسم');
  await page.getByLabel('الاسم باللاتينية').fill('عربي');
  await page.getByRole('button', { name: 'حفظ الملف العام' }).click();
  await expect(page.getByText('الاسم اللاتيني بحروف لاتينية فقط.')).toBeVisible();
  await page.getByLabel('الاسم باللاتينية').fill('Abdulmalik Jassim');
  await page.getByRole('button', { name: 'حفظ الملف العام' }).click();
  await expect(page.getByText('حُفظ ملفك العام')).toBeVisible();
  // الاسم الجديد في العمود الجانبي فوراً
  const side = page.getByRole('complementary').filter({ visible: true }).first();
  await expect(side.getByText('عبدالملك جاسم').first()).toBeVisible();

  await page.goto('/foundries/tajarib');
  await expect(page.getByRole('heading', { level: 1, name: 'عبدالملك جاسم' })).toBeVisible();
  await expect(page.getByText('مصمّم مستقلّ', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: /مصمّمو المسبك/ })).toHaveCount(0);

  // والعودة إلى المسبك تعيد قسم المصمّمين
  await page.goto('/studio/profile');
  await page.getByRole('radio', { name: /^مسبك/ }).click();
  await page.getByLabel('اسم المسبك').fill('مسبك تجاريب');
  await page.getByRole('button', { name: 'حفظ الملف العام' }).click();
  await page.goto('/foundries/tajarib');
  await expect(page.getByText('مسبك', { exact: true })).toBeVisible();
});
