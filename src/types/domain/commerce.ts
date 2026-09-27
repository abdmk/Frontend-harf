import type { LicenseSelection } from './license';

/**
 * أنواع التجارة. المبالغ بالسنتات (أعداد صحيحة) لتجنّب أخطاء الكسور العشرية،
 * والسعر النهائي يُحسب على الخادم دائماً — الواجهة تعرض فقط.
 */
export type Currency = 'USD';

export type Money = {
  /** بالسنتات: 4900 = $49.00 */
  cents: number;
  currency: Currency;
};

export const usd = (dollars: number): Money => ({ cents: Math.round(dollars * 100), currency: 'USD' });
export const cents = (c: number): Money => ({ cents: c, currency: 'USD' });

/** عنصر سلة كما يعرضه الخادم: الاختيار + وصف مقروء + سعر محسوب */
export type CartItem = {
  id: string;
  selection: LicenseSelection;
  fontName: string;
  foundry: string;
  /** وصف قصير: «العائلة الكاملة · سطح المكتب حتى جهازين» */
  summary: string[];
  price: Money;
};

export type Cart = {
  items: CartItem[];
  subtotal: Money;
  discount: Money;
  total: Money;
  coupon?: string;
};

export type PaymentMethod = 'card' | 'apple_pay' | 'google_pay';
export type OrderStatus = 'processing' | 'paid' | 'declined';

export type Order = {
  id: string;
  status: OrderStatus;
  total: Money;
  method: PaymentMethod;
  /** آخر أربعة أرقام للبطاقة — يرجعها مزوّد الدفع، لا نخزّن البطاقة */
  last4?: string;
  createdAt: string;
};
