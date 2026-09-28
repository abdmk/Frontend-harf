import type { Money } from './commerce';
import type { Plan } from './user';

export type BillingCycle = 'monthly' | 'yearly';

export type PlanFeature = { label: string; included: boolean };

/** تعريف خطة كما يعرضه الخادم (الأسعار والمزايا من سياسة حرف — بيانات تجريبية الآن) */
export type PlanOffer = {
  id: Plan;
  name: string;
  tagline: string;
  /** سعر الشهر في كل دورة */
  monthly: Money;
  yearlyPerMonth: Money;
  yearlyTotal: Money;
  badge?: string;
  inherits?: string;
  features: PlanFeature[];
};

export type Subscription = {
  plan: Plan;
  cycle: BillingCycle;
  status: 'active' | 'canceling' | 'past_due';
  renewsAt: string | null;
  paymentMethod?: { brand: 'visa' | 'mastercard'; last4: string; expires: string };
};

export type Invoice = {
  id: string;
  date: string;
  description: string;
  amount: Money;
  status: 'paid' | 'failed' | 'refunded';
};
