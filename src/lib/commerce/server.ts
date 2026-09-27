import 'server-only';

import { cookies } from 'next/headers';

import { MOCK_FONTS } from '@/mocks/fonts';
import { mockPricing } from '@/mocks/pricing';
import { type Cart, type CartItem, cents } from '@/types/domain/commerce';
import type { LicensePricing } from '@/types/domain/license';

import { quote } from './quote';
import { type CartState, cartStateSchema } from './selection';

/**
 * الوصول إلى التسعير والسلة على الخادم.
 * اليوم: بيانات تجريبية + السلة في كوكي httpOnly (اختيارات فقط، بلا أسعار).
 * لاحقاً: قاعدة البيانات — بالتواقيع نفسها، فلا تتغيّر المكوّنات.
 */
const CART_COOKIE = 'harf_cart';

/** كود خصم تجريبي للعرض فقط — ليس قراراً تجارياً */
const DEMO_COUPONS: Record<string, number> = { HARF10: 10 };

export async function getPricing(fontId: string): Promise<LicensePricing | null> {
  const font = MOCK_FONTS.find((f) => f.id === fontId);
  if (!font || font.type === 'free') return null;
  return mockPricing(font);
}

export async function readCartState(): Promise<CartState> {
  const raw = (await cookies()).get(CART_COOKIE)?.value;
  if (!raw) return { items: [] };
  try {
    const parsed = cartStateSchema.safeParse(JSON.parse(raw));
    // كوكي معدَّل أو قديم ← سلة فارغة بدل خطأ
    return parsed.success ? parsed.data : { items: [] };
  } catch {
    return { items: [] };
  }
}

export async function writeCartState(state: CartState) {
  const jar = await cookies();
  if (!state.items.length && !state.coupon) {
    jar.delete(CART_COOKIE);
    return;
  }
  jar.set(CART_COOKIE, JSON.stringify(state), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  });
}

export function couponPercent(code: string | undefined) {
  return code ? (DEMO_COUPONS[code.toUpperCase()] ?? 0) : 0;
}

/** يبني السلة المعروضة: يعيد حساب كل سعر من الجدول ويُسقط العناصر التي لم تعد صالحة */
export async function buildCart(state?: CartState): Promise<Cart> {
  const s = state ?? (await readCartState());
  const items: CartItem[] = [];
  for (const it of s.items) {
    const font = MOCK_FONTS.find((f) => f.id === it.selection.fontId);
    const pricing = await getPricing(it.selection.fontId);
    const q = pricing && quote(pricing, it.selection);
    if (!font || !q) continue;
    items.push({
      id: it.id,
      selection: it.selection,
      fontName: font.name,
      foundry: font.designerLabel ?? font.designers[0]?.nameAr ?? '',
      summary: q.summary,
      price: cents(q.cents),
    });
  }
  const subtotal = items.reduce((a, i) => a + i.price.cents, 0);
  const pct = couponPercent(s.coupon);
  const discount = Math.round((subtotal * pct) / 100);
  return {
    items,
    subtotal: cents(subtotal),
    discount: cents(discount),
    total: cents(subtotal - discount),
    coupon: pct ? s.coupon?.toUpperCase() : undefined,
  };
}
