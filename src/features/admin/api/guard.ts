import { requireAdmin } from '@/lib/auth';

export type AdminResult = { ok: true } | { ok: false; error: string };
export const DENIED: AdminResult = { ok: false, error: 'هذا الإجراء للمشرف فقط.' };

/**
 * كل إجراء إداري يبدأ من هنا: التحقّق من دور المشرف عند كل استدعاء (لا الاكتفاء بإخفاء الواجهة).
 * ⚠️ عرض: في المنتج يتحقّق الخادم من الجلسة والدور في كل طلب، ويرفض ما سواه بـ403.
 */
export function adminOrNull() {
  return requireAdmin();
}
