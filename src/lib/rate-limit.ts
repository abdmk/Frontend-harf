export { hit } from './sliding-window';

/**
 * حدّ محاولات بسيط في الذاكرة (نافذة منزلقة) — يكفي للعرض التجريبي.
 * ⚠️ في الإنتاج: حدّ المحاولات يُنفَّذ على الخادم (Redis / Upstash)، لا على المتصفّح.
 */
export function clientKey(scope: string, extra = '') {
  return `${scope}:client:${extra.toLowerCase()}`;
}
