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
    nameAr: z.string().trim().min(2, 'اكتب اسم الخط بالعربية.').max(60),
    nameLatin: z
      .string()
      .trim()
      .max(60)
      .regex(/^[\w\s.-]*$/, 'حروف لاتينية وأرقام فقط.'),
    designers: z.string().trim().min(2, 'اكتب اسم المصمّم.').max(120),
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
  nameAr: '',
  nameLatin: '',
  designers: '',
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
  nameAr: 2,
  nameLatin: 2,
  designers: 2,
  description: 2,
  categories: 2,
  langs: 2,
  familyPrice: 3,
  source: 3,
  consent: 4,
};
