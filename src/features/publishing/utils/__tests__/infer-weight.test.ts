import { describe, expect, it } from 'vitest';

import { draftSchema, EMPTY_DRAFT, restoreDraft } from '../../types/draft';
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
      expect.arrayContaining(['files', 'images', 'nameLatin', 'designers', 'categories', 'langs', 'consent']),
    );
  });
  it('المشرف يحتاج رابط مصدر https', () => {
    const d = {
      ...EMPTY_DRAFT,
      mode: 'admin' as const,
      files: [{ name: 'a.otf', size: 10, weight: 400, style: 'Regular', format: 'otf' as const }],
      images: 1,
      nameLatin: 'Khatt',
      designers: ['aj'],
      categories: ['modern' as const],
      langs: ['ar' as const],
      source: { ...EMPTY_DRAFT.source, url: 'http://x.com' },
      consent: true,
    };
    const r = draftSchema.safeParse(d);
    expect(r.success).toBe(false);
    expect(draftSchema.safeParse({ ...d, source: { ...d.source, url: 'https://x.com/font' } }).success).toBe(true);
  });
  it('الاسم العربي اختياري، والأنماط للكلاسيكي فقط', () => {
    const base = {
      ...EMPTY_DRAFT,
      files: [{ name: 'a.otf', size: 10, weight: 400, style: 'Regular', format: 'otf' as const }],
      images: 1,
      nameLatin: 'Tufula Sans',
      designers: ['aj'],
      categories: ['classic' as const],
      langs: ['ar' as const],
      consent: true,
    };
    expect(draftSchema.safeParse(base).success).toBe(true);
    expect(draftSchema.safeParse({ ...base, styles: ['kufi', 'naskh'] }).success).toBe(true);
    expect(draftSchema.safeParse({ ...base, categories: ['modern'], styles: ['kufi'] }).success).toBe(false);
    expect(draftSchema.safeParse({ ...base, nameLatin: 'طفولة' }).success).toBe(false);
    expect(draftSchema.safeParse({ ...base, designers: ['<script>'] }).success).toBe(false);
  });

  it('استرجاع مسودّة قديمة أو معدّلة لا يكسر الصفحة', () => {
    const r = restoreDraft({
      designers: 'عبدالملك جاسم',
      styles: ['kufi', 'evil'],
      nameLatin: 5,
      foundries: ['tajarib'],
    });
    expect(r.designers).toEqual([]);
    expect(r.styles).toEqual(['kufi']);
    expect(r.nameLatin).toBe('');
    expect(r.foundries).toEqual(['tajarib']);
  });
});
