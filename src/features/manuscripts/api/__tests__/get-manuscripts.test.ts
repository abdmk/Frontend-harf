import { describe, expect, it } from 'vitest';

import type { Manuscript } from '@/types/domain/manuscript';

import { DEFAULT_QUERY, getManuscripts } from '../get-manuscripts';

const uploaded: Manuscript = {
  id: 'u-ms-1234',
  title: 'عيد مبارك من الاستوديو',
  category: 'eid',
  width: 400,
  height: 200,
  bytes: 1200,
  url: 'blob:test',
  fonts: [],
  designer: { id: 'studio-u-saad', nameAr: 'استوديو سعد', nameEn: 'Saad', initials: 'اس' },
  designerLinked: false,
  downloads: 0,
  createdAt: '2099-01-01T00:00:00.000Z',
  license: 'commercial',
};

describe('المخطوطات المقبولة في المكتبة', () => {
  it('تظهر مع الأعمال الأخرى وتخضع للتصفية والبحث نفسيهما', () => {
    const all = getManuscripts(DEFAULT_QUERY, undefined, [uploaded]);
    expect(all[0]!.id).toBe(uploaded.id); // الأحدث أولاً
    expect(
      getManuscripts({ ...DEFAULT_QUERY, cat: 'eid' }, undefined, [uploaded]).some((m) => m.id === uploaded.id),
    ).toBe(true);
    expect(
      getManuscripts({ ...DEFAULT_QUERY, cat: 'ramadan' }, undefined, [uploaded]).some((m) => m.id === uploaded.id),
    ).toBe(false);
    expect(getManuscripts({ ...DEFAULT_QUERY, q: 'استوديو سعد' }, undefined, [uploaded]).map((m) => m.id)).toEqual([
      uploaded.id,
    ]);
  });

  it('بدونها تبقى القائمة كما هي', () => {
    expect(getManuscripts(DEFAULT_QUERY).some((m) => m.id === uploaded.id)).toBe(false);
  });
});
