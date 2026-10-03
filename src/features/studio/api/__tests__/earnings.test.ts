import { describe, expect, it } from 'vitest';

import { netOf } from '@/lib/publisher-terms';

import { isValidIban } from '../earnings';

describe('earnings', () => {
  it('IBAN: mod-97 والشكل', () => {
    expect(isValidIban('GB82 WEST 1234 5698 7654 32')).toBe(true);
    expect(isValidIban('IQ98NBIQ850123456789012')).toBe(true);
    expect(isValidIban('GB82 WEST 1234 5698 7654 33')).toBe(false);
    expect(isValidIban('12345')).toBe(false);
    expect(isValidIban('<script>')).toBe(false);
  });

  it('حصّة المنصّة بالسنتات الصحيحة', () => {
    expect(netOf(26000)).toEqual({ fee: 9100, net: 16900 });
    expect(netOf(4999)).toEqual({ fee: 1749, net: 3250 });
  });
});
