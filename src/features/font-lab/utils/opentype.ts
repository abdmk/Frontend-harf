import type { LabFont } from '../types';

/**
 * محلّل OpenType — يقرأ جداول GSUB/GPOS من الملف نفسه (عبر fontkit) ويجيب عن أسئلة المصمّم:
 * ماذا تغيّر كل ميزة بالضبط (المحرف قبل وبعد)، ما اسمها كما سمّاها المصمّم في الملف،
 * ما الربطات الموجودة، وما اللغات والكتابات المعرّفة. كل شيء محلّي — لا شيء يُرسل.
 */

/* ── أنواع fontkit الداخلية (غير مُصدَّرة في تعريفاته) — نقرأ ما نحتاجه فقط ── */
type Lazy<T> = T[] | { toArray(): T[] } | { length: number; get(i: number): T };
type Coverage =
  { version: 1; glyphs: Lazy<number> } | { version: 2; rangeRecords: Lazy<{ start: number; end: number }> };
type LookupRecord = { sequenceIndex: number; lookupListIndex: number };
type SubTable = {
  version?: number;
  substFormat?: number;
  coverage?: Coverage;
  deltaGlyphID?: number;
  substitute?: Lazy<number>;
  /** النوع 2 (تبديل متعدّد): لكل محرف في التغطية تسلسل محارف */
  sequences?: Lazy<Lazy<number>>;
  alternateSet?: Lazy<Lazy<number>>;
  ligatureSets?: Lazy<Lazy<{ glyph: number; components: Lazy<number> }>>;
  inputCoverage?: Lazy<Coverage>;
  backtrackCoverage?: Lazy<Coverage>;
  lookaheadCoverage?: Lazy<Coverage>;
  coverages?: Lazy<Coverage>;
  lookupRecords?: Lazy<LookupRecord>;
  extensionLookupType?: number;
  extension?: SubTable;
};
type Lookup = { lookupType: number; subTables: Lazy<SubTable> };
type LayoutTable = {
  scriptList: Lazy<{ tag: string; script: { langSysRecords?: Lazy<{ tag: string }> } }>;
  featureList: Lazy<{ tag: string; feature: { featureParams?: { nameID?: number }; lookupListIndexes: Lazy<number> } }>;
  lookupList: Lazy<Lookup>;
};
type Kit = {
  GSUB?: LayoutTable;
  GPOS?: LayoutTable;
  characterSet: number[];
  glyphForCodePoint(cp: number): { id: number };
  name?: { records?: { fontFeatures?: Record<string, Record<string, string>> } };
};

function arr<T>(x: Lazy<T> | undefined | null): T[] {
  if (!x) return [];
  if (Array.isArray(x)) return x;
  if ('toArray' in x) return x.toArray();
  return Array.from({ length: x.length }, (_, i) => x.get(i));
}

function coverageGlyphs(c: Coverage | undefined): number[] {
  if (!c) return [];
  if (c.version === 1) return arr(c.glyphs);
  const out: number[] = [];
  for (const r of arr(c.rangeRecords)) for (let g = r.start; g <= r.end && out.length < 2000; g++) out.push(g);
  return out;
}

/** امتداد (النوع 7) يلفّ الجدول الحقيقي */
const unwrap = (s: SubTable, type: number): [SubTable, number] =>
  type === 7 && s.extension ? [s.extension, s.extensionLookupType ?? type] : [s, type];

/* ── النتيجة ── */

export type GlyphPair = { from: number; to: number };
export type OtFeature = {
  tag: string;
  table: 'GSUB' | 'GPOS';
  /** الاسم كما كتبه المصمّم في الملف (للمجموعات الأسلوبية غالباً) — العربي أولاً */
  name?: string;
  /** نوع الأثر بلغة المصمّم */
  kind: 'تبديل' | 'بدائل' | 'ربط' | 'سياقي' | 'تموضع' | 'مختلط';
  lookups: number;
  /** المحارف التي تتبدّل (قبل ← بعد) — أوّل 24 */
  pairs: GlyphPair[];
  /** نصّ يظهر فيه أثر الميزة: المحارف المتأثّرة، أو سياق القاعدة */
  sample: string;
};
export type OtLigature = { feature: string; glyph: number; text: string };
export type OtReport = {
  features: OtFeature[];
  ligatures: OtLigature[];
  scripts: { tag: string; langs: string[] }[];
  /** محارف لها بدائل (النوع 3) — مستكشف البدائل */
  alternates: { from: number; to: number[] }[];
};

