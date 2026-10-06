import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth';
import { deleteManuscriptSvg, storeManuscriptSvg } from '@/lib/media-store';
import { publicFonts } from '@/stores/catalog-overrides';
import { addSubmission, getSubmissions, MAX_PENDING_PER_USER, newReference } from '@/stores/manuscript-submissions';
import { getVerification, statusOf } from '@/stores/studio-verification';
import { MOCK_FONTS } from '@/testing/mocks/fonts';
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

const manuscriptSchema = z.object({
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

export type ManuscriptResult =
  { ok: true; reference: string } | { ok: false; errors: { path: string; message: string }[] };

const fail = (path: string, message: string): ManuscriptResult => ({ ok: false, errors: [{ path, message }] });

/**
 * إرسال المخطوطة للمراجعة — للاستوديو الموثّق (أو قيد التوثيق) كنشر الخطوط تماماً.
 * صاحب الطلب من الجلسة لا من النموذج، والملف يُعاد فحصه قبل حفظه (storeManuscriptSvg).
 * ⚠️ عرض: يُحفظ الطلب في هذا المتصفّح؛ في المنتج يُرفع الملف ويُعاد فحصه على الخادم ويدخل طابور المراجعة.
 */
export async function submitManuscript(input: unknown, svgText: string): Promise<ManuscriptResult> {
  const user = getCurrentUser();
  if (!user || user.plan !== 'studio') return fail('auth', 'رفع المخطوطات لحساب الاستوديو.');
  if (user.role !== 'admin') {
    const status = statusOf(user.id);
    if (status !== 'pending' && status !== 'approved') return fail('auth', 'وثّق حسابك أولاً لتنشر.');
  }
  const parsed = manuscriptSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      errors: parsed.error.issues.map((i) => ({ path: String(i.path[0] ?? ''), message: i.message })),
    };
  const pending = getSubmissions().filter((s) => s.userId === user.id && s.status === 'pending').length;
  if (pending >= MAX_PENDING_PER_USER)
    return fail('auth', `لديك ${MAX_PENDING_PER_USER} طلباً بانتظار المراجعة — انتظر القرار فيها أولاً.`);

  const stored = await storeManuscriptSvg(svgText);
  if (!stored.ok) return fail('file', stored.error);
  const d = parsed.data;
  const reference = newReference();
  const saved = addSubmission({
    reference,
    userId: user.id,
    studioName: getVerification(user.id).info.studioName ?? user.name,
    title: d.title,
    category: d.category,
    fonts: d.fonts.map((id) => ({ id, name: libraryFontById(id)?.name ?? id })),
    license: d.license,
    note: d.note,
    file: { ...d.file, id: stored.id },
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
  if (!saved) {
    void deleteManuscriptSvg(stored.id);
    return fail('file', 'تعذّر الحفظ في هذا المتصفّح.');
  }
  return { ok: true, reference };
}
