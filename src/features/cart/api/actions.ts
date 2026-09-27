import { z } from 'zod';

import { quote } from '@/lib/commerce/quote';
import { MAX_CART_ITEMS, selectionSchema } from '@/lib/commerce/selection';
import { couponPercent, getPricing, readCartState, writeCartState } from '@/lib/commerce/server';

/**
 * إجراءات السلة. كل مدخل يُتحقّق منه، ويُعاد حساب السعر من جدوله —
 * المتصفّح يرسل «ماذا اختار» فقط.
 * ⚠️ في الإنتاج: التحقّق والحساب يكونان على الخادم عبر الـAPI.
 */
export type CartActionResult = { ok: true; count: number } | { ok: false; error: string };

const itemId = z.string().regex(/^[a-z0-9]{8,16}$/);
const newId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 12);

function validSelection(input: unknown) {
  const parsed = selectionSchema.safeParse(input);
  if (!parsed.success) return null;
  const pricing = getPricing(parsed.data.fontId);
  return pricing && quote(pricing, parsed.data) ? parsed.data : null;
}

export function addToCart(input: unknown): CartActionResult {
  const selection = validSelection(input);
  if (!selection) return { ok: false, error: 'تعذّرت إضافة هذا الاختيار. راجع خيارات الترخيص.' };
  const state = readCartState();
  const items = state.items.filter((i) => i.selection.fontId !== selection.fontId);
  if (items.length >= MAX_CART_ITEMS) return { ok: false, error: 'السلة ممتلئة.' };
  items.push({ id: newId(), selection });
  writeCartState({ ...state, items });
  return { ok: true, count: items.length };
}

export function updateCartItem(id: unknown, input: unknown): CartActionResult {
  const key = itemId.safeParse(id);
  const selection = validSelection(input);
  if (!key.success || !selection) return { ok: false, error: 'تعذّر تعديل الترخيص.' };
  const state = readCartState();
  const items = state.items.map((i) => (i.id === key.data ? { ...i, selection } : i));
  writeCartState({ ...state, items });
  return { ok: true, count: items.length };
}

export function removeFromCart(id: unknown): CartActionResult {
  const key = itemId.safeParse(id);
  if (!key.success) return { ok: false, error: 'عنصر غير صالح.' };
  const state = readCartState();
  const items = state.items.filter((i) => i.id !== key.data);
  writeCartState({ ...state, items });
  return { ok: true, count: items.length };
}

export type CouponResult = { ok: boolean; message: string } | null;

export function applyCoupon(_prev: CouponResult, form: FormData): CouponResult {
  const code = z.string().trim().max(24).safeParse(form.get('coupon'));
  if (!code.success || !code.data) return { ok: false, message: 'اكتب كود الخصم.' };
  if (!couponPercent(code.data)) return { ok: false, message: 'هذا الكود غير صالح أو منتهٍ.' };
  const state = readCartState();
  writeCartState({ ...state, coupon: code.data.toUpperCase() });
  return { ok: true, message: 'طُبِّق الخصم.' };
}
