import { mockInvoices, mockSubscription } from '@/mocks/plans';
import { getPlanOffers, usePlanOffers } from '@/stores/plan-offers';
import type { Plan } from '@/types/domain/user';

/** الخطط والاشتراك والفواتير — اليوم من البيانات التجريبية، لاحقاً من Stripe Billing/قاعدة البيانات */
export function getPlans() {
  return getPlanOffers();
}

/** نسخة تفاعلية: تتحدّث فور تعديل الإدارة للخطط */
export const usePlans = usePlanOffers;

export function getSubscription(plan: Plan) {
  return mockSubscription(plan);
}

export function getInvoices(plan: Plan) {
  return mockInvoices(plan);
}
