import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth';
import { publicFonts } from '@/lib/catalog-overrides';
import { asObject, createJsonStore } from '@/lib/json-store';
import { statusOf } from '@/lib/studio-verification';
import { MOCK_FONTS } from '@/mocks/fonts';
import { MANUSCRIPT_CATEGORIES } from '@/types/domain/manuscript';

import type { DirectoryEntry } from './directory';

/** خطوط مكتبة حرف كمدخلات اختيار — «بأيّ خط كُتب العمل؟» */
const FONT_ENTRIES: DirectoryEntry[] = publicFonts(MOCK_FONTS).map((f) => ({
  id: f.id,
  name: f.name,
  handle: f.id,
  sub: f.designerLabel ?? f.designers.map((d) => d.nameAr).join('، '),
}));
export const searchLibraryFonts = (q: string, exclude: readonly string[] = []) => {
  const t = q.trim().toLowerCase();
  return FONT_ENTRIES.filter((e) => !exclude.includes(e.id))
    .filter((e) => !t || e.name.toLowerCase().includes(t) || e.handle.includes(t))
    .slice(0, 6);
};
export const libraryFontById = (id: string) => FONT_ENTRIES.find((e) => e.id === id);

export const manuscriptSchema = z.object({
  title: z.string().trim().min(2, 'اكتب عنوان العمل.').max(60, 'العنوان أطول من 60 حرفاً.'),
  category: z.enum(MANUSCRIPT_CATEGORIES, { message: 'اختر التصنيف.' }),
  fonts: z
    .array(z.string())
    .min(1, 'اختر الخط الذي كُتب به العمل.')
    .max(4)
    .refine((ids) => ids.every((id) => !!libraryFontById(id)), 'خط غير موجود في المكتبة.'),
  license: z.enum(['personal', 'commercial']),
  note: z.string().trim().max(240, 'الوصف أطول من 240 حرفاً.').default(''),
  rights: z.literal(true, { message: 'أكّد أنك صاحب العمل أو تملك حقّ نشره.' }),
  file: z.object({
    name: z.string().max(120),
    bytes: z.number().int().positive(),
    width: z.number(),
    height: z.number(),
  }),
});
export type ManuscriptInput = z.input<typeof manuscriptSchema>;

/** ما يُحفظ من الطلب — بيانات فقط، لا محتوى الملف (يُرفع إلى التخزين في المنتج) */
type Submission = { reference: string; title: string; category: string; createdAt: string; status: 'pending' };
const store = createJsonStore<Submission[]>(
  'harf_manuscript_submissions',
  (raw) =>
    (Array.isArray(raw) ? raw : [])
      .map(asObject)
      .filter((s) => typeof s.reference === 'string' && typeof s.title === 'string')
      .map((s) => ({
        reference: String(s.reference),
        title: String(s.title).slice(0, 60),
        category: String(s.category ?? ''),
        createdAt: String(s.createdAt ?? ''),
        status: 'pending' as const,
      }))
      .slice(0, 50),
  [],
);
export const useManuscriptSubmissions = store.use;

export type ManuscriptResult =
  { ok: true; reference: string } | { ok: false; errors: { path: string; message: string }[] };

/**
 * إرسال المخطوطة للمراجعة — للاستوديو الموثّق (أو قيد التوثيق) كنشر الخطوط تماماً.
 * ⚠️ عرض: يُحفظ الطلب في هذا المتصفّح؛ في المنتج يُرفع الملف ويُعاد فحصه على الخادم ويدخل طابور المراجعة.
 */
export function submitManuscript(input: unknown): ManuscriptResult {
  const user = getCurrentUser();
  if (!user || user.plan !== 'studio')
    return { ok: false, errors: [{ path: 'auth', message: 'رفع المخطوطات لحساب الاستوديو.' }] };
  if (user.role !== 'admin') {
    const status = statusOf(user.id);
    if (status !== 'pending' && status !== 'approved')
      return { ok: false, errors: [{ path: 'auth', message: 'وثّق حسابك أولاً لتنشر.' }] };
  }
  const parsed = manuscriptSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      errors: parsed.error.issues.map((i) => ({ path: String(i.path[0] ?? ''), message: i.message })),
    };
  const reference = `MS-${Math.floor(1000 + Math.random() * 8999)}`;
  const saved = store.set([
    {
      reference,
      title: parsed.data.title,
      category: parsed.data.category,
      createdAt: new Date().toISOString(),
      status: 'pending',
    },
    ...store.get(),
  ]);
  if (!saved) return { ok: false, errors: [{ path: 'file', message: 'تعذّر الحفظ في هذا المتصفّح.' }] };
  return { ok: true, reference };
}
