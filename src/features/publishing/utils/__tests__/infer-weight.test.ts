import { describe, expect, it } from 'vitest';

import { draftSchema, EMPTY_DRAFT } from '../../types/draft';
import { inferFontMeta } from '../infer-weight';

describe('inferFontMeta', () => {
  it.each([
    ['Tufula-Light.otf', 300],
    ['Tufula-Regular.otf', 400],
    ['Tufula-SemiBold.ttf', 600],
    ['Tufula-Bold.otf', 700],
    ['Tufula-ExtraBold.woff2', 800],
    ['Tufula-Black.otf', 900],
  ])('%s → %i', (name, w) => {
    const r = inferFontMeta({ name, size: 1000 });
    expect('error' in r ? null : r.weight).toBe(w);
  });
  it('يرفض الصيغ الأخرى', () => {
    expect(inferFontMeta({ name: 'x.exe', size: 1 })).toHaveProperty('error');
  });
});

describe('draftSchema', () => {
  it('المسودّة الفارغة تسمّي النواقص', () => {
    const r = draftSchema.safeParse(EMPTY_DRAFT);
    expect(r.success).toBe(false);
    const paths = r.error!.issues.map((i) => i.path[0]);
    expect(paths).toEqual(
      expect.arrayContaining(['files', 'images', 'nameAr', 'designers', 'categories', 'langs', 'consent']),
    );
  });
  it('المشرف يحتاج رابط مصدر https', () => {
    const d = {
      ...EMPTY_DRAFT,
      mode: 'admin' as const,
      files: [{ name: 'a.otf', size: 10, weight: 400, style: 'Regular', format: 'otf' as const }],
      images: 1,
      nameAr: 'خط',
      designers: 'مصمّم',
      categories: ['modern' as const],
      langs: ['ar' as const],
      source: { ...EMPTY_DRAFT.source, url: 'http://x.com' },
      consent: true,
    };
    const r = draftSchema.safeParse(d);
    expect(r.success).toBe(false);
    expect(draftSchema.safeParse({ ...d, source: { ...d.source, url: 'https://x.com/font' } }).success).toBe(true);
  });
});
