'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { safeNext, setDemoSession } from '@/lib/auth';
import { clientKey, hit } from '@/lib/rate-limit';

/**
 * الدخول وإنشاء الحساب — ⚠️ عرض: لا توجد قاعدة مستخدمين بعد.
 * ما هو حقيقي هنا: التحقّق على الخادم، حدّ المحاولات، منع إعادة التوجيه المفتوح،
 * ورسائل خطأ عامة لا تكشف إن كان البريد مسجّلاً.
 * عند الربط: تجزئة كلمات المرور (Argon2id/bcrypt)، جلسات موقّعة، تحقّق البريد، و2FA اختياري.
 */
export type AuthState = {
  error?: string;
  fields?: Partial<Record<'name' | 'email' | 'password' | 'terms', string>>;
  /** ما كتبه المستخدم (بلا كلمة المرور) كي لا يُمسح النموذج عند الخطأ */
  values?: { name?: string; email?: string };
  sent?: string;
} | null;

const keep = (form: FormData) => ({
  name: String(form.get('name') ?? '').slice(0, 80),
  email: String(form.get('email') ?? '').slice(0, 254),
});

const email = z.string().trim().toLowerCase().email('اكتب بريداً إلكترونياً صحيحاً.').max(254);
const password = z.string().min(8, 'كلمة المرور 8 أحرف على الأقل.').max(128, 'كلمة المرور أطول من المسموح.');

const loginSchema = z.object({ email, password: z.string().min(1, 'اكتب كلمة المرور.').max(128) });

export async function signIn(_prev: AuthState, form: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({ email: form.get('email'), password: form.get('password') });
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return { fields: { email: f.email?.[0], password: f.password?.[0] }, values: keep(form) };
  }
  // 5 محاولات لكل (عنوان + بريد) كل 10 دقائق، و20 لكل عنوان
  const allowed =
    hit(await clientKey('login', parsed.data.email), 5, 10 * 60_000) &&
    hit(await clientKey('login-ip'), 20, 10 * 60_000);
  if (!allowed) return { error: 'محاولات كثيرة. انتظر قليلاً ثم حاول مجدداً.', values: keep(form) };

  // عرض: أي بيانات صالحة الشكل تُدخلك؛ بريد يحوي «studio» يفتح حساب الاستوديو التجريبي
  await setDemoSession(parsed.data.email.includes('studio') ? 'studio' : 'free');
  redirect(safeNext(form.get('next')));
}

const registerSchema = z.object({
  name: z.string().trim().min(2, 'اكتب اسمك.').max(80),
  email,
  password: password.regex(/[A-Za-z؀-ۿ]/, 'أضف حرفاً واحداً على الأقل.').regex(/\d/, 'أضف رقماً واحداً على الأقل.'),
  terms: z.literal('on', 'يجب الموافقة على الشروط.'),
});

export async function signUp(_prev: AuthState, form: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: form.get('name'),
    email: form.get('email'),
    password: form.get('password'),
    terms: form.get('terms') ?? undefined,
  });
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return {
      fields: { name: f.name?.[0], email: f.email?.[0], password: f.password?.[0], terms: f.terms?.[0] },
      values: keep(form),
    };
  }
  if (!hit(await clientKey('register'), 5, 60 * 60_000)) return { error: 'محاولات كثيرة. حاول لاحقاً.' };
  // الردّ نفسه سواء كان البريد مسجّلاً أم لا — كي لا يُستعمل النموذج لاكتشاف الحسابات
  return { sent: parsed.data.email };
}
