import type { IconProps } from '@/components/ui/icons';
import {
  AppsIcon,
  CloudUploadIcon,
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
import { paths } from '@/config/paths';
import type { AccountSection, User } from '@/features/account/types';

export type NavItem = {
  /** قسم الحساب، أو «publish» لرفع خط (خارج صفحة الحساب) */
  section: AccountSection | 'publish';
  label: string;
  Icon: (p: IconProps) => React.JSX.Element;
  meta?: (u: User) => string | undefined;
  badge?: string;
  /** وجهة خارج صفحة الحساب بدل /account/<section> */
  href?: string;
};

export const PLAN_LABEL = { free: 'المجانية', basic: 'الأساسية', studio: 'الاستوديو' } as const;
export const PLAN_TITLE = { free: 'الخطة المجانية', basic: 'الخطة الأساسية', studio: 'خطة الاستوديو' } as const;

/** مجموعات القائمة كما في التصميم — «لوحة المسبك» لحساب الاستوديو وحده */
export function accountNavGroups(user: User): NavItem[][] {
  const groups: NavItem[][] = [
    [
      { section: 'profile', label: 'الملف الشخصي', Icon: UserIcon },
      // الاستوديو وحده ينشر خطوطه على حرف — الوجهة محميّة بـrequireStudio أيضاً
      ...(user.plan === 'studio'
        ? [
            {
              section: 'publish',
              label: 'رفع خط',
              Icon: CloudUploadIcon,
              href: paths.studio.getHref('publish'),
            } as const,
          ]
        : []),
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
    groups.push([
      { section: 'foundry', label: 'لوحة المسبك', Icon: AppsIcon, badge: 'جديد', href: paths.studio.getHref() },
    ]);
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
  usage: 'حالة الاستخدام',
  subscription: 'الاشتراك',
  foundry: 'لوحة المسبك',
  preferences: 'التفضيلات',
  security: 'الحساب',
  help: 'المساعدة',
};
