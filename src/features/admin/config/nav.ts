import type { IconProps } from '@/components/ui/icons';
import { DocumentSignedIcon, HomeIcon, LayersIcon, PictureIcon, StatsIcon } from '@/components/ui/icons';
import type { AdminSection } from '@/config/paths';

export type AdminNavItem = {
  section: AdminSection | null;
  label: string;
  hint: string;
  Icon: (p: IconProps) => React.JSX.Element;
};

/**
 * لوحة الإدارة: خمسة أقسام بترتيب العمل اليومي — ما يحتاج قراراً أولاً (المراجعة)، ثم ما يُدار
 * (الخطوط والمحتوى)، ثم ما يُقرأ (التحليلات).
 */
export const ADMIN_NAV: AdminNavItem[] = [
  { section: null, label: 'الرئيسية', hint: 'ما يحتاج انتباهك اليوم', Icon: HomeIcon },
  { section: 'review', label: 'المراجعة', hint: 'الخطوط المرفوعة بانتظار قرار', Icon: DocumentSignedIcon },
  { section: 'fonts', label: 'مخزن الخطوط', hint: 'كل خطوط المكتبة وظهورها', Icon: LayersIcon },
  { section: 'content', label: 'المحتوى', hint: 'البنرات والنصوص الظاهرة في الموقع', Icon: PictureIcon },
  { section: 'analytics', label: 'التحليلات', hint: 'الزيارات والمستخدمون والإيرادات', Icon: StatsIcon },
];
