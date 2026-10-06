import { describe, expect, it } from 'vitest';

import { formatBytesAr, formatDateAr, formatMoney, weightsLabel } from '@/utils/format';

describe('format', () => {
  it('uses correct Arabic plural forms for weights', () => {
    expect([1, 2, 3, 10, 11].map(weightsLabel)).toEqual(['وزن واحد', 'وزنان', '3 أوزان', '10 أوزان', '11 وزناً']);
  });
  it('formats dates independently of server locale', () => {
    expect(formatDateAr('2025-08-29')).toBe('29 أغسطس 2025');
  });
  it('formats sizes', () => {
    expect(formatBytesAr(120 * 1024)).toBe('120 ك.ب');
    expect(formatBytesAr(5 * 1024 * 1024)).toBe('5.0 م.ب');
  });
});

describe('formatMoney', () => {
  it('يعرض الدولارات الصحيحة بلا كسور والكسور برقمين', () => {
    expect(formatMoney({ cents: 4900, currency: 'USD' })).toBe('$49');
    expect(formatMoney({ cents: 4950, currency: 'USD' })).toBe('$49.50');
    expect(formatMoney({ cents: 123456, currency: 'USD' })).toBe('$1,234.56');
  });
});
