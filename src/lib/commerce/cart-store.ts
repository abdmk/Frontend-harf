import { createLocalStoreSignal } from '@/lib/local-store-signal';
import { MOCK_FONTS } from '@/mocks/fonts';
import { mockPricing } from '@/mocks/pricing';
import { type Cart, type CartItem, cents } from '@/types/domain/commerce';
import type { LicensePricing } from '@/types/domain/license';

import { quote } from './quote';
import { type CartState, cartStateSchema } from './selection';

const cartSignal = createLocalStoreSignal();
/** يشترك عنصر دائم في التخطيط (كالترويسة) بتغيّر السلة — استخدمه عبر useCart */
export const subscribeCart = cartSignal.subscribe;

/**
 * الوصول إلى التسعير والسلة.
 * اليوم: بيانات تجريبية + السلة في localStorage (اختيارات فقط، بلا أسعار).
 * لاحقاً: الخادم يحسب السعر ويُخزّن السلة — بالتواقيع نفسها.
 */
const CART_STORAGE_KEY = 'harf_cart';

/** كود خصم تجريبي للعرض فقط — ليس قراراً تجارياً */
const DEMO_COUPONS: Record<string, number> = { HARF10: 10 };

export function getPricing(fontId: string): LicensePricing | null {
  const font = MOCK_FONTS.find((f) => f.id === fontId);
  if (!font || font.type === 'free') return null;
  return mockPricing(font);
}

export function readCartState(): CartState {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = cartStateSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : { items: [] };
  } catch {
    return { items: [] };
  }
}

export function writeCartState(state: CartState) {
  try {
    if (!state.items.length && !state.coupon) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return;
    }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage غير متاح
  } finally {
    cartSnapshot = null;
    cartSignal.notify();
  }
}

export function couponPercent(code: string | undefined) {
  return code ? (DEMO_COUPONS[code.toUpperCase()] ?? 0) : 0;
}

/** يبني السلة المعروضة: يعيد حساب كل سعر من الجدول ويُسقط العناصر التي لم تعد صالحة */
export function buildCart(state?: CartState): Cart {
  const s = state ?? readCartState();
  const items: CartItem[] = [];
  for (const it of s.items) {
    const font = MOCK_FONTS.find((f) => f.id === it.selection.fontId);
    const pricing = getPricing(it.selection.fontId);
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

let cartSnapshot: Cart | null = null;
/** نسخة مخبّأة من buildCart() بمرجع ثابت — ضرورية لـuseSyncExternalStore حتى لا تُعاد رسمة كل شيء بلا نهاية */
export function getCartSnapshot(): Cart {
  cartSnapshot ??= buildCart();
  return cartSnapshot;
}
