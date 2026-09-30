import { Link, useLocation } from 'react-router';

import { HarfMark } from '@/components/shared/harf-logo';
import { sideNavIcon, sideNavRow } from '@/components/shared/side-nav';
import { ArrowLeftIcon, ChevronRightIcon } from '@/components/ui/icons';
import { paths, type AdminSection } from '@/config/paths';

import { usePendingCount } from '../api/review';
import { ADMIN_NAV } from '../config/nav';

/** القسم الحالي من المسار: '' للرئيسية، 'review'، 'fonts'… (الصفحات الفرعية تتبع قسمها) */
export function useAdminSection(): string {
  const { pathname } = useLocation();
  return pathname.replace(/^\/admin\/?/, '').split('/')[0] ?? '';
}

const isOn = (current: string, section: AdminSection | null) => (section ?? '') === current;

function PendingBadge({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span
      dir="ltr"
      aria-label={`${n} بانتظار المراجعة`}
      className="grid h-5.5 min-w-5.5 place-items-center rounded-full bg-primary-fill px-1.5 text-caption font-semibold text-primary-foreground tabular-nums"
    >
      {n}
    </span>
  );
}

/** العمود الجانبي للوحة الإدارة — بنفس نظام قوائم الحساب والاستوديو */
export function AdminSidebar() {
  const current = useAdminSection();
  const pending = usePendingCount();
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4 rounded-lg bg-sunken p-5">
        <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-md bg-card text-primary">
          <HarfMark className="size-7" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-caption text-tertiary">لوحة الإدارة</p>
          <p className="truncate text-base font-semibold">مكتبة حرف</p>
          <Link
            to={paths.home.getHref()}
            className="mt-0.5 inline-flex items-center gap-1 text-meta text-muted-foreground hover:text-primary"
          >
            عرض الموقع
            <ArrowLeftIcon className="size-3.5" />
          </Link>
        </div>
      </div>

      <nav aria-label="أقسام الإدارة" className="flex flex-col">
        <ul className="flex flex-col gap-0.5">
          {ADMIN_NAV.map(({ section, label, Icon }) => {
            const on = isOn(current, section);
            return (
              <li key={label}>
                <Link
                  to={paths.admin.getHref(section ?? undefined)}
                  aria-current={on ? 'page' : undefined}
                  className={sideNavRow(on)}
                >
                  <Icon filled={on} className={sideNavIcon(on)} />
                  <span className="flex-1">{label}</span>
                  {section === 'review' && <PendingBadge n={pending} />}
                </Link>
              </li>
            );
          })}
        </ul>
        <hr className="my-4 border-border" />
        <Link
          to={paths.account.getHref('')}
          className="flex h-11 items-center gap-4 rounded-sm px-4 text-lead text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground"
        >
          <ChevronRightIcon className="size-5" />
          حسابك الشخصي
        </Link>
      </nav>
    </div>
  );
}

const TAB =
  'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-control whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:bg-foreground aria-[current=page]:font-medium aria-[current=page]:text-background';

/** على الشاشات الصغيرة: صفّ أقسام يتمرّر أفقياً */
export function AdminTabs() {
  const current = useAdminSection();
  const pending = usePendingCount();
  return (
    <div className="flex flex-col gap-3 lg:hidden">
      <p className="text-caption text-tertiary">لوحة الإدارة</p>
      <nav
        aria-label="أقسام الإدارة"
        className="-mx-4 flex [scrollbar-width:none] gap-1 overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden"
      >
        {ADMIN_NAV.map((n) => (
          <Link
            key={n.label}
            to={paths.admin.getHref(n.section ?? undefined)}
            aria-current={isOn(current, n.section) ? 'page' : undefined}
            className={TAB}
          >
            {n.label}
            {n.section === 'review' && pending > 0 && (
              <span dir="ltr" className="text-caption tabular-nums opacity-70">
                {pending}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}

/** رأس صفحة داخل الإدارة */
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
        {description && <p className="mt-1 text-meta text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
