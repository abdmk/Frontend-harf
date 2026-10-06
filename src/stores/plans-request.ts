import type { Plan } from '@/types/domain/user';

/**
 * طلب فتح نافذة الخطط من أي مكان (العمود الجانبي، القائمة، بطاقة «حوّل حسابك إلى استوديو»).
 * النافذة واحدة في الترويسة؛ هذا قناة صغيرة إليها بدل تمرير الحالة عبر كل الصفحات.
 * plan: يفتح مباشرةً على خطوة الاشتراك في تلك الخطة (و«رجوع» يعرض كل الخطط).
 */
const EVENT = 'harf:open-plans';

export function requestPlans(plan?: Plan) {
  window.dispatchEvent(new CustomEvent<Plan | undefined>(EVENT, { detail: plan }));
}

export function onPlansRequest(cb: (plan?: Plan) => void) {
  const h = (e: Event) => cb((e as CustomEvent<Plan | undefined>).detail);
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
}
