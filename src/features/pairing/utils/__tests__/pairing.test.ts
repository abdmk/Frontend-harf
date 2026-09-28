import { describe, expect, it } from 'vitest';

import { byId, FAMILIES, LANG_SETS, TIERS, USE_CASES } from '../../data/catalog';
import { bodyWeight, filterFonts, generate, headingWeight, pickThird, rankPairs, score } from '../pairing';

const base = { useCase: USE_CASES.identity, tiers: TIERS.all.tiers, scripts: LANG_SETS.ar.scripts };

describe('الكتالوج', () => {
  it('كل عائلة لها نبذة ومصمّم، وأوزانها غير فارغة', () => {
    for (const f of FAMILIES) {
      expect(f.desc, f.id).toBeTruthy();
      expect(f.designer, f.id).toBeTruthy();
      expect(f.weights.length, f.id).toBeGreaterThan(0);
    }
  });
});

describe('score', () => {
  it('الخط مع نفسه صفر', () => {
    const cairo = byId('cairo')!;
    expect(score(cairo, cairo, USE_CASES.identity)).toBe(0);
  });

  it('النصوص الطويلة لا تقبل خط عرض في المتن', () => {
    const lalezar = byId('lalezar')!;
    for (const f of FAMILIES) expect(score(f, lalezar, USE_CASES.longform)).toBe(0);
  });

  it('الدرجة بين 1 و98', () => {
    for (const p of rankPairs(FAMILIES, base)) {
      expect(p.score).toBeGreaterThanOrEqual(1);
      expect(p.score).toBeLessThanOrEqual(98);
    }
  });
});

describe('الأوزان', () => {
  it('لا يطلب وزناً غير موجود', () => {
    for (const f of FAMILIES) {
      expect(f.weights).toContain(headingWeight(f));
      expect(f.weights).toContain(bodyWeight(f));
    }
  });
});

describe('filterFonts', () => {
  it('المجاني فقط والكردية تُحترم', () => {
    const pool = filterFonts(FAMILIES, { tiers: TIERS.free.tiers, scripts: LANG_SETS['ar-ku'].scripts });
    expect(pool.length).toBeGreaterThan(0);
    for (const f of pool) {
      expect(f.tier).toBe('free');
      expect(f.scripts).toContain('ku');
    }
  });
});

describe('generate', () => {
  it('حتمي: البذرة نفسها تعطي النتيجة نفسها، وبذرة أخرى تغيّرها', () => {
    const a = generate(FAMILIES, { ...base, seed: 7 }).map((c) => c.key);
    const b = generate(FAMILIES, { ...base, seed: 7 }).map((c) => c.key);
    const c = generate(FAMILIES, { ...base, seed: 8 }).map((x) => x.key);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it('ستّ تركيبات فريدة مرتّبة، ولا خط يحمل الدور نفسه أكثر من مرّتين', () => {
    const out = generate(FAMILIES, { ...base, seed: 3 });
    expect(out).toHaveLength(6);
    expect(new Set(out.map((c) => c.key)).size).toBe(6);
    for (let i = 1; i < out.length; i++) expect(out[i - 1]!.score).toBeGreaterThanOrEqual(out[i]!.score);
    const heads = new Map<string, number>();
    for (const c of out) heads.set(c.heading.font.id, (heads.get(c.heading.font.id) ?? 0) + 1);
    for (const n of heads.values()) expect(n).toBeLessThanOrEqual(2);
  });

  it('القفل يثبّت خط العنوان في كل التركيبات', () => {
    const out = generate(FAMILIES, { ...base, seed: 5, locked: { heading: 'el-messiri' } });
    expect(out.length).toBeGreaterThan(0);
    for (const c of out) expect(c.heading.font.id).toBe('el-messiri');
  });

  it('ثلاثة خطوط: الخط الثالث مختلف ولا يعلو على العنوان', () => {
    for (const c of generate(FAMILIES, { ...base, seed: 2, fonts: 3 })) {
      if (!c.sub) continue;
      expect([c.heading.font.id, c.body.font.id]).not.toContain(c.sub.font.id);
      expect(c.sub.font.f.displayFit).toBeLessThanOrEqual(c.heading.font.f.displayFit);
    }
  });

  it('خيارات بلا خطوط كافية تعطي قائمة فارغة لا خطأ', () => {
    expect(generate(FAMILIES, { ...base, tiers: ['paid'], scripts: ['ar', 'ku'] })).toEqual([]);
  });

  it('pickThird لا يعيد أحد الخطين', () => {
    const h = byId('aref-ruqaa')!;
    const b = byId('noto-naskh')!;
    const t = pickThird(FAMILIES, h, b, USE_CASES.print);
    if (t) expect([h.id, b.id]).not.toContain(t.id);
  });
});
