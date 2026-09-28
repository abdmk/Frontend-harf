import { expect, test } from './fixtures';

test.describe('الأمان', () => {
  // ⚠️ يتطلّب خادماً حقيقياً: nonce لكل طلب لا يمكن أن يولّده ملف ثابت (dist/index.html).
  // يُفعَّل عند إضافة Backend أو إعداد رؤوس أمان على مستوى الاستضافة/الـEdge.
  test.fixme('رؤوس الأمان وCSP بـnonce', async ({ request }) => {
    const res = await request.get('/');
    const h = res.headers();
    expect(h['content-security-policy']).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
    expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['referrer-policy']).toBeTruthy();
  });

  test('معاملات الرابط لا تُحقن في الصفحة', async ({ page }) => {
    await page.goto('/?q=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E&cat=%3Cscript%3E');
    await expect(page.locator('img[src=x]')).toHaveCount(0);
  });

  // ⚠️ يتطلّب خادماً حقيقياً: httpOnly لا يمكن ضبطه من JavaScript في المتصفّح بحكم تعريفه.
  // الحساب التجريبي حالياً في localStorage (بلا خادم بعد)؛ يُستبدل بجلسة httpOnly حقيقية عند إضافة Backend.
  test.fixme('كوكي الحساب التجريبي httpOnly', async ({ page, context }) => {
    await page.goto('/?as=studio');
    const cookie = (await context.cookies()).find((c) => c.name === 'harf_demo_as');
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe('Lax');
  });
});
