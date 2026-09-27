import { describe, expect, it } from 'vitest';

import { formatBytesAr, formatDateAr, weightsLabel } from '@/lib/format';

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
