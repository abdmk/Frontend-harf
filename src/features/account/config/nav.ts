import type { IconProps } from '@/components/ui/icons';
import {
  AppsIcon,
  CrownIcon,
  FolderIcon,
  HeartIcon,
  HelpIcon,
  LockIcon,
  ReceiptIcon,
  SlidersIcon,
  UsageIcon,
  UserIcon,
} from '@/components/ui/icons';

import type { AccountSection, User } from '@/features/account/types';

export type NavItem = {
  section: AccountSection;
  label: string;
  Icon: (p: IconProps) => React.JSX.Element;
  meta?: (u: User) => string | undefined;
  badge?: string;
};

export const PLAN_LABEL = { free: 'المجانية', studio: 'الاستوديو' } as const;

/** مجموعات القائمة كما في التصميم — «لوحة المسبك» لحساب الاستوديو وحده */
export function accountNavGroups(user: User): NavItem[][] {
  const groups: NavItem[][] = [
    [
      { section: 'profile', label: 'الملف الشخصي', Icon: UserIcon },
      { section: 'library', label: 'مكتبتي', Icon: FolderIcon, meta: (u) => String(u.stats.library) },
      { section: 'favorites', label: 'المفضلة', Icon: HeartIcon, meta: (u) => String(u.stats.favorites) },
      { section: 'purchases', label: 'المشتريات', Icon: ReceiptIcon, meta: (u) => String(u.stats.purchases) },
    ],
    [
      { section: 'usage', label: 'الاستخدام', Icon: UsageIcon, meta: (u) => `${u.stats.usagePct}%` },
      { section: 'subscription', label: 'الاشتراك', Icon: CrownIcon, meta: (u) => PLAN_LABEL[u.plan] },
    ],
  ];
  if (user.plan === 'studio')
    groups.push([{ section: 'foundry', label: 'لوحة المسبك', Icon: AppsIcon, badge: 'جديد' }]);
  groups.push([
    { section: 'preferences', label: 'التفضيلات', Icon: SlidersIcon },
    { section: 'security', label: 'الحساب', Icon: LockIcon },
    { section: 'help', label: 'المساعدة', Icon: HelpIcon },
  ]);
  return groups;
}

export const SECTION_TITLE: Record<AccountSection, string> = {
  profile: 'الملف الشخصي',
  library: 'مكتبتي',
  favorites: 'المفضلة',
  purchases: 'المشتريات',
  usage: 'الاستخدام',
  subscription: 'الاشتراك',
  foundry: 'لوحة المسبك',
  preferences: 'التفضيلات',
  security: 'الحساب',
  help: 'المساعدة',
};
