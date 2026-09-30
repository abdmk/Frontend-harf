import { describe, expect, it } from 'vitest';

import { netOf } from '../../config/publisher-terms';
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
    expect(netOf(26000)).toEqual({ fee: 7800, net: 18200 });
    expect(netOf(4999)).toEqual({ fee: 1499, net: 3500 });
  });
});
