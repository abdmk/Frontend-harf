import { describe, expect, it } from 'vitest';

import type { Font } from '@/types/domain/font';
import { parseCatalogQuery } from '@/features/catalog/types/catalog-query';
import { activeFilterCount, filterFonts } from '@/features/catalog/utils/filter-fonts';

const d = { id: 'd', initials: 'D', nameAr: 'سارة', nameEn: 'Sara', color: '#000' };
const now = new Date('2026-09-27T00:00:00Z');
const font = (p: Partial<Font>): Font => ({
  id: 'x',
  name: 'X',
  designers: [d],
  weights: 4,
  langs: ['ar'],
  type: 'free',
  usage: 'commercial',
  category: 'text',
  releasedAt: '2026-09-20',
  popularity: 1,
  price: 0,
  ...p,
});
const fonts = [
  font({ id: 'a', name: 'Alpha', popularity: 3, releasedAt: '2026-01-01', langs: ['ar', 'fa'] }),
  font({
    id: 'b',
    name: 'Beta',
    popularity: 9,
    releasedAt: '2026-09-25',
    category: 'modern',
    usage: 'personal',
    type: 'trial',
    price: 300,
    weights: 8,
  }),
  font({ id: 'c', name: 'Gamma', popularity: 5, releasedAt: '2025-06-01', type: 'paid', price: 900, weights: 1 }),
];
const run = (raw: Record<string, string>) => filterFonts(fonts, parseCatalogQuery(raw), now).map((f) => f.id);

describe('filterFonts', () => {
  it('sorts by popularity by default and by date for newest', () => {
    expect(run({})).toEqual(['b', 'c', 'a']);
    expect(run({ sort: 'newest' })).toEqual(['b', 'a', 'c']);
  });
  it('filters by category and search (name or designer)', () => {
    expect(run({ cat: 'modern' })).toEqual(['b']);
    expect(run({ q: 'gam' })).toEqual(['c']);
    expect(run({ q: 'سارة' })).toHaveLength(3);
  });
  it('filters by licence', () => {
    expect(run({ license: 'personal' })).toEqual(['b']);
    expect(run({ license: 'paid' })).toEqual(['b', 'c']);
  });
  it('requires every selected language', () => {
    expect(run({ lang: 'ar,fa' })).toEqual(['a']);
  });
  it('filters by date range, price and weights', () => {
    expect(run({ date: '7' })).toEqual(['b']);
    expect(run({ date: 'year' })).toEqual(['b', 'a']);
    expect(run({ price: '200-800' })).toEqual(['b']);
    expect(run({ weights: '1-2' })).toEqual(['c']);
  });
  it('counts only drawer filters', () => {
    expect(activeFilterCount(parseCatalogQuery({ cat: 'text', q: 'x', lang: 'ar,ku', price: '0-500' }))).toBe(3);
  });
});
