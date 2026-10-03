import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';

/** صورة اختبار حقيقية: «العربية» بخط القاهرة على خلفية ملوّنة، مرسومة في المتصفّح نفسه */
async function specimen(page: Page, { dark = false } = {}) {
  const dataUrl = await page.evaluate(async (dark) => {
    await document.fonts.load("700 140px 'Cairo'", 'العربية');
    const c = document.createElement('canvas');
    c.width = 900;
    c.height = 420;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = dark ? 'rgb(30,20,24)' : 'rgb(246,242,236)';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = dark ? 'rgb(250,250,250)' : 'rgb(200,40,50)';
    ctx.font = "700 140px 'Cairo'";
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('العربية', 450, 210);
    return c.toDataURL('image/png');
  }, dark);
  return { name: 'sample.png', mimeType: 'image/png', buffer: Buffer.from(dataUrl.split(',')[1]!, 'base64') };
}

const upload = (page: Page) => page.locator('input[type=file]').first();

test.describe('عين (مطابقة الخطوط)', () => {
  test('صورة بخط القاهرة ← القاهرة ضمن أقرب ثلاث نتائج، والمقارنة تعمل', async ({ page }) => {
    await page.goto('/tools/font-matching');
    await expect(page.getByRole('heading', { level: 1, name: /لمطابقة الخطوط العربية/ })).toBeVisible();
    await upload(page).setInputFiles(await specimen(page));

    await expect(page.getByRole('img', { name: /منطقة الكتابة المحدّدة/ })).toBeVisible();
    const go = page.getByRole('button', { name: 'طابِق' });
    await expect(go).toBeDisabled();
    await page.getByLabel(/النص في الصورة/).fill('العربية');
    await go.click();

    const results = page.getByRole('region', { name: 'أقرب الخطوط' });
    await expect(results).toBeVisible({ timeout: 30_000 });
    const names = await results.locator('article a[dir=ltr]').allTextContents();
    expect(names.slice(0, 3)).toContain('Cairo');

    // المقارنة: الأوضاع الثلاثة
    await results.getByRole('button', { name: 'تراكب' }).click();
    await expect(results.getByRole('slider', { name: 'شفافية الخط المقترح' })).toBeVisible();
    await results.getByRole('button', { name: 'الفرق' }).click();
    await expect(results.getByText('في صورتك فقط')).toBeVisible();

    await results.getByRole('button', { name: 'صورة جديدة' }).click();
    await expect(page.getByText('ارفع صورة الخط', { exact: true })).toBeVisible();
  });

  test('كتابة فاتحة على خلفية داكنة تُكتشف تلقائياً', async ({ page }) => {
    await page.goto('/tools/font-matching');
    await upload(page).setInputFiles(await specimen(page, { dark: true }));
    await expect(page.getByText('اكتشفنا: كتابة فاتحة على خلفية داكنة')).toBeVisible();
  });

  test('ملف غير مدعوم يُرفض برسالة واضحة', async ({ page }) => {
    await page.goto('/tools/font-matching');
    await upload(page).setInputFiles({ name: 'x.txt', mimeType: 'text/plain', buffer: Buffer.from('hi') });
    await expect(page.getByRole('alert')).toContainText('الصيغة غير مدعومة');
  });
});
