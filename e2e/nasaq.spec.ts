import { expect, test } from './fixtures';

test.describe('نسق', () => {
  test('من الترويسة: ستّ تركيبات بخطوطها الحقيقية، والخيارات و«تركيبات جديدة» تغيّرها', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation', { name: 'الأقسام' }).getByRole('link', { name: 'نسق' }).click();
    await expect(page).toHaveURL(/\/tools\/nasaq$/);
    const cards = page.locator('article');
    await expect(cards).toHaveCount(6);

    // الخطوط محمّلة فعلاً لا بديلة
    await expect(page.getByRole('status', { name: 'تحميل الخطوط' })).toHaveCount(0, { timeout: 10_000 });
    const first = await cards.first().getAttribute('aria-label');

    await page.getByRole('button', { name: 'تركيبات جديدة' }).click();
    await expect.poll(() => cards.first().getAttribute('aria-label')).not.toBe(first);

    // تغيير الاستخدام من الجملة
    await page.getByRole('button', { name: /نوع الاستخدام/ }).click();
    await page.getByRole('menuitemradio', { name: 'النصوص الطويلة' }).click();
    await expect(page.getByRole('button', { name: /نوع الاستخدام: النصوص الطويلة/ })).toBeVisible();
    await expect(cards).toHaveCount(6);
  });

  test('القفل يثبّت خط العنوان، والنص يُحرَّر في كل البطاقات، والحفظ يبقى', async ({ page }) => {
    await page.goto('/tools/nasaq');
    const cards = page.locator('article');
    await expect(cards).toHaveCount(6);

    const lock = cards.first().getByRole('button', { name: /^ثبّت .* لـالعناوين$/ });
    const name = (await lock.getAttribute('aria-label'))!.replace(/^ثبّت (.*) لـالعناوين$/, '$1');
    await lock.click();
    await expect(page.getByText(`${name} مثبّت لـالعناوين`)).toBeVisible();
    for (const card of await cards.all())
      await expect(card).toHaveAttribute('aria-label', new RegExp(`^تركيبة ${name} و`));

    const heading = cards.first().getByRole('textbox', { name: 'العنوان' });
    await heading.click();
    await heading.press('Control+A');
    await heading.pressSequentially('مرحباً');
    await expect(cards.nth(3).getByRole('textbox', { name: 'العنوان' })).toHaveText('مرحباً');

    await cards
      .first()
      .getByRole('button', { name: /^حفظ تركيبة/ })
      .click();
    await page.reload();
    await page.getByRole('button', { name: /المحفوظة \(1\)/ }).click();
    await expect(cards).toHaveCount(1);
  });

  test('خيارات بلا تركيبات تُظهر حالة فارغة يمكن الخروج منها', async ({ page }) => {
    await page.goto('/tools/nasaq');
    await page.getByRole('button', { name: /الترخيص/ }).click();
    await page.getByRole('menuitemradio', { name: 'مدفوعة', exact: true }).click();
    await page.getByRole('button', { name: /اللغات/ }).click();
    await page.getByRole('menuitemradio', { name: 'العربية والكردية' }).click();
    await expect(page.getByRole('heading', { name: 'لا تركيبات لهذه الخيارات' })).toBeVisible();
    await page.getByRole('button', { name: 'وسّع الخيارات' }).click();
    await expect(page.locator('article')).toHaveCount(6);
  });
});
