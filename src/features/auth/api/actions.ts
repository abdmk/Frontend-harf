import { z } from 'zod';

import { safeNext, setDemoSession } from '@/lib/auth';
import { clientKey, hit } from '@/utils/rate-limit';

/**
 * الدخول وإنشاء الحساب — ⚠️ عرض: لا توجد قاعدة مستخدمين بعد.
 * ما هو حقيقي هنا: التحقّق، حدّ المحاولات، منع إعادة التوجيه المفتوح،
 * ورسائل خطأ عامة لا تكشف إن كان البريد مسجّلاً.
 * عند الربط بالـBackend: تجزئة كلمات المرور (Argon2id/bcrypt)، جلسات موقّعة، تحقّق البريد، و2FA اختياري.
 */
export type AuthState = {
  error?: string;
  fields?: Partial<Record<'name' | 'email' | 'password' | 'terms', string>>;
  values?: { name?: string; email?: string };
  sent?: string;
  /** رابط التوجيه بعد نجاح الدخول */
  redirectTo?: string;
} | null;

const keep = (form: FormData) => ({
  name: String(form.get('name') ?? '').slice(0, 80),
  email: String(form.get('email') ?? '').slice(0, 254),
});

const email = z.string().trim().toLowerCase().email('اكتب بريداً إلكترونياً صحيحاً.').max(254);
const password = z.string().min(8, 'كلمة المرور 8 أحرف على الأقل.').max(128, 'كلمة المرور أطول من المسموح.');

const loginSchema = z.object({ email, password: z.string().min(1, 'اكتب كلمة المرور.').max(128) });

export function signIn(_prev: AuthState, form: FormData): AuthState {
  const parsed = loginSchema.safeParse({ email: form.get('email'), password: form.get('password') });
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return { fields: { email: f.email?.[0], password: f.password?.[0] }, values: keep(form) };
  }
  const allowed =
    hit(clientKey('login', parsed.data.email), 5, 10 * 60_000) && hit(clientKey('login-ip'), 20, 10 * 60_000);
  if (!allowed) return { error: 'محاولات كثيرة. انتظر قليلاً ثم حاول مجدداً.', values: keep(form) };

  setDemoSession(parsed.data.email.includes('studio') ? 'studio' : 'free');
  return { redirectTo: safeNext(form.get('next')) };
}

const registerSchema = z.object({
  name: z.string().trim().min(2, 'اكتب اسمك.').max(80),
  email,
  password: password.regex(/[A-Za-z؀-ۿ]/, 'أضف حرفاً واحداً على الأقل.').regex(/\d/, 'أضف رقماً واحداً على الأقل.'),
  terms: z.literal('on', 'يجب الموافقة على الشروط.'),
});

export function signUp(_prev: AuthState, form: FormData): AuthState {
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
  if (!hit(clientKey('register'), 5, 60 * 60_000)) return { error: 'محاولات كثيرة. حاول لاحقاً.' };
  return { sent: parsed.data.email, values: keep(form) };
}
