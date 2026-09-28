/**
 * محرّك «نسق» — منقول من ملف «استوديو الأدوات» بدوال نقية مكتوبة النوع.
 *
 * الفكرة (كما يصوغها fontjoy): الخطّان يتشاركان «مزاجاً» عاماً ويتباينان بلطف. فتنقسم الخصائص:
 *   - الهيكل (عرض، استدارة، رسمية): التقارب هنا جيد — الاختلاف يبدو مصادفة.
 *   - الدور (تباين السماكة، صلاحية العنوان/النص، فارق الوزن): الاختلاف هنا جيد — العنوان
 *     عالي التباين فوق متن أحادي الخط هو التركيبة الكلاسيكية.
 * كل شيء حتمي: البذرة نفسها تعطي النتيجة نفسها، فـ«تركيبات جديدة» قابلة للتكرار والاختبار.
 */
import type { Features, PairFont, UseCase } from '../data/catalog';

const THEME_KEYS = ['width', 'roundness', 'formality'] as const satisfies readonly (keyof Features)[];

/** mulberry32 — مولّد صغير حتمي */
export function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** متوسّط الفرق في أبعاد الهيكل — 0 متطابقان */
export function themeDistance(a: PairFont, b: PairFont) {
  return THEME_KEYS.reduce((sum, k) => sum + Math.abs(a.f[k] - b.f[k]), 0) / THEME_KEYS.length;
}

/** أثقل وزن يصلح للعنوان (حتى 800)، من الأوزان الموجودة فعلاً */
export function headingWeight(font: PairFont) {
  const w = [...font.weights].sort((x, y) => y - x);
  return w.find((x) => x <= 800) ?? w[0]!;
}

/** أقرب وزن إلى 400 للمتن */
export function bodyWeight(font: PairFont) {
  return font.weights.reduce((best, w) => (Math.abs(w - 400) < Math.abs(best - 400) ? w : best), font.weights[0]!);
}

/** مدى اختلاف وظيفتي الخطين — 0 نفس الوظيفة */
export function roleContrast(a: PairFont, b: PairFont) {
  const display = Math.abs(a.f.displayFit - b.f.displayFit);
  const text = Math.abs(a.f.textFit - b.f.textFit);
  const stroke = Math.abs(a.f.contrast - b.f.contrast);
  const weight = Math.min(Math.abs(headingWeight(a) - bodyWeight(b)) / 700, 1);
  return (display + text + stroke + weight) / 4;
}