const TATWEEL = 'ـ';
const FORM_TEXT = {
  init: (c: string) => c + TATWEEL,
  medi: (c: string) => TATWEEL + c + TATWEEL,
  fina: (c: string) => TATWEEL + c,
  isol: (c: string) => c,
} as const;

const cache = new WeakMap<object, OtReport>();

export function analyzeOpenType(font: LabFont): OtReport {
  const kit = font.kit as unknown as Kit;
  const hit = cache.get(kit);
  if (hit) return hit;

  // المحرف ← النص: من cmap مباشرة، أو من أشكال الحرف السياقية (ـمـ) لمحارف بلا رمز يونيكود
  const toCp = new Map<number, number>();
  for (const cp of kit.characterSet) {
    const id = kit.glyphForCodePoint(cp).id;
    if (id && !toCp.has(id)) toCp.set(id, cp);
  }
  const gsubLookups = arr(kit.GSUB?.lookupList);
  const gsubFeatures = arr(kit.GSUB?.featureList);

  /** أزواج التبديل المفرد في lookup (يتبع الامتداد) */
  const singlePairs = (lookup: Lookup | undefined, limit = 4000): GlyphPair[] => {
    if (!lookup) return [];
    const out: GlyphPair[] = [];
    for (const raw of arr(lookup.subTables)) {
      const [s, type] = unwrap(raw, lookup.lookupType);
      // 1: تبديل مفرد. 2: تبديل متعدّد — بعض الخطوط (Amiri) تبني به الأشكال السياقية؛ نأخذ ما يبدّل محرفاً بمحرف
      if (type !== 1 && type !== 2) continue;
      const cov = coverageGlyphs(s.coverage);
      const subst = arr(s.substitute);
      const seqs = arr(s.sequences);
      cov.forEach((g, i) => {
        if (out.length >= limit) return;
        let to: number | undefined;
        if (type === 2) {
          const seq = arr(seqs[i]);
          to = seq.length === 1 ? seq[0] : undefined;
        } else to = s.deltaGlyphID !== undefined ? (g + s.deltaGlyphID) & 0xffff : subst[i];
        if (to !== undefined && to !== g) out.push({ from: g, to });
      });
    }
    return out;
  };

  const formText = new Map<number, string>();
  for (const f of gsubFeatures) {
    const form = f.tag as keyof typeof FORM_TEXT;
    if (!(form in FORM_TEXT)) continue;
    for (const i of arr(f.feature.lookupListIndexes))
      for (const p of singlePairs(gsubLookups[i])) {
        const cp = toCp.get(p.from);
        if (cp !== undefined && !formText.has(p.to)) formText.set(p.to, FORM_TEXT[form](String.fromCodePoint(cp)));
      }
  }
  const textOf = (g: number): string | null => {
    const cp = toCp.get(g);
    return cp !== undefined ? String.fromCodePoint(cp) : (formText.get(g) ?? null);
  };

  const names = kit.name?.records?.fontFeatures ?? {};
  const nameOf = (id?: number) => {
    const n = id !== undefined ? names[String(id)] : undefined;
    if (!n) return undefined;
    return n.ar ?? Object.entries(n).find(([k]) => k.startsWith('ar'))?.[1] ?? n.en ?? Object.values(n)[0];
  };

  const ligatures: OtLigature[] = [];
  const alternates = new Map<number, number[]>();

  const features: OtFeature[] = [];
  const seen = new Set<string>();
  for (const f of gsubFeatures) {
    if (seen.has(f.tag)) continue; // الميزة نفسها مكرّرة لكل لغة — نحلّلها مرّة
    seen.add(f.tag);
    const idx = [
      ...new Set(gsubFeatures.filter((x) => x.tag === f.tag).flatMap((x) => arr(x.feature.lookupListIndexes))),
    ];
    const types = new Set<number>();
    const pairs: GlyphPair[] = [];
    let context = '';
    for (const i of idx) {
      const lookup = gsubLookups[i];
      if (!lookup) continue;
      for (const raw of arr(lookup.subTables)) {
        const [s, type] = unwrap(raw, lookup.lookupType);
        types.add(type);
        if (type === 1 || type === 2) pairs.push(...singlePairs({ lookupType: type, subTables: [s] }, 60));
        else if (type === 3) {
          const cov = coverageGlyphs(s.coverage);
          arr(s.alternateSet).forEach((set, k) => {
            const from = cov[k];
            if (from === undefined) return;
            const to = arr(set);
            if (to[0] !== undefined) pairs.push({ from, to: to[0] });
            alternates.set(from, [...new Set([...(alternates.get(from) ?? []), ...to])]);
          });
        } else if (type === 4) {
          const cov = coverageGlyphs(s.coverage);
          arr(s.ligatureSets).forEach((set, k) => {
            const first = cov[k];
            if (first === undefined) return;
            for (const lig of arr(set)) {
              if (ligatures.length >= 160) return;
              const parts = [first, ...arr(lig.components)].map(textOf);
              const text = parts.every((p) => p !== null) ? parts.join('').replaceAll(TATWEEL, '') : '';
              // ربطات حقيقية فقط: ccmp تركيب علامات لا ربطة، وما لا حرفين فيه (كشيدة، نقاط) ضجيج
              if (f.tag !== 'ccmp' && /\p{L}.*\p{L}/u.test(text))
                ligatures.push({ feature: f.tag, glyph: lig.glyph, text });
            }
          });
        } else if (type === 5 || type === 6) {
          // سياقي: التبديلات الفعلية في الـlookups المتداخلة، والنص من تغطيات القاعدة الأولى
          for (const r of arr(s.lookupRecords)) pairs.push(...singlePairs(gsubLookups[r.lookupListIndex], 40));
          if (!context) {
            const seq = [
              ...arr(s.backtrackCoverage).reverse(),
              ...(arr(s.inputCoverage).length ? arr(s.inputCoverage) : arr(s.coverages)),
              ...arr(s.lookaheadCoverage),
            ];
            const parts = seq.map(
              (c) =>
                coverageGlyphs(c)
                  .map(textOf)
                  .find((t) => t !== null) ?? null,
            );
            if (parts.length && parts.every((p) => p !== null)) context = parts.join('');
          }
        }
      }
    }
    const kind: OtFeature['kind'] =
      types.size > 1
        ? 'مختلط'
        : types.has(4)
          ? 'ربط'
          : types.has(3)
            ? 'بدائل'
            : types.has(5) || types.has(6)
              ? 'سياقي'
              : 'تبديل';
    const uniq = [...new Map(pairs.map((p) => [`${p.from}>${p.to}`, p])).values()].slice(0, 24);
    const affected = [...new Set(uniq.map((p) => textOf(p.from)).filter((t): t is string => t !== null))];
    features.push({
      tag: f.tag,
      table: 'GSUB',
      name: nameOf(f.feature.featureParams?.nameID),
      kind,
      lookups: idx.length,
      pairs: uniq,
      sample: context || affected.slice(0, 12).join(' '),
    });
  }

  for (const f of arr(kit.GPOS?.featureList)) {
    if (seen.has(f.tag)) continue;
    seen.add(f.tag);
    features.push({
      tag: f.tag,
      table: 'GPOS',
      kind: 'تموضع',
      lookups: arr(f.feature.lookupListIndexes).length,
      pairs: [],
      sample: '',
    });
  }

  const scripts = new Map<string, Set<string>>();
  for (const t of [kit.GSUB, kit.GPOS])
    for (const s of arr(t?.scriptList)) {
      const langs = scripts.get(s.tag) ?? new Set<string>();
      for (const l of arr(s.script.langSysRecords)) langs.add(l.tag.trim());
      scripts.set(s.tag, langs);
    }

  const report: OtReport = {
    features,
    ligatures,
    scripts: [...scripts].map(([tag, langs]) => ({ tag, langs: [...langs] })),
    alternates: [...alternates].map(([from, to]) => ({ from, to })),
  };
  cache.set(kit, report);
  return report;
}

