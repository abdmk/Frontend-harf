import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth';
import { updateAccountProfile } from '@/stores/account-profile';
import { clientKey, hit } from '@/utils/rate-limit';

/** إجراءات الحساب — ⚠️ عرض: يُتحقّق من المدخلات ولا تُخزَّن بعد (لا قاعدة بيانات). */
export type FormState = {
  ok?: boolean;
  message?: string;
  fields?: Record<string, string | undefined>;
  values?: Record<string, string>;
} | null;

const url = z
  .string()
  .trim()
  .max(200)
  .refine((v) => v === '' || /^https:\/\/[^\s/$.?#].[^\s]*$/i.test(v), 'الرابط يجب أن يبدأ بـ https://');

const profileSchema = z.object({
  name: z.string().trim().min(2, 'اكتب اسمك.').max(80, 'الاسم أطول من المسموح.'),
  profession: z.string().trim().max(60, 'أقصر من 60 حرفاً.'),
  location: z.string().trim().max(60, 'أقصر من 60 حرفاً.'),
  website: url,
});

export function updateProfile(_prev: FormState, form: FormData): FormState {
  if (!getCurrentUser()) return { ok: false, message: 'سجّل الدخول أوّلاً.' };
  const values = Object.fromEntries(
    ['name', 'profession', 'location', 'website'].map((k) => [k, String(form.get(k) ?? '').slice(0, 200)]),
  );
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return { ok: false, values, fields: Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v?.[0]])) };
  }
  const me = getCurrentUser()!;
  const d = parsed.data as Record<string, string | undefined>;
  // تُحفظ في مصدر بيانات الحساب الواحد — فيتحدّث الاسم في الترويسة والقائمة وكل مكان فوراً
  const ok = updateAccountProfile(me.id, {
    name: d.name,
    profession: d.profession || undefined,
    location: d.location || undefined,
    website: d.website || undefined,
  });
  if (!ok) return { ok: false, values, message: 'تعذّر الحفظ — مساحة التخزين ممتلئة.' };
  return { ok: true, values, message: 'حُفظت معلوماتك.' };
}

const passwordSchema = z
  .object({
    current: z.string().min(1, 'اكتب كلمة المرور الحالية.').max(128),
    next: z.string().min(8, '8 أحرف على الأقل.').max(128).regex(/\d/, 'أضف رقماً واحداً على الأقل.'),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { path: ['confirm'], message: 'التأكيد لا يطابق كلمة المرور الجديدة.' })
  .refine((v) => v.next !== v.current, { path: ['next'], message: 'اختر كلمة مختلفة عن الحالية.' });

export function changePassword(_prev: FormState, form: FormData): FormState {
  if (!getCurrentUser()) return { ok: false, message: 'سجّل الدخول أوّلاً.' };
  if (!hit(clientKey('password'), 5, 15 * 60_000)) return { ok: false, message: 'محاولات كثيرة. حاول لاحقاً.' };
  const parsed = passwordSchema.safeParse({
    current: form.get('current'),
    next: form.get('next'),
    confirm: form.get('confirm'),
  });
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return { ok: false, fields: Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v?.[0]])) };
  }
  return { ok: true, message: 'تغيّرت كلمة المرور، وأُنهيت الجلسات الأخرى (عرض).' };
}
