/**
 * تحميل ملفات الخطوط محلياً: ملفات مفردة، مجلّد، أو ZIP. لا شيء يُرفع — كل الملفات تُقرأ في
 * المتصفّح، وتُسجَّل عبر FontFace (والمتصفّح يعقّم الملف قبل استخدامه).
 */
import { unzipSync } from 'fflate';
import * as fontkit from 'fontkit';

import type { Axis, LabFont } from '../types';

export const FONT_EXTS = ['otf', 'ttf', 'ttc', 'woff', 'woff2'] as const;
export const ACCEPT = [...FONT_EXTS, 'zip'].map((e) => `.${e}`).join(',');
const MAX_FILE = 30 * 1024 * 1024;
const MAX_ZIP = 80 * 1024 * 1024;
const MAX_FONTS = 40;

export type LoadReport = { fonts: LabFont[]; skipped: { name: string; reason: string }[] };

/** جدول الملفات — موجود في fontkit وغير معرّف في أنواعه */
const tablesOf = (kit: fontkit.Font) =>
  (kit as unknown as { directory: { tables: Record<string, unknown> } }).directory.tables;
const ext = (name: string) => name.split('.').pop()?.toLowerCase() ?? '';
let seq = 0;

type Raw = { name: string; data: Uint8Array };

/** يفكّ ZIP ويأخذ ملفات الخطوط منه فقط (يتجاهل __MACOSX والملفات المخفية) */
function fromZip(name: string, data: Uint8Array, skipped: LoadReport['skipped']): Raw[] {
  try {
    const files = unzipSync(data, {
      filter: (f) =>
        !f.name.includes('__MACOSX') &&
        !f.name.split('/').pop()!.startsWith('.') &&
        (FONT_EXTS as readonly string[]).includes(ext(f.name)) &&
        f.originalSize <= MAX_FILE,
    });
    const out = Object.entries(files).map(([n, d]) => ({ name: n.split('/').pop()!, data: d }));
    if (!out.length) skipped.push({ name, reason: 'لا يحتوي ملفات خطوط' });
    return out;
  } catch {
    skipped.push({ name, reason: 'ملف ZIP تالف' });
    return [];
  }
}

function formatOf(kit: fontkit.Font, name: string): LabFont['format'] {
  const t = (kit as unknown as { type: string }).type;
  if (t === 'WOFF' || t === 'WOFF2') return t;
  return ext(name) === 'otf' || 'CFF ' in tablesOf(kit) || 'CFF2' in tablesOf(kit) ? 'OTF' : 'TTF';
}

function featuresOf(kit: fontkit.Font) {
  const seen = new Set<string>();
  const out: LabFont['features'] = [];
  for (const table of ['GSUB', 'GPOS'] as const) {
    const list = (kit as unknown as Record<string, { featureList?: { tag: string }[] } | undefined>)[table]
      ?.featureList;
    for (const f of list ?? [])
      if (!seen.has(f.tag)) {
        seen.add(f.tag);
        out.push({ tag: f.tag, table });
      }
  }
  return out.sort((a, b) => a.tag.localeCompare(b.tag));
}

const NAME_KEYS: [string, string][] = [
  ['fontFamily', 'العائلة'],
  ['fontSubfamily', 'النمط'],
  ['fullName', 'الاسم الكامل'],
  ['postscriptName', 'اسم PostScript'],
  ['version', 'الإصدار'],
  ['designer', 'المصمّم'],
  ['manufacturer', 'الجهة المصنّعة'],
  ['designerURL', 'موقع المصمّم'],
  ['vendorURL', 'موقع الجهة'],
  ['copyright', 'حقوق النشر'],
  ['trademark', 'العلامة التجارية'],
  ['license', 'الترخيص'],
  ['licenseURL', 'رابط الترخيص'],
  ['description', 'الوصف'],
];

