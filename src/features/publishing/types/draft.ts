import { z } from 'zod';

import { CATEGORIES, LANGS } from '@/types/domain/font';

/**
 * مسودّة النشر — المخطّط نفسه يتحقّق في المتصفّح (لتسمية النواقص) وعلى الخادم (المرجع).
 * الأسعار هنا ما يقترحه المصمّم؛ حدودها وعمولة المنصّة تقرّرها سياسة حرف.
 */
export const FONT_FILE_EXTS = ['otf', 'ttf', 'woff2'] as const;
export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
export const MAX_FONT_BYTES = 50 * 1024 * 1024;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_DESCRIPTION = 400;

/** أنماط الخط الكلاسيكي — تظهر عند اختيار «كلاسيكية» */
export const CLASSIC_STYLES = ['kufi', 'naskh', 'thuluth', 'ruqaa', 'diwani', 'nastaliq', 'farsi'] as const;
export const CLASSIC_STYLE_LABEL: Record<(typeof CLASSIC_STYLES)[number], string> = {
  kufi: 'الخط الكوفي',
  naskh: 'خط النسخ',
  thuluth: 'خط الثلث',
  ruqaa: 'خط الرقعة',
  diwani: 'الخط الديواني',
  nastaliq: 'خط النستعليق',
  farsi: 'الخط الفارسي',
};
/** معرّف حساب/مسبك — نصّ قصير آمن (يُتحقّق على الخادم أنه موجود) */
const accountId = z.string().regex(/^[a-z0-9-]{1,40}$/);

const fileMeta = z.object({
  name: z.string().min(1).max(180),
  size: z.number().int().positive().max(MAX_FONT_BYTES),
  weight: z.number().int().min(100).max(1000),
  style: z.string().max(40),
  format: z.enum(FONT_FILE_EXTS),
});

const https = z
  .string()
  .trim()
  .max(300)
  .refine((v) => /^https:\/\/[^\s/$.?#][^\s]*$/i.test(v), 'رابط يبدأ بـ https://');

export const draftSchema = z
  .object({
    mode: z.enum(['studio', 'admin']),
    files: z.array(fileMeta).min(1, 'ارفع ملف خط واحداً على الأقل.').max(40),
    images: z.number().int().min(1, 'أضف صورة غلاف واحدة على الأقل.').max(12),
    nameLatin: z
      .string()
      .trim()
      .min(2, 'اكتب اسم الخط بالحروف اللاتينية.')
      .max(60)
      .refine((v) => !v || /^[A-Za-z0-9][A-Za-z0-9 .'-]*$/.test(v), 'حروف لاتينية وأرقام فقط، مثل: Tufula Sans.'),
    nameAr: z
      .string()
      .trim()
      .max(60)
      .refine((v) => !v || v.length >= 2, 'الاسم العربي حرفان على الأقل، أو اتركه فارغاً.'),
    designers: z.array(accountId).min(1, 'أضف مصمّماً واحداً على الأقل.').max(8, 'ثمانية مصمّمين على الأكثر.'),
    foundries: z.array(accountId).max(4, 'أربعة مسابك على الأكثر.'),
    styles: z.array(z.enum(CLASSIC_STYLES)),
    description: z.string().trim().max(MAX_DESCRIPTION, `الوصف أطول من ${MAX_DESCRIPTION} حرف.`),
    categories: z.array(z.enum(CATEGORIES)).min(1, 'اختر تصنيفاً واحداً على الأقل.'),
    langs: z.array(z.enum(LANGS)).min(1, 'اختر لغة واحدة على الأقل.'),
    availability: z.enum(['free', 'paid']),
    trial: z.boolean(),
    familyPrice: z.number().min(0).max(10000),
    singlePct: z.number().min(5).max(100),
    source: z.object({
      kind: z.enum(['purchased', 'free', 'trial']),
      url: z.string().max(300),
      site: z.string().max(80),
      license: z.enum(['personal', 'commercial', 'ofl']),
    }),
    consent: z.literal(true, 'أقرّ بملكية الحقوق قبل الإرسال.'),
  })
  .superRefine((d, ctx) => {
    if (d.styles.length && !d.categories.includes('classic'))
      ctx.addIssue({ code: 'custom', path: ['styles'], message: 'أنماط الخط للتصنيف الكلاسيكي فقط.' });
    if (d.mode === 'studio' && d.availability === 'paid' && d.familyPrice <= 0)
      ctx.addIssue({ code: 'custom', path: ['familyPrice'], message: 'حدّد سعر العائلة للخط المدفوع.' });
    if (d.mode === 'admin') {
      const r = https.safeParse(d.source.url);
      if (!r.success)
        ctx.addIssue({ code: 'custom', path: ['source', 'url'], message: 'رابط صفحة الخط في المصدر يبدأ بـ https://' });
    }
  });

export type Draft = z.input<typeof draftSchema>;
export type FileMeta = z.infer<typeof fileMeta>;

/** حالة المسودّة أثناء العمل (الإقرار قد لا يكون بعد) */
export type WorkDraft = Omit<Draft, 'consent'> & { consent: boolean };

export const EMPTY_DRAFT: WorkDraft = {
  mode: 'studio',
  files: [],
  images: 0,
  nameLatin: '',
  nameAr: '',
  designers: [],
  foundries: [],
  styles: [],
  description: '',
  categories: [],
  langs: [],
  availability: 'paid',
  trial: true,
  familyPrice: 40,
  singlePct: 45,
  source: { kind: 'purchased', url: '', site: '', license: 'commercial' },
  consent: false,
};

/** النواقص حسب الخطوة — لتسميتها في المراجعة بدل زرّ معطّل صامت */
export const STEP_OF_FIELD: Record<string, number> = {
  files: 0,
  images: 1,
  nameLatin: 2,
  nameAr: 2,
  designers: 2,
  foundries: 2,
  styles: 2,
  description: 2,
  categories: 2,
  langs: 2,
  familyPrice: 3,
  source: 3,
  consent: 4,
};

/**
 * استرجاع مسودّة محفوظة في المتصفّح بأمان: تُهمَل القيم بشكل غير متوقّع (نسخة أقدم، أو عُدّلت يدوياً)
 * بدل أن تكسر الصفحة — والتحقّق الكامل يبقى عند الإرسال.
 */
export function restoreDraft(raw: unknown): Partial<WorkDraft> {
  if (!raw || typeof raw !== 'object') return {};
  const x = raw as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : undefined);
  const ids = (v: unknown) =>
    Array.isArray(v)
      ? v.filter((i): i is string => typeof i === 'string' && /^[a-z0-9-]{1,40}$/.test(i)).slice(0, 8)
      : [];
  const out: Partial<WorkDraft> = {
    nameLatin: str(x.nameLatin, 60) ?? '',
    nameAr: str(x.nameAr, 60) ?? '',
    description: str(x.description, MAX_DESCRIPTION) ?? '',
    designers: ids(x.designers),
    foundries: ids(x.foundries).slice(0, 4),
    styles: Array.isArray(x.styles)
      ? x.styles.filter((s): s is (typeof CLASSIC_STYLES)[number] => (CLASSIC_STYLES as readonly unknown[]).includes(s))
      : [],
  };
  const keep = [
    'mode',
    'images',
    'categories',
    'langs',
    'availability',
    'trial',
    'familyPrice',
    'singlePct',
    'source',
  ] as const;
  for (const k of keep) if (k in x) (out as Record<string, unknown>)[k] = x[k];
  return out;
}
