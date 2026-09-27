import { test as base, expect, type Page } from '@playwright/test';

/** يفشل أي اختبار إذا ظهر خطأ في الـconsole أو خطأ غير ملتقط في الصفحة (ومنها مخالفات CSP). */
export const test = base.extend<{ page: Page }>({
  page: async ({ page }, use) => {
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
