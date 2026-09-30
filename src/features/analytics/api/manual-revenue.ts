import { z } from 'zod';

import { requireAdmin } from '@/lib/auth';
import type { Money } from '@/types/domain/commerce';

/** إيرادات خارج المتجر يسجّلها المشرف يدوياً: تصميم خط لعميل، تطوير خط، مخطوطة… */
export const REVENUE_CATEGORIES = [
  'font-design',
  'font-development',
  'manuscript-design',
  'lettering',
  'consulting',
  'other',
] as const;
export type RevenueCategory = (typeof REVENUE_CATEGORIES)[number];

export const REVENUE_CATEGORY_LABEL: Record<RevenueCategory, string> = {
  'font-design': 'تصميم خط',
  'font-development': 'تطوير خط',
  'manuscript-design': 'تصميم مخطوطة',
  lettering: 'شعار حروفي',
  consulting: 'استشارة',
  other: 'أخرى',
};

export type ManualRevenue = {
  id: string;
  category: RevenueCategory;
  client: string;
  note: string;
  amount: Money;
  /** YYYY-MM-DD */
  date: string;
};

export type RevenueFormState = {
  ok?: boolean;
  message?: string;
  fields?: Partial<Record<'category' | 'amount' | 'client' | 'date' | 'note', string>>;
  entry?: ManualRevenue;
  /** ما كتبه المشرف — يعود إلى الحقول بعد خطأ (React يفرّغ النموذج بعد كل إرسال) */
  values?: Record<string, string>;
} | null;

/** تاريخ اليوم بتوقيت الجهاز (لا UTC) — YYYY-MM-DD */
export const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const today = localToday;

const schema = z.object({
  category: z.enum(REVENUE_CATEGORIES, { message: 'اختر نوع الإيراد.' }),
  amount: z
    .string()
    .trim()
    .regex(/^\d{1,7}(\.\d{1,2})?$/, 'اكتب مبلغاً بالدولار، مثل 250 أو 99.50.')
    .transform(Number)
    .refine((n) => n > 0, 'المبلغ يجب أن يكون أكبر من صفر.')
    .refine((n) => n <= 1_000_000, 'المبلغ أكبر من المسموح.'),
  client: z.string().trim().min(2, 'اكتب اسم العميل أو الجهة.').max(80, 'أقصر من 80 حرفاً.'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'اختر التاريخ.')
    .refine((d) => !Number.isNaN(Date.parse(d)), 'تاريخ غير صالح.')
    .refine((d) => d <= today(), 'التاريخ لا يكون في المستقبل.'),
  note: z.string().trim().max(200, 'أقصر من 200 حرف.'),
});

/**
 * التحقّق وإنشاء القيد. ⚠️ عرض: التخزين في هذا المتصفّح؛ مع الخادم يصير هذا طلب POST يعيد
 * الخادم فيه التحقّق نفسه ويتأكّد من دور المشرف ويسجّل من أضاف القيد ومتى (سجلّ تدقيق).
 */
export function createRevenue(_prev: RevenueFormState, form: FormData): RevenueFormState {
  if (!requireAdmin()) return { ok: false, message: 'هذه العملية للمشرف وحده.' };
  const raw = Object.fromEntries(
    ['category', 'amount', 'client', 'date', 'note'].map((k) => [k, String(form.get(k) ?? '').slice(0, 300)]),
  );
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return {
      ok: false,
      fields: Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v?.[0]])),
      values: raw as Record<string, string>,
    };
  }
  const v = parsed.data;
  return {
    ok: true,
    entry: {
      id: `R-${Date.now().toString(36).toUpperCase()}`,
      category: v.category,
      client: v.client,
      note: v.note,
      amount: { cents: Math.round(v.amount * 100), currency: 'USD' },
      date: v.date,
    },
  };
}

const KEY = 'harf-manual-revenue';

/** قراءة آمنة: أي عنصر لا يطابق الشكل يُهمل (التخزين المحلي قابل للتعديل من المستخدم) */
export function readRevenue(): ManualRevenue[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]') as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.filter(isEntry).slice(0, 500);
  } catch {
    return [];
  }
}

export function writeRevenue(list: ManualRevenue[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* التخزين غير متاح — تبقى القيود لهذه الزيارة */
  }
}

function isEntry(x: unknown): x is ManualRevenue {
  if (!x || typeof x !== 'object') return false;
  const e = x as Record<string, unknown>;
  const amount = e.amount as Record<string, unknown> | undefined;
  return (
    typeof e.id === 'string' &&
    (REVENUE_CATEGORIES as readonly string[]).includes(e.category as string) &&
    typeof e.client === 'string' &&
    typeof e.note === 'string' &&
    typeof e.date === 'string' &&
    typeof amount?.cents === 'number' &&
    Number.isFinite(amount.cents) &&
    amount.currency === 'USD'
  );
}
