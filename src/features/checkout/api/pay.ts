import { z } from 'zod';

import { COUNTRY_CODES } from '@/config/countries';
import { getCurrentUser } from '@/lib/auth';
import { buildCart, writeCartState } from '@/lib/commerce/server';
import type { Order } from '@/types/domain/commerce';

/**
 * الدفع — ⚠️ محاكاة للعرض. لا تُرسل بيانات البطاقة إلى هذا الإجراء أبداً.
 * عند الربط الحقيقي بالـBackend (Stripe):
 *  1) الخادم يحسب الإجمالي من السلة وينشئ PaymentIntent بمفتاح سرّي.
 *  2) المتصفّح يؤكّد الدفع عبر Stripe Elements (البطاقة لا تمرّ بخوادم حرف).
 *  3) التسليم يتمّ فقط من webhook موقّع من Stripe.
 */
export type PayState =
  | { status: 'idle' }
  | { status: 'invalid'; errors: Partial<Record<'holder' | 'country' | 'cart', string>>; holder?: string }
  | { status: 'declined'; message: string }
  | { status: 'paid'; order: Order };

const schema = z.object({
  holder: z.string().trim().min(2, 'اكتب الاسم الكامل أو اسم الشركة.').max(80, 'الاسم أطول من المسموح.'),
  country: z.enum(COUNTRY_CODES, 'اختر البلد.'),
  method: z.enum(['card', 'apple_pay', 'google_pay']),
  simulateDecline: z.literal('on').optional(),
});

export async function pay(_prev: PayState, form: FormData): Promise<PayState> {
  const parsed = schema.safeParse({
    holder: form.get('holder'),
    country: form.get('country'),
    method: form.get('method'),
    simulateDecline: form.get('simulateDecline') ?? undefined,
  });
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return {
      status: 'invalid',
      errors: { holder: f.holder?.[0], country: f.country?.[0] },
      holder: String(form.get('holder') ?? '').slice(0, 80),
    };
  }

  if (!getCurrentUser()) return { status: 'invalid', errors: { cart: 'سجّل الدخول لإتمام الدفع.' } };
  const cart = buildCart();
  if (!cart.items.length) return { status: 'invalid', errors: { cart: 'السلة فارغة.' } };

  // محاكاة زمن معالجة المصرف
  await new Promise((r) => setTimeout(r, 1200));

  if (parsed.data.simulateDecline) {
    return { status: 'declined', message: 'رفض المصرف العملية، ولم يُخصم أي مبلغ.' };
  }

  const order: Order = {
    id: `HRF-${Math.floor(10000 + Math.random() * 89999)}`,
    status: 'paid',
    total: cart.total,
    method: parsed.data.method,
    last4: parsed.data.method === 'card' ? '4242' : undefined,
    createdAt: new Date().toISOString(),
  };
  writeCartState({ items: [] });
  return { status: 'paid', order };
}
