import { describe, expect, it } from 'vitest';

import { csvCell, toCsv } from '../csv';

describe('csv', () => {
  it('يبطل حقن الصيغ', () => {
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(csvCell('+1')).toBe(`"'+1"`);
    expect(csvCell('@SUM(A1)')).toBe(`"'@SUM(A1)"`);
  });
  it('يقتبس الفواصل والأسطر', () => {
    expect(csvCell('a,b\nc')).toBe('"a,b\nc"');
  });
  it('يضيف BOM', () => {
    expect(toCsv([['a', 1]]).startsWith('﻿')).toBe(true);
  });
});
