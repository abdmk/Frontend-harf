import { describe, expect, it } from 'vitest';

import type { LicensePricing } from '@/types/domain/license';

import { quote } from '../quote';
import { selectionSchema } from '../selection';

const pricing: LicensePricing = {
  fontId: 'f',
  currency: 'USD',
  familyCents: 4000,
  singleCents: 1800,
  weights: [
    { id: 'regular', nameAr: 'عادي', nameEn: 'Regular', value: 400 },
    { id: 'bold', nameAr: 'عريض', nameEn: 'Bold', value: 700 },
  ],
  uses: {
    desktop: [
      { id: 'd2', label: 'حتى جهازين', addCents: 0 },
      { id: 'd5', label: 'حتى 5 أجهزة', addCents: 2000 },
    ],
    web: [{ id: 'w10k', label: '10k', addCents: 4000 }],
    app: [{ id: 'a1', label: '1', addCents: 9000 }],
  },
};

describe('quote', () => {
  it('العائلة لسطح المكتب = السعر الأساسي', () => {
    expect(quote(pricing, { fontId: 'f', package: 'family', uses: { desktop: 'd2' } })?.cents).toBe(4000);
  });

  it('يجمع المستويات والاستخدامات', () => {
    expect(quote(pricing, { fontId: 'f', package: 'family', uses: { desktop: 'd5', web: 'w10k' } })?.cents).toBe(10000);
  });

  it('الوزن الواحد يحتاج وزناً موجوداً', () => {
    expect(quote(pricing, { fontId: 'f', package: 'single', weightId: 'nope', uses: { desktop: 'd2' } })).toBeNull();
    expect(quote(pricing, { fontId: 'f', package: 'single', weightId: 'bold', uses: { desktop: 'd2' } })?.cents).toBe(
      1800,
    );
  });

  it('يرفض مستوى أو خطاً غير مطابق وغياب الاستخدام', () => {
    expect(quote(pricing, { fontId: 'f', package: 'family', uses: { desktop: 'd99' } })).toBeNull();
    expect(quote(pricing, { fontId: 'x', package: 'family', uses: { desktop: 'd2' } })).toBeNull();
    expect(quote(pricing, { fontId: 'f', package: 'family', uses: {} })).toBeNull();
  });
});

describe('selectionSchema', () => {
  it('يرفض الحقول الزائدة (مثل سعر مرسل من المتصفّح)', () => {
    const r = selectionSchema.safeParse({ fontId: 'f', package: 'family', uses: { desktop: 'd2' }, cents: 1 });
    expect(r.success).toBe(false);
  });

  it('يرفض المعرّفات غير الصالحة', () => {
    expect(selectionSchema.safeParse({ fontId: '<x>', package: 'family', uses: { desktop: 'd2' } }).success).toBe(
      false,
    );
  });

  it('الوزن الواحد بلا وزن مرفوض', () => {
    expect(selectionSchema.safeParse({ fontId: 'f', package: 'single', uses: { desktop: 'd2' } }).success).toBe(false);
  });
});