/** أسماء الكتابات واللغات في جداول OpenType بالعربية، ورمز BCP-47 لتطبيق الأشكال المحلّية (locl) */
export const SCRIPT_NAME: Record<string, string> = {
  DFLT: 'افتراضي',
  arab: 'العربية',
  latn: 'اللاتينية',
  syrc: 'السريانية',
  hebr: 'العبرية',
  grek: 'اليونانية',
  cyrl: 'السيريلية',
};
export const LANG_INFO: Record<string, { name: string; bcp: string }> = {
  ARA: { name: 'العربية', bcp: 'ar' },
  URD: { name: 'الأردية', bcp: 'ur' },
  FAR: { name: 'الفارسية', bcp: 'fa' },
  KUR: { name: 'الكردية', bcp: 'ku' },
  SND: { name: 'السندية', bcp: 'sd' },
  KSH: { name: 'الكشميرية', bcp: 'ks' },
  MLY: { name: 'الملايوية', bcp: 'ms' },
  PAS: { name: 'البشتوية', bcp: 'ps' },
  UYG: { name: 'الأويغورية', bcp: 'ug' },
  TRK: { name: 'التركية', bcp: 'tr' },
  ENG: { name: 'الإنجليزية', bcp: 'en' },
};

const hexName = (cp: number) =>
  cp <= 0xffff ? `uni${cp.toString(16).toUpperCase().padStart(4, '0')}` : `u${cp.toString(16).toUpperCase()}`;
