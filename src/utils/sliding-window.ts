/** حدّ محاولات بنافذة منزلقة في الذاكرة — منطق نقيّ قابل للاختبار (انظر rate-limit.ts للاستعمال على الخادم) */
const buckets = new Map<string, number[]>();

/** يرجع true إن سُمح بالمحاولة، ويسجّلها */
export function hit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  // تنظيف دوري كي لا تكبر الخريطة بلا حدّ
  if (buckets.size > 5000) for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  return true;
}
