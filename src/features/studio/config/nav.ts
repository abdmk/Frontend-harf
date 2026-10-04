import type { StudioSection } from '@/config/paths';

/** أقسام المالية — تبويبات داخل الصفحة، فيبقى العمود الجانبي بتركيب واحد في كل الصفحات */
export const FINANCE_TABS: { section: StudioSection; label: string }[] = [
  { section: 'finance', label: 'نظرة عامة مالية' },
  { section: 'finance/sales', label: 'المبيعات' },
  { section: 'finance/payouts', label: 'السحوبات' },
];
