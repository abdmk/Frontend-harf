import type { IconProps } from '@/components/ui/icons';
import {
  AppsIcon,
  ChartHistogramIcon,
  CloudUploadIcon,
  PictureIcon,
  DocumentSignedIcon,
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
import { ACCOUNT_SECTIONS, type AccountSection, type User } from '@/features/account/types';

/**
 * مفتاح البند في القائمة الموحّدة: قسم الحساب، أو قسم من الاستوديو ('studio'، 'studio/fonts'…)،
 * أو وجهة خارجية ('publish'، 'review'، 'admin').
 */
export type NavKey = AccountSection | 'studio' | `studio/${string}` | 'publish' | 'manuscript' | 'review' | 'admin';

export type NavItem = {
  key: NavKey;
  label: string;
  Icon: (p: IconProps) => React.JSX.Element;
  href: string;
  meta?: (u: User) => string | undefined;
  /** أقسام فرعية تحت البند — في العمود الجانبي وحده، ظاهرة دائماً حتى لا يتغيّر تركيبه */
  children?: { key: NavKey; label: string; href: string }[];
  /** في القائمة السريعة (الصورة) وحدها */
  menuOnly?: boolean;
};

const PLAN_LABEL = { free: 'المجانية', basic: 'الأساسية', studio: 'الاستوديو' } as const;
export const PLAN_TITLE = { free: 'الخطة المجانية', basic: 'الخطة الأساسية', studio: 'خطة الاستوديو' } as const;

const acc = (section: AccountSection) => paths.account.getHref(section);

/**
 * قائمة واحدة للحساب والاستوديو: نفس البنود ونفس الترتيب في كل الصفحات، والذي يتغيّر هو البند المحدّد فقط.
 * القائمة السريعة (الصورة) تعرض البنود نفسها بلا الأقسام الفرعية.
 */
export function accountNavGroups(user: User): NavItem[][] {
  const studio = user.plan === 'studio';
  const admin = user.role === 'admin';
  const groups: NavItem[][] = [
    [
      // الاستوديو: ملف واحد يجمع الحساب والصفحة العامة
      {
        key: 'profile',
        label: 'الملف الشخصي',
        Icon: UserIcon,
        href: studio ? paths.studio.getHref('profile') : acc('profile'),
      },
      ...(studio
        ? [
            {
              key: 'publish',
              label: 'رفع خط',
              Icon: CloudUploadIcon,
              href: paths.studio.getHref('publish'),
              menuOnly: true,
            } as const,
            {
              key: 'manuscript',
              label: 'رفع مخطوطة',
              Icon: PictureIcon,
              href: paths.studio.getHref('manuscripts/new'),
              menuOnly: true,
            } as const,
          ]
        : []),
      ...(admin
        ? [
            {
              key: 'review',
              label: 'مراجعة طلبات النشر',
              Icon: DocumentSignedIcon,
              href: paths.admin.getHref('requests'),
              menuOnly: true,
            } as const,
          ]
        : []),
      { key: 'library', label: 'مكتبتي', Icon: FolderIcon, href: acc('library'), meta: (u) => String(u.stats.library) },
      {
        key: 'favorites',
        label: 'المفضلة',
        Icon: HeartIcon,
        href: acc('favorites'),
        meta: (u) => String(u.stats.favorites),
      },
      {
        key: 'purchases',
        label: 'المشتريات',
        Icon: ReceiptIcon,
        href: acc('purchases'),
        meta: (u) => String(u.stats.purchases),
      },
    ],
    // المشرف بلا خطة ولا حدود استخدام
    admin
      ? []
      : [
          {
            key: 'usage',
            label: 'الاستخدام',
            Icon: UsageIcon,
            href: acc('usage'),
            meta: (u) => `${u.stats.usagePct}%`,
          },
          {
            key: 'subscription',
            label: 'الاشتراك',
            Icon: CrownIcon,
            href: acc('subscription'),
            meta: (u) => PLAN_LABEL[u.plan],
          },
        ],
  ];
  if (admin)
    groups.push([{ key: 'admin', label: 'لوحة الإدارة', Icon: ChartHistogramIcon, href: paths.admin.getHref() }]);
  else if (studio)
    groups.push([
      {
        key: 'studio',
        label: 'الاستوديو',
        Icon: AppsIcon,
        href: paths.studio.getHref(),
        children: [
          { key: 'studio/fonts', label: 'خطوطي', href: paths.studio.getHref('fonts') },
          { key: 'studio/analytics', label: 'التحليلات', href: paths.studio.getHref('analytics') },
          { key: 'studio/finance', label: 'المالية', href: paths.studio.getHref('finance') },
          { key: 'studio/verify', label: 'توثيق الحساب', href: paths.studio.getHref('verify') },
        ],
      },
    ]);
  groups.push([
    { key: 'preferences', label: 'التفضيلات', Icon: SlidersIcon, href: acc('preferences') },
    { key: 'security', label: 'الحساب', Icon: LockIcon, href: acc('security') },
    { key: 'help', label: 'المساعدة', Icon: HelpIcon, href: acc('help') },
  ]);
  return groups.filter((g) => g.length > 0);
}

/** البند المحدّد من المسار — للعمود الجانبي وللقائمة السريعة معاً */
export function navKeyFor(pathname: string): NavKey | null {
  const p = pathname.replace(/\/$/, '');
  if (p === '/account') return 'profile';
  const a = /^\/account\/([^/]+)$/.exec(p);
  if (a) return (ACCOUNT_SECTIONS as readonly string[]).includes(a[1]) ? (a[1] as AccountSection) : null;
  if (p === '/studio') return 'studio';
  const s = /^\/studio\/([^/]+)/.exec(p);
  if (!s) return null;
  if (s[1] === 'profile') return 'profile';
  // رفع خط جزء من «خطوطي»
  if (s[1] === 'publish') return 'studio/fonts';
  // رفع مخطوطة من أعمال الاستوديو — بلا بند خاص في العمود
  if (s[1] === 'manuscripts') return 'studio';
  return `studio/${s[1]}`;
}

export const SECTION_TITLE: Record<AccountSection, string> = {
  profile: 'الملف الشخصي',
  library: 'مكتبتي',
  favorites: 'المفضلة',
  purchases: 'المشتريات',
  usage: 'حالة الاستخدام',
  subscription: 'الاشتراك',
  foundry: 'الاستوديو',
  preferences: 'التفضيلات',
  security: 'الحساب',
  help: 'المساعدة',
};
