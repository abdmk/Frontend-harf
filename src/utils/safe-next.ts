/** مسار العودة بعد الدخول: مسار داخلي فقط (يمنع إعادة التوجيه المفتوح إلى موقع آخر) */
export function safeNext(next: unknown, fallback = '/'): string {
  if (typeof next !== 'string') return fallback;
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  if (/[\r\n]/.test(next) || next.length > 200) return fallback;
  return next;
}
