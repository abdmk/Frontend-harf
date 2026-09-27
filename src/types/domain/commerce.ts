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