async function toLabFont(kit: fontkit.Font, name: string, bytes: number, data: Uint8Array, ttc: boolean) {
  const id = `f${++seq}`;
  const css = `lab-${id}`;
  const k = kit as unknown as {
    getName(key: string): string | null;
    'OS/2'?: { usWeightClass?: number; fsSelection?: { italic?: boolean } };
    italicAngle?: number;
    variationAxes: Record<string, { name: string; min: number; default: number; max: number }>;
    namedVariations: Record<string, Record<string, number>>;
  };
  const axes: Axis[] = Object.entries(k.variationAxes ?? {}).map(([tag, a]) => ({ tag, ...a }));
  const weight = k['OS/2']?.usWeightClass ?? 400;
  const italic = !!k['OS/2']?.fsSelection?.italic || (kit.italicAngle ?? 0) !== 0;
  const family = kit.familyName || name;
  const familyCss = `labfam-${family.replace(/[^\w-]/g, '_')}`;

  // ملف لكل خط + تسجيل ضمن عائلته (بوزنه ونمطه) — فتختار CSS الوزن الحقيقي حين يوجد
  const buffer = data.slice().buffer;
  const variableWeight = axes.find((a) => a.tag === 'wght');
  const descriptors: FontFaceDescriptors = {
    weight: variableWeight ? `${variableWeight.min} ${variableWeight.max}` : String(weight),
    style: italic ? 'italic' : 'normal',
  };
  // ملفات TTC: نحاول تسجيلها كما هي؛ إن رفضها المتصفّح يبقى التحليل متاحاً بلا معاينة
  let previewable = true;
  try {
    for (const f of [new FontFace(css, buffer, descriptors), new FontFace(familyCss, buffer, descriptors)])
      document.fonts.add(await f.load());
  } catch {
    previewable = false;
  }

  const outline = 'CFF2' in tablesOf(kit) ? 'CFF2' : 'CFF ' in tablesOf(kit) ? 'CFF' : 'TrueType (glyf)';
  const font: LabFont = {
    id,
    fileName: name,
    bytes,
    format: ttc ? 'TTC' : formatOf(kit, name),
    css,
    previewable,
    familyCss,
    family,
    style: kit.subfamilyName || 'Regular',
    fullName: kit.fullName || family,
    postscript: kit.postscriptName || '',
    version: k.getName('version') ?? '',
    weight,
    italic,
    names: NAME_KEYS.map(([key, label]) => ({ label, value: k.getName(key) ?? '' })).filter((n) => n.value),
    unitsPerEm: kit.unitsPerEm,
    metrics: {
      ascent: kit.ascent,
      descent: kit.descent,
      lineGap: kit.lineGap,
      capHeight: kit.capHeight,
      xHeight: kit.xHeight,
    },
    glyphCount: kit.numGlyphs,
    codepoints: [...kit.characterSet].sort((a, b) => a - b),
    outline,
    tables: Object.keys(tablesOf(kit)).sort(),
    features: featuresOf(kit),
    axes,
    instances: Object.entries(k.namedVariations ?? {}).map(([n, coords]) => ({ name: n, coords })),
    kit,
  };
  return font;
}

/** يقرأ الملفات (أو ZIP) ويعيد الخطوط الصالحة وما تُجوهل مع السبب */
export async function loadFiles(files: Iterable<File>): Promise<LoadReport> {
  const skipped: LoadReport['skipped'] = [];
  const raws: Raw[] = [];
  for (const file of files) {
    const e = ext(file.name);
    if (e === 'zip') {
      if (file.size > MAX_ZIP) {
        skipped.push({ name: file.name, reason: 'أكبر من 80 ميغابايت' });
        continue;
      }
      raws.push(...fromZip(file.name, new Uint8Array(await file.arrayBuffer()), skipped));
    } else if ((FONT_EXTS as readonly string[]).includes(e)) {
      if (file.size > MAX_FILE) skipped.push({ name: file.name, reason: 'أكبر من 30 ميغابايت' });
      else raws.push({ name: file.name, data: new Uint8Array(await file.arrayBuffer()) });
    } else if (!file.name.startsWith('.')) {
      skipped.push({ name: file.name, reason: 'ليست ملف خط' });
    }
  }

  const fonts: LabFont[] = [];
  for (const raw of raws) {
    if (fonts.length >= MAX_FONTS) {
      skipped.push({ name: raw.name, reason: `الحدّ ${MAX_FONTS} خطاً في المرّة` });
      continue;
    }
    try {
      const parsed = fontkit.create(raw.data as unknown as Buffer) as fontkit.Font | fontkit.FontCollection;
      const kits = 'fonts' in parsed ? parsed.fonts : [parsed];
      for (const kit of kits)
        fonts.push(await toLabFont(kit, raw.name, raw.data.byteLength, raw.data, 'fonts' in parsed));
    } catch {
      skipped.push({ name: raw.name, reason: 'تعذّرت قراءة الملف — قد يكون تالفاً أو بصيغة غير مدعومة' });
    }
  }
  return { fonts, skipped };
}

/** يجلب حزمة خط مجاني من حرف (ZIP بترخيص OFL) لتجربة المختبر بلا ملفات */
export async function loadLibraryPackage(url: string, name: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('تعذّر تحميل الخط');
  const blob = await res.blob();
  return loadFiles([new File([blob], `${name}.zip`, { type: 'application/zip' })]);
}
