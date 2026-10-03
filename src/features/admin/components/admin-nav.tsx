import { Link, useLocation } from 'react-router';

import { ChevronRightIcon } from '@/components/ui/icons';

/** القسم الحالي من المسار: '' للرئيسية، 'review'، 'fonts'… (الصفحات الفرعية تتبع قسمها) */
export function useAdminSection(): string {
  const { pathname } = useLocation();
  return pathname.replace(/^\/admin\/?/, '').split('/')[0] ?? '';
}

/** رأس صفحة داخل الإدارة — بمقاسات رأس الاستوديو نفسها: عنوان، سطر وصف، وإجراء على الطرف الآخر */
export function AdminPageHeader({
  title,
  description,
  action,
  back,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  back?: { to: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link
            to={back.to}
            className="mb-2 inline-flex items-center gap-1 text-meta text-muted-foreground hover:text-foreground"
          >
            <ChevronRightIcon className="size-4" />
            {back.label}
          </Link>
        )}
        <h1 className="animate-fade-up text-2xl font-semibold">{title}</h1>
        {description && <div className="mt-1 text-meta text-muted-foreground">{description}</div>}
      </div>
      {action}
    </div>
  );
}
