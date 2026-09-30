import type { IconProps } from '@/components/ui/icons';
import { DollarIcon, HomeIcon, LayersIcon, StatsIcon, UserIcon } from '@/components/ui/icons';
import type { StudioSection } from '@/config/paths';

export type StudioNavItem = {
  section: StudioSection | null;
  label: string;
  Icon: (p: IconProps) => React.JSX.Element;
  children?: { section: StudioSection; label: string }[];
};

/** مساحة الاستوديو: أربعة أقسام، والمالية تجمع كل ما يخصّ المال */
export const STUDIO_NAV: StudioNavItem[] = [
  { section: null, label: 'نظرة عامة', Icon: HomeIcon },
  { section: 'fonts', label: 'خطوطي', Icon: LayersIcon },
  { section: 'analytics', label: 'التحليلات', Icon: StatsIcon },
  {
    section: 'finance',
    label: 'المالية',
    Icon: DollarIcon,
    children: [
      { section: 'finance', label: 'نظرة عامة مالية' },
      { section: 'finance/sales', label: 'المبيعات' },
      { section: 'finance/earnings', label: 'الأرباح' },
      { section: 'finance/payouts', label: 'السحوبات' },
    ],
  },
];

export const STUDIO_PROFILE_ITEM = { section: 'profile', label: 'الملف العام', Icon: UserIcon } as const;

export const STUDIO_TITLE: Record<string, string> = {
  '': 'نظرة عامة',
  fonts: 'خطوطي',
  analytics: 'التحليلات',
  finance: 'المالية',
  'finance/sales': 'المبيعات',
  'finance/earnings': 'الأرباح',
  'finance/payouts': 'السحوبات',
  profile: 'الملف العام',
  publish: 'رفع خط',
};