function meetsRole(font: PairFont, req: Partial<Features>) {
  return (Object.keys(req) as (keyof Features)[]).every((k) => font.f[k] >= req[k]!);
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/*
 * الدرجات الخام تعيش في نطاق ضيّق (p05 0.40 · p50 0.63 · max 0.87 على هذا الكتالوج)، فتركيبة
 * ممتازة تحسب ~0.75 وتُقرأ «متوسطة». هذا منحنى عرض رتيب (لا يغيّر الترتيب) إلى 45..98.
 * أعد قياس الحدود إن تغيّر شكل الكتالوج.
 */
function calibrate(raw: number) {
  const t = (raw - 0.4) / (0.83 - 0.4);
  return clamp(Math.round(45 + t * 53), 1, 98);
}

/** درجة تركيبة عنوان/متن لاستخدام ما، 0..100. من لا يصلح لدوره يُستبعد (0) لا يُعاقب فقط. */
export function score(heading: PairFont, body: PairFont, useCase: UseCase) {
  if (!meetsRole(heading, useCase.heading) || !meetsRole(body, useCase.body)) return 0;
  if (heading.id === body.id) return 0;

  const theme = 1 - themeDistance(heading, body);
  const role = roleContrast(heading, body);
  const base = useCase.themeWeight * theme + (1 - useCase.themeWeight) * role;

  let bonus = 0;
  if (heading.style === body.style) bonus += 0.04; // أسلوب مشترك يُقرأ مقصوداً
  if (body.weights.length >= 4) bonus += 0.03; // متن بأوزان متعدّدة يعطي المصمّم مجالاً
  if (heading.f.displayFit > 0.85 && body.f.displayFit > 0.85) bonus -= 0.18; // عنوانان صاخبان يتصارعان

  return calibrate(base + bonus);
}

export type PairOptions = {
  useCase: UseCase;
  tiers: readonly string[];
  scripts: readonly string[];
  /** 2 أو 3 خطوط */
  fonts?: 2 | 3;
  count?: number;
  seed?: number;
  locked?: { heading?: string; body?: string };
};

/** العائلات التي تحقّق فلتر الترخيص واللغات */
export function filterFonts(families: readonly PairFont[], o: Pick<PairOptions, 'tiers' | 'scripts'>) {
  return families.filter((f) => o.tiers.includes(f.tier) && o.scripts.every((s) => f.scripts.includes(s as never)));
}

type Ranked = { heading: PairFont; body: PairFont; score: number };

/** كل تركيبة صالحة مرتّبة من الأفضل؛ ما دُرجته 0 يُحذف */
export function rankPairs(families: readonly PairFont[], o: PairOptions): Ranked[] {
  const pool = filterFonts(families, o);
  const out: Ranked[] = [];
  for (const a of pool)
    for (const b of pool) {
      if (a === b) continue;
      const s = score(a, b, o.useCase);
      if (s > 0) out.push({ heading: a, body: b, score: s });
    }
  return out.sort((x, y) => y.score - x.score || (x.heading.id + x.body.id > y.heading.id + y.body.id ? 1 : -1));
}

export type Slot = { font: PairFont; weight: number; role: 'العناوين' | 'العناوين الفرعية' | 'النصوص' };
export type Combo = { key: string; score: number; heading: Slot; body: Slot; sub?: Slot; reason: string };

export const comboKey = (headingId: string, bodyId: string, subId?: string) =>
  [headingId, subId ?? '', bodyId].join('|');

/**
 * يبني `count` تركيبة. الاختيار عيّنة مرجّحة نحو أعلى الترتيب لا «أفضل N» حرفياً — فزرّ
 * «تركيبات جديدة» يعطي جديداً، والتركيبة الثانية عشرة ما زالت جيدة. القفل يثبّت خطاً لدوره.
 */
export function generate(families: readonly PairFont[], o: PairOptions): Combo[] {
  const count = o.count ?? 6;
  const random = rng(o.seed ?? 1);
  const locked = o.locked ?? {};

  const ranked = rankPairs(families, o).filter(
    (p) => (!locked.heading || p.heading.id === locked.heading) && (!locked.body || p.body.id === locked.body),
  );
  if (!ranked.length) return [];

  const pool = ranked.slice(0, Math.max(count * 4, Math.min(ranked.length, 32)));
  const picked: Ranked[] = [];
  const used = new Set<string>();
  const seenH = new Map<string, number>();
  const seenB = new Map<string, number>();
  // دفعة تبدأ أربع من ستّ بطاقات فيها بالخط نفسه تبدو أداة معطوبة — حدّ للتكرار إلا إن قُفل الدور
  const MAX_REPEAT = 2;
  const overused = (c: Ranked) =>
    (!locked.heading && (seenH.get(c.heading.id) ?? 0) >= MAX_REPEAT) ||
    (!locked.body && (seenB.get(c.body.id) ?? 0) >= MAX_REPEAT);
  const take = (c: Ranked) => {
    used.add(c.heading.id + '|' + c.body.id);
    seenH.set(c.heading.id, (seenH.get(c.heading.id) ?? 0) + 1);
    seenB.set(c.body.id, (seenB.get(c.body.id) ?? 0) + 1);
    picked.push(c);
  };

  for (let guard = 0; picked.length < count && guard < 800; guard++) {
    const c = pool[Math.min(Math.floor(Math.pow(random(), 1.6) * pool.length), pool.length - 1)]!;
    if (used.has(c.heading.id + '|' + c.body.id) || overused(c)) continue;
    take(c);
  }
  // إن قصُرت العيّنة: إكمال بالترتيب، أولاً مع حدّ التكرار ثم بدونه
  for (let pass = 0; pass < 2 && picked.length < count; pass++)
    for (const c of ranked) {
      if (picked.length >= count) break;
      if (used.has(c.heading.id + '|' + c.body.id) || (pass === 0 && overused(c))) continue;
      take(c);
    }

  picked.sort((a, b) => b.score - a.score);
  const poolAll = filterFonts(families, o);

  return picked.map((p) => {
    const sub = o.fonts === 3 ? pickThird(poolAll, p.heading, p.body, o.useCase) : null;
    return {
      key: comboKey(p.heading.id, p.body.id, sub?.id),
      score: p.score,
      heading: { font: p.heading, weight: headingWeight(p.heading), role: 'العناوين' },
      body: { font: p.body, weight: bodyWeight(p.body), role: 'النصوص' },
      ...(sub && { sub: { font: sub, weight: bodyWeight(sub), role: 'العناوين الفرعية' as const } }),
      reason: explain(p.heading, p.body, o.useCase),
    };
  });
}

/** الخط الثالث بين الاثنين: قريب من كليهما، ولا يعلو صوته على العنوان */
export function pickThird(pool: readonly PairFont[], heading: PairFont, body: PairFont, useCase: UseCase) {
  let best: PairFont | null = null;
  let bestScore = -1;
  for (const f of pool) {
    if (f.id === heading.id || f.id === body.id || f.f.displayFit > heading.f.displayFit) continue;
    const s = (score(heading, f, useCase) + score(f, body, useCase)) / 2;
    if (s > bestScore) {
      bestScore = s;
      best = f;
    }
  }
  return bestScore > 0 ? best : null;
}

const STYLE_LABEL: Record<PairFont['style'], string> = {
  naskh: 'نسخ',
  kufi: 'كوفي',
  geometric: 'هندسي',
  humanist: 'إنساني',
  display: 'عرض',
  script: 'خط اليد',
};
export const styleLabel = (s: PairFont['style']) => STYLE_LABEL[s] ?? s;

/** تعليل بجملة واحدة صادقة يمكن للمصمّم التحقّق منها، لا مديح عام */
export function explain(heading: PairFont, body: PairFont, useCase: UseCase) {
  if (heading.style === body.style)
    return `الخطان من عائلة أسلوبية واحدة (${styleLabel(heading.style)})، فالانسجام مضمون والتمييز يأتي من الوزن والحجم.`;
  if (Math.abs(heading.f.contrast - body.f.contrast) > 0.35)
    return 'تباين واضح في سماكة الحروف بين العنوان والمتن يمنح النص تدرّجاً بصرياً مريحاً.';
  if (headingWeight(heading) - bodyWeight(body) >= 300)
    return 'فارق الوزن بين العنوان الثقيل والمتن الخفيف يبني تسلسلاً هرمياً واضحاً.';
  if (themeDistance(heading, body) < 0.15) return 'الخطان قريبان في النسب والمزاج، فيبدو التصميم موحّداً دون رتابة.';
  return useCase.note;
}
