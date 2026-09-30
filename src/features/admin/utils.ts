/** «قبل 3 ساعات» — لعمر الطلبات في طابور المراجعة وسجلّ النشاط */
export function timeAgo(iso: string, now = Date.now()): string {
  const m = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000));
  if (m < 1) return 'الآن';
  if (m < 60) return m === 1 ? 'قبل دقيقة' : m === 2 ? 'قبل دقيقتين' : m <= 10 ? `قبل ${m} دقائق` : `قبل ${m} دقيقة`;
  const h = Math.round(m / 60);
  if (h < 24) return h === 1 ? 'قبل ساعة' : h === 2 ? 'قبل ساعتين' : h <= 10 ? `قبل ${h} ساعات` : `قبل ${h} ساعة`;
  const d = Math.round(h / 24);
  return d === 1 ? 'قبل يوم' : d === 2 ? 'قبل يومين' : d <= 10 ? `قبل ${d} أيام` : `قبل ${d} يوماً`;
}

/** مرّ على الطلب أكثر من يومين — يُبرز في الطابور (هدف المراجعة 3 أيام عمل) */
export const isOverdue = (iso: string, now = Date.now()) => now - new Date(iso).getTime() > 48 * 36e5;

export const fmt = (n: number) => n.toLocaleString('en-US');
