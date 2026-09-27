import 'server-only';

import { headers } from 'next/headers';

export { hit } from './sliding-window';

/**
 * حدّ محاولات بسيط في الذاكرة (نافذة منزلقة) — يكفي لخادم واحد وللتطوير.
 * ⚠️ في الإنتاج متعدّد النسخ يُستبدل بمخزن مشترك (Redis / Upstash) بالواجهة نفسها.
 */

export async function clientKey(scope: string, extra = '') {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'local';
  return `${scope}:${ip}:${extra.toLowerCase()}`;
}
