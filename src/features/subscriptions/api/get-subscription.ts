import 'server-only';

import { mockInvoices, MOCK_PLANS, mockSubscription } from '@/mocks/plans';
import type { Plan } from '@/types/domain/user';

/** الخطط والاشتراك والفواتير — اليوم من البيانات التجريبية، لاحقاً من Stripe Billing/قاعدة البيانات */
export async function getPlans() {
  return MOCK_PLANS;
}

export async function getSubscription(plan: Plan) {
  return mockSubscription(plan);
}

export async function getInvoices(plan: Plan) {
  return mockInvoices(plan);
}
