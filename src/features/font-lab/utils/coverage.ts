import type { Language } from '../data/languages';

export type Coverage = {
  base: { have: number; total: number };
  special: { have: number; total: number };
  extra: { have: number; total: number };
  missing: number[];
  missingSpecial: number[];
  score: number;
  status: 'full' | 'partial' | 'none';
};

const count = (cps: number[], set: ReadonlySet<number>) => cps.filter((c) => set.has(c)).length;
const ratio = (have: number, total: number) => (total ? have / total : 1);

/**
 * دعم لغة: «مدعومة» إن اكتملت الأساسية والمميّزة، «جزئياً» إن اكتملت الأساسية ونصف المميّزة
 * على الأقل، وإلا «غير مدعومة». الدرجة الموزونة 0..100 للترتيب والعرض.
 */
export function coverage(lang: Language, set: ReadonlySet<number>): Coverage {
  const base = { have: count(lang.base, set), total: lang.base.length };
  const special = { have: count(lang.special, set), total: lang.special.length };
  const extra = { have: count(lang.extra, set), total: lang.extra.length };
  const score = Math.round(
    (0.6 * ratio(base.have, base.total) +
      0.3 * ratio(special.have, special.total) +
      0.1 * ratio(extra.have, extra.total)) *
      100,
  );
  const baseFull = base.have === base.total;
  const specialRatio = ratio(special.have, special.total);
  const status = baseFull && specialRatio === 1 ? 'full' : baseFull && specialRatio >= 0.5 ? 'partial' : 'none';
  return {
    base,
    special,
    extra,
    missing: [...lang.base, ...lang.special, ...lang.extra].filter((c) => !set.has(c)),
    missingSpecial: lang.special.filter((c) => !set.has(c)),
    score,
    status,
  };
}

export const STATUS_LABEL = { full: 'مدعومة بالكامل', partial: 'مدعومة جزئياً', none: 'غير مدعومة' } as const;

/** نطاقات يونيكود لتصفية فاحص المحارف */
export const RANGES = [
  { key: 'all', label: 'كل النطاقات', test: () => true },
  { key: 'arabic', label: 'العربية', test: (c: number) => c >= 0x0600 && c <= 0x06ff },
  {
    key: 'arabic-ext',
    label: 'العربية الموسّعة',
    test: (c: number) => (c >= 0x0750 && c <= 0x077f) || (c >= 0x08a0 && c <= 0x08ff),
  },
  {
    key: 'presentation',
    label: 'أشكال العرض',
    test: (c: number) => (c >= 0xfb50 && c <= 0xfdff) || (c >= 0xfe70 && c <= 0xfeff),
  },
  { key: 'latin', label: 'اللاتينية', test: (c: number) => c <= 0x024f },
  {
    key: 'punct',
    label: 'ترقيم ورموز',
    test: (c: number) => (c >= 0x2000 && c <= 0x2bff) || (c >= 0x20a0 && c <= 0x20cf),
  },
] as const;
export type RangeKey = (typeof RANGES)[number]['key'];

export const hex = (c: number) => `U+${c.toString(16).toUpperCase().padStart(4, '0')}`;
