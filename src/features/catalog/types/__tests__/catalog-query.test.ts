import { describe, expect, it } from 'vitest';

import { parseCatalogQuery, toSearchParams } from '@/features/catalog/types/catalog-query';

describe('parseCatalogQuery', () => {
  it('returns defaults for empty input', () => {
    expect(parseCatalogQuery({})).toMatchObject({
      cat: 'all',
      q: '',
      sort: 'popular',
      license: 'all',
      lang: [],
      date: 'all',
    });
  });

  it('ignores invalid values instead of throwing', () => {
    const q = parseCatalogQuery({
      cat: 'hack',
      sort: 'x',
      license: '<script>',
      date: '9999',
      price: '50-999999',
      weights: 'a-b',
    });
    expect(q).toMatchObject({
      cat: 'all',
      sort: 'popular',
      license: 'all',
      date: 'all',
      price: undefined,
      weights: undefined,
    });
  });

  it('keeps only known languages', () => {
    expect(parseCatalogQuery({ lang: 'ar,xx,ku,<b>' }).lang).toEqual(['ar', 'ku']);
  });

  it('accepts ranges on known stops only, in order', () => {
    expect(parseCatalogQuery({ price: '100-900' }).price).toEqual([100, 900]);
    expect(parseCatalogQuery({ price: '900-100' }).price).toBeUndefined();
    expect(parseCatalogQuery({ weights: '1-10' }).weights).toEqual([1, 10]);
  });

  it('trims and caps search text at 80 chars', () => {
    expect(parseCatalogQuery({ q: '  zaet  ' }).q).toBe('zaet');
    expect(parseCatalogQuery({ q: 'x'.repeat(200) }).q).toBe('');
  });

  it('round-trips through the URL and drops defaults', () => {
    const q = parseCatalogQuery({ cat: 'text', lang: 'ar,fa', price: '100-500' });
    expect(toSearchParams(q).toString()).toBe('cat=text&lang=ar%2Cfa&price=100-500');
    expect(parseCatalogQuery(Object.fromEntries(toSearchParams(q)))).toEqual(q);
  });
});
