import type { IconProps } from '@/components/ui/icons';
import { DocumentSignedIcon, HomeIcon, LayersIcon, PictureIcon, StatsIcon, UserIcon } from '@/components/ui/icons';
import type { AdminSection } from '@/config/paths';

export type AdminNavItem = {
  section: AdminSection | null;
  label: string;
  hint: string;
  Icon: (p: IconProps) => React.JSX.Element;
};

/**
 * لوحة الإدارة: خمسة أقسام بترتيب العمل اليومي — ما يحتاج قراراً أولاً (المراجعة)، ثم ما يُدار
 * (الخطوط والمستخدمون والمحتوى)، ثم ما يُقرأ (التحليلات).
 */
/** مجموعات القائمة الجانبية — تسمية صغيرة فوق كل مجموعة كما في لوحات العمل */
export const ADMIN_GROUPS: { title: string; items: AdminSection[] | (AdminSection | null)[] }[] = [
  { title: 'عام', items: [null, 'review'] },
  { title: 'المكتبة والمحتوى', items: ['fonts', 'content'] },
  { title: 'الناس والأرقام', items: ['users', 'analytics'] },
];

export const ADMIN_NAV: AdminNavItem[] = [
  { section: null, label: 'الرئيسية', hint: 'ما يحتاج انتباهك اليوم', Icon: HomeIcon },
  { section: 'review', label: 'المراجعة', hint: 'الخطوط المرفوعة بانتظار قرار', Icon: DocumentSignedIcon },
  { section: 'fonts', label: 'مخزن الخطوط', hint: 'كل خطوط المكتبة وظهورها', Icon: LayersIcon },
  { section: 'users', label: 'المستخدمون', hint: 'الحسابات وخططها والحظر', Icon: UserIcon },
  { section: 'content', label: 'المحتوى', hint: 'البنرات والنصوص الظاهرة في الموقع', Icon: PictureIcon },
  { section: 'analytics', label: 'التحليلات', hint: 'الزيارات والمستخدمون والإيرادات', Icon: StatsIcon },
];
