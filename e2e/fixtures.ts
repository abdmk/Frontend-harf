import { test as base, expect, type Page } from '@playwright/test';

/** يفشل أي اختبار إذا ظهر خطأ في الـconsole أو خطأ غير ملتقط في الصفحة (ومنها مخالفات CSP). */
export const test = base.extend<{ page: Page }>({
  page: async ({ page }, use) => {
    // موافقة الكوكيز مسجّلة مسبقاً لكل الحسابات كي لا تغطّي بطاقتُها أزرار الاختبارات —
    // اختبار البطاقة نفسها يطلبها بـ?askConsent في الرابط
    await page.addInitScript(() => {
      if (location.search.includes('askConsent') || localStorage.getItem('harf_consent')) return;
      localStorage.setItem(
        'harf_consent',
        JSON.stringify({
          v: 2,
          analytics: false,
          marketing: false,
          at: '2026-09-30T00:00:00.000Z',
          users: ['u-heba', 'u-saad', 'u-abdmk', 'u-admin'],
        }),
      );
    });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(`console: ${m.text()}`);
    });
    await use(page);
    // 404 المقصودة تُسجَّل في الـconsole كخطأ شبكة — ليست خطأً في الشيفرة
    expect(errors.filter((e) => !e.includes('404'))).toEqual([]);
  },
});

export { expect };

/** عدد النتائج كما يعرضه شريط الفلاتر النشطة */
export async function resultCount(page: Page) {
  const text = await page
    .getByText(/\d+ نتيجة/)
    .first()
    .textContent();
  return Number.parseInt(text ?? '', 10);
}

/** حساب الاستوديو التجريبي موثّق مسبقاً — لاختبارات النشر التي تفترض اعتماد التوثيق (لا حساب موثّق افتراضياً) */
export async function seedVerifiedStudio(page: Page) {
  await page.addInitScript(() => {
    if (localStorage.getItem('harf_studio_verification_v2')) return;
    localStorage.setItem(
      'harf_studio_verification_v2',
      JSON.stringify({
        'u-abdmk': {
          userId: 'u-abdmk',
          status: 'approved',
          info: {
            legalName: 'عبدالملك جاسم محمد',
            studioName: 'مسبك تجاريب',
            entity: 'company',
            companyName: 'مسبك تجاريب للتصميم',
            country: 'IQ',
            city: 'بغداد',
          },
          docType: 'national_id',
          docs: {},
          payout: {
            method: 'bank',
            holder: 'مسبك تجاريب',
            last4: '4471',
            country: 'IQ',
            verifiedAt: '2025-08-02T10:00:00Z',
          },
          agreement: {
            version: '2026.10',
            signedAt: '2025-08-02T10:04:00Z',
            signer: 'عبدالملك جاسم محمد',
            signature: 'd-seedsign1',
          },
          submittedAt: '2025-08-02T10:05:00Z',
          decidedAt: '2025-08-03T09:12:00Z',
          updatedAt: '2025-08-03T09:12:00Z',
        },
      }),
    );
  });
}
