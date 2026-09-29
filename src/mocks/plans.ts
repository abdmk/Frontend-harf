/* ══ خطط الاشتراك — بيانات تجريبية منقولة من تصميم «اختر خطتك» ════════════
   ⚠️ الأسعار والمزايا والحدود ليست قرارات نهائية؛ تُستبدل بسياسة حرف. */
import { cents } from '@/types/domain/commerce';
import type { Invoice, PlanOffer, Subscription } from '@/types/domain/subscription';
import type { Plan } from '@/types/domain/user';

export const MOCK_PLANS: PlanOffer[] = [
  {
    id: 'free',
    name: 'المجانية',
    tagline: 'لتجربة المكتبة قبل الالتزام',
    monthly: cents(0),
    yearlyPerMonth: cents(0),
    yearlyTotal: cents(0),
    features: [
      { label: 'الخطوط والمخطوطات المجانية', included: true },
      { label: 'الخطوط الكردية', included: true },
      { label: 'عكس النص ومختبر الخط', included: true },
      { label: 'مطابقة الخطوط — 3 مرّات يومياً', included: true },
      { label: 'بلا إعلانات', included: false },
      { label: 'تحميل غير محدود', included: false },
    ],
  },
  {
    id: 'basic',
    name: 'الأساسية',
    tagline: 'لمن يحمّل كثيراً ويريد المكتبة كاملة',
    monthly: cents(1000),
    yearlyPerMonth: cents(700),
    yearlyTotal: cents(8400),
    badge: 'الأكثر اختياراً',
    inherits: 'كل ما في المجانية، وإضافةً إليها',
    features: [
      { label: 'تحميل غير محدود من المكتبة', included: true },
      { label: 'مطابقة غير محدودة', included: true },
      { label: 'بلا إعلانات', included: true },
      { label: 'المخطوطات الجاهزة كاملة', included: true },
      { label: 'أولوية في الدعم', included: true },
      { label: 'نشر الخطوط وبيعها', included: false },
    ],
  },
  {
    id: 'studio',
    name: 'الاستوديو',
    tagline: 'للمصمّمين والمسابك التي تنشر وتبيع',
    monthly: cents(1500),
    yearlyPerMonth: cents(1050),
    yearlyTotal: cents(12600),
    badge: 'للمسابك',
    inherits: 'كل ما في الأساسية، وإضافةً إليها',
    features: [
      { label: 'نشر الخطوط وبيعها في المتجر', included: true },
      { label: 'صفحة مسبك باسمك', included: true },
      { label: 'لوحة تحليلات وأرباح', included: true },
      { label: 'سحب الأرباح إلى حسابك', included: true },
      { label: 'تراخيص تجارية مخصّصة', included: true },
      { label: 'دعم مخصّص للمسابك', included: true },
    ],
  },
];

export function mockSubscription(plan: Plan): Subscription {
  return plan === 'free'
    ? { plan, cycle: 'monthly', status: 'active', renewsAt: null }
    : {
        plan,
        cycle: 'monthly',
        status: 'active',
        renewsAt: '2026-10-26',
        paymentMethod: { brand: 'visa', last4: '4242', expires: '08/28' },
      };
}

export function mockInvoices(plan: Plan): Invoice[] {
  if (plan === 'free') return [];
  const amount = plan === 'studio' ? cents(1500) : cents(1000);
  const name = plan === 'studio' ? 'الاستوديو' : 'الأساسية';
  return [
    { id: 'INV-2609', date: '2026-09-26', description: `${name} — شهري`, amount, status: 'paid' },
    { id: 'INV-2608', date: '2026-08-26', description: `${name} — شهري`, amount, status: 'paid' },
    { id: 'INV-2607', date: '2026-07-26', description: `${name} — شهري`, amount, status: 'failed' },
  ];
}
