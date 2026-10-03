import type { IconProps } from '@/components/ui/icons';
import { DocumentSignedIcon, HomeIcon, LayersIcon, PictureIcon, StatsIcon, UserIcon } from '@/components/ui/icons';
import type { AdminSection } from '@/config/paths';

export type AdminNavItem = {
  section: AdminSection | null;
  label: string;
  Icon: (p: IconProps) => React.JSX.Element;
  /** مسارات قديمة أو فرعية تُحسب ضمن هذا القسم (تفاصيل طلب، تفاصيل استوديو…) */
  also?: readonly string[];
};

/**
 * ستّة أقسام بلا مجموعات، بترتيب العمل: ما ينتظر قراراً (الطلبات) ثم ما يُدار ثم ما يُقرأ.
 * الطلبات تجمع مراجعة الخطوط وتوثيق الاستوديوهات — كلاهما قرار قبول أو رفض.
 * والمحتوى يجمع ما يراه الزائر: الواجهة والمدونة والخطط وأسعارها.
 */
export const ADMIN_NAV: AdminNavItem[] = [
  { section: null, label: 'الرئيسية', Icon: HomeIcon },
  { section: 'requests', label: 'الطلبات', Icon: DocumentSignedIcon, also: ['review', 'studios'] },
  { section: 'fonts', label: 'الخطوط', Icon: LayersIcon },
  { section: 'users', label: 'المستخدمون', Icon: UserIcon },
  { section: 'content', label: 'المحتوى', Icon: PictureIcon, also: ['plans'] },
  { section: 'analytics', label: 'التحليلات', Icon: StatsIcon },
];

export const isAdminNavOn = (item: AdminNavItem, current: string) =>
  item.section === null ? current === '' : current === item.section || !!item.also?.includes(current);