const nameCache = new WeakMap<object, Map<number, string>>();

/**
 * أسماء المحارف — من جدول post إن وُجدت، وإلا تُشتقّ كما تفعل برامج التصميم (post v3 بلا أسماء، مثل Amiri):
 * المرمّز ← uniXXXX، وناتج ميزة تبديل ← اسم أصله + .tag (uni0628.init، uni0628.ss01)، والربطة ← أسماء حروفها بـ _.
 */
export function glyphNames(font: LabFont): Map<number, string> {
  const kit = font.kit as unknown as Kit & { getGlyph(id: number): { name?: string } };
  const hit = nameCache.get(kit);
  if (hit) return hit;
  const names = new Map<number, string>();
  for (const cp of kit.characterSet) {
    const id = kit.glyphForCodePoint(cp).id;
    if (id && !names.has(id)) names.set(id, hexName(cp));
  }
  const lookups = arr(kit.GSUB?.lookupList);
  // الأشكال السياقية أولاً (uni0628.init)، و«كل البدائل» aalt أخيراً — لا تسمّي ما لغيرها اسم أدقّ
  const rank = (t: string) => (t in FORM_TEXT ? 0 : t === 'aalt' ? 2 : 1);
  const feats = arr(kit.GSUB?.featureList).sort((a, b) => rank(a.tag) - rank(b.tag));
  // جولتان: ناتج ميزة قد يكون أصلاً لميزة أخرى (init ← init.ss01)
  for (let pass = 0; pass < 2; pass++)
    for (const f of feats)
      for (const i of arr(f.feature.lookupListIndexes)) {
        const lookup = lookups[i];
        if (!lookup) continue;
        for (const raw of arr(lookup.subTables)) {
          const [s, type] = unwrap(raw, lookup.lookupType);
          if (type !== 1 && type !== 2 && type !== 3) continue;
          const subst = arr(s.substitute);
          const seqs = arr(type === 3 ? s.alternateSet : s.sequences);
          coverageGlyphs(s.coverage).forEach((g, k) => {
            const base = names.get(g);
            if (!base) return;
            const outs =
              type === 1
                ? [s.deltaGlyphID !== undefined ? (g + s.deltaGlyphID) & 0xffff : subst[k]]
                : type === 2
                  ? arr(seqs[k]).length === 1
                    ? arr(seqs[k])
                    : []
                  : arr(seqs[k]);
            outs.forEach((to, n) => {
              if (to === undefined || to === g || names.has(to)) return;
              names.set(to, `${base}.${f.tag}${type === 3 && n ? n + 1 : ''}`);
            });
          });
        }
      }
  for (const l of analyzeOpenType(font).ligatures)
    if (!names.has(l.glyph)) names.set(l.glyph, [...l.text].map((c) => hexName(c.codePointAt(0)!)).join('_'));
  // الاسم الحقيقي من الملف يتقدّم دائماً
  for (let g = 0; g < font.glyphCount; g++) {
    const n = kit.getGlyph(g).name;
    if (n) names.set(g, n);
  }
  if (!names.has(0)) names.set(0, '.notdef');
  nameCache.set(kit, names);
  return names;
}
