import { describe, expect, it } from 'vitest';

import { safeNext } from '../../utils/safe-next';
import { hit } from '../../utils/sliding-window';

describe('safeNext — منع إعادة التوجيه المفتوح', () => {
  it.each(['//evil.com', '/\\evil.com', 'https://evil.com', 'javascript:alert(1)', '/a\nb', ''])('يرفض %j', (v) => {
    expect(safeNext(v)).toBe('/');
  });
  it('يقبل المسارات الداخلية', () => {
    expect(safeNext('/account/purchases')).toBe('/account/purchases');
    expect(safeNext('/fonts/naskh?license=1')).toBe('/fonts/naskh?license=1');
  });
});

describe('hit — حدّ المحاولات', () => {
  it('يسمح حتى الحدّ ثم يمنع، ويعود بعد انقضاء النافذة', () => {
    const k = `t-${Math.random()}`;
    expect([1, 2, 3].map(() => hit(k, 3, 1000, 0))).toEqual([true, true, true]);
    expect(hit(k, 3, 1000, 10)).toBe(false);
    expect(hit(k, 3, 1000, 2000)).toBe(true);
  });
});
