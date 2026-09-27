'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { quote } from '@/lib/commerce/quote';
import { MAX_CART_ITEMS, selectionSchema } from '@/lib/commerce/selection';
import { couponPercent, getPricing, readCartState, writeCartState } from '@/lib/commerce/server';

/**
 * إجراءات السلة. كل مدخل يُتحقّق منه على الخادم، ويُعاد حساب السعر من جدوله —
 * المتصفّح يرسل «ماذا اختار» فقط. Next يرفض الإجراءات من أصل مختلف (حماية CSRF).
 */
export type CartActionResult = { ok: true; count: number } | { ok: false; error: string };

const itemId = z.string().regex(/^[a-z0-9]{8,16}$/);
const newId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 12);

async function validSelection(input: unknown) {
  const parsed = selectionSchema.safeParse(input);
  if (!parsed.success) return null;
  const pricing = await getPricing(parsed.data.fontId);
  return pricing && quote(pricing, parsed.data) ? parsed.data : null;
}

export async function addToCart(input: unknown): Promise<CartActionResult> {
  const selection = await validSelection(input);
  if (!selection) return { ok: false, error: 'تعذّرت إضافة هذا الاختيار. راجع خيارات الترخيص.' };
  const state = await readCartState();
  // الخط نفسه يُستبدل اختياره بدل أن يتكرّر في السلة
  const items = state.items.filter((i) => i.selection.fontId !== selection.fontId);
  if (items.length >= MAX_CART_ITEMS) return { ok: false, error: 'السلة ممتلئة.' };
  items.push({ id: newId(), selection });
  await writeCartState({ ...state, items });
  revalidatePath('/', 'layout');
  return { ok: true, count: items.length };
}

export async function updateCartItem(id: unknown, input: unknown): Promise<CartActionResult> {
  const key = itemId.safeParse(id);
  const selection = await validSelection(input);
  if (!key.success || !selection) return { ok: false, error: 'تعذّر تعديل الترخيص.' };
  const state = await readCartState();
  const items = state.items.map((i) => (i.id === key.data ? { ...i, selection } : i));
  await writeCartState({ ...state, items });
  revalidatePath('/', 'layout');
  return { ok: true, count: items.length };
}

export async function removeFromCart(id: unknown): Promise<CartActionResult> {
  const key = itemId.safeParse(id);
  if (!key.success) return { ok: false, error: 'عنصر غير صالح.' };
  const state = await readCartState();
  const items = state.items.filter((i) => i.id !== key.data);
  await writeCartState({ ...state, items });
  revalidatePath('/', 'layout');
  return { ok: true, count: items.length };
}

export type CouponResult = { ok: boolean; message: string } | null;

export async function applyCoupon(_prev: CouponResult, form: FormData): Promise<CouponResult> {
  const code = z.string().trim().max(24).safeParse(form.get('coupon'));
  if (!code.success || !code.data) return { ok: false, message: 'اكتب كود الخصم.' };
  if (!couponPercent(code.data)) return { ok: false, message: 'هذا الكود غير صالح أو منتهٍ.' };
  const state = await readCartState();
  await writeCartState({ ...state, coupon: code.data.toUpperCase() });
  revalidatePath('/', 'layout');
  return { ok: true, message: 'طُبِّق الخصم.' };
}
