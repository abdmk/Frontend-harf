import { describe, expect, it } from 'vitest';

import { featureOn, featureSettings } from '../../data/features';
import { byLang } from '../../data/languages';
import { coverage, hex } from '../coverage';

const all = (k: Parameters<typeof byLang>[0]) => {
  const l = byLang(k);
  return new Set([...l.base, ...l.special, ...l.extra]);
};

describe('coverage', () => {
  it('خط يحتوي كل حروف اللغة: مدعومة 100', () => {
    const c = coverage(byLang('ar'), all('ar'));
    expect(c.status).toBe('full');
    expect(c.score).toBe(100);
    expect(c.missing).toEqual([]);
  });

  it('ينقصه حرفان مميّزان من الكردية: جزئياً، ويسمّيهما', () => {
    const set = all('ckb');
    set.delete(0x0695); // ڕ
    set.delete(0x06b5); // ڵ
    const c = coverage(byLang('ckb'), set);
    expect(c.status).toBe('partial');
    expect(c.missingSpecial).toEqual([0x0695, 0x06b5]);
    expect(c.score).toBeLessThan(100);
  });

  it('بلا حروف مميّزة: غير مدعومة', () => {
    const l = byLang('ur');
    const c = coverage(l, new Set([...l.base, ...l.extra]));
    expect(c.status).toBe('none');
  });

  it('hex بصيغة U+XXXX', () => {
    expect(hex(0x628)).toBe('U+0628');
    expect(hex(0x1f600)).toBe('U+1F600');
  });
});

describe('features', () => {
  it('ميزات محرّك التشكيل مفعّلة دائماً ولا تدخل في الإعدادات', () => {
    expect(featureOn('init', { init: false })).toBe(true);
    expect(featureSettings(['init'], { init: false })).toBe('normal');
  });

  it('يذكر فقط ما يخالف الافتراضي', () => {
    const tags = ['liga', 'kern', 'ss01', 'dlig'];
    expect(featureSettings(tags, {})).toBe('normal');
    expect(featureSettings(tags, { liga: true, ss01: true, kern: false })).toBe('"kern" 0, "ss01" 1');
  });
});
