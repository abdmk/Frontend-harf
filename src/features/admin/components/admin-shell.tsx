import { Link } from 'react-router';

import { sideNavIcon, sideNavRow } from '@/components/shared/side-nav';
import { ChevronRightIcon, ShieldCheckIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { useCurrentUser } from '@/hooks/use-current-user';
import { cn } from '@/lib/cn';

import { useAdminSection } from './admin-nav';
import { usePendingCount } from '../api/review';
import { usePendingStudios } from '../api/studios';
import { ADMIN_NAV, isAdminNavOn } from '../config/nav';

/** كل ما ينتظر قراراً: خطوط بانتظار المراجعة + استوديوهات بانتظار التوثيق */
function usePendingRequests() {
  return usePendingCount() + usePendingStudios();
}

function CountBadge({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span
      dir="ltr"
      aria-label={`${n} بانتظار قرارك`}
      className="grid h-5.5 min-w-5.5 place-items-center rounded-full bg-primary-fill px-1.5 text-caption font-semibold text-primary-foreground tabular-nums"
    >
      {n}
    </span>
  );
}

/**
 * العمود الجانبي للإدارة — بنمط الحساب والاستوديو نفسه (صفوف sideNavRow) لتبقى جزءاً من حرف:
 * بطاقة «لوحة الإدارة»، ستّة أقسام، ثم العودة إلى الحساب.
 */
export function AdminSidebar() {
  const current = useAdminSection();
  const pending = usePendingRequests();
  const user = useCurrentUser();
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4 rounded-lg bg-sunken p-5">
        <span className="grid size-14 shrink-0 place-items-center rounded-md bg-card text-primary [&_svg]:size-6">
          <ShieldCheckIcon filled />
        </span>
        <div className="min-w-0">
          <p className="text-caption text-tertiary">لوحة الإدارة</p>
          <p className="truncate text-base font-semibold">{user?.name}</p>
        </div>
      </div>

      <nav aria-label="أقسام الإدارة">
        <ul className="flex flex-col gap-0.5">
          {ADMIN_NAV.map((item) => {
            const on = isAdminNavOn(item, current);
            return (
              <li key={item.label}>
                <Link
                  to={paths.admin.getHref(item.section ?? undefined)}
                  aria-current={on ? 'page' : undefined}
                  className={sideNavRow(on)}
                >
                  <item.Icon filled={on} className={sideNavIcon(on)} />
                  <span className="flex-1">{item.label}</span>
                  {item.section === 'requests' && <CountBadge n={pending} />}
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

/** على الشاشات الصغيرة: صفّ أقسام يتمرّر أفقياً — كما في الاستوديو */
export function AdminTabs() {
  const current = useAdminSection();
  const pending = usePendingRequests();
  return (
    <nav
      aria-label="أقسام الإدارة"
      className="-mx-4 flex [scrollbar-width:none] gap-1 overflow-x-auto px-4 lg:hidden [&::-webkit-scrollbar]:hidden"
    >
      {ADMIN_NAV.map((item) => {
        const on = isAdminNavOn(item, current);
        return (
          <Link
            key={item.label}
            to={paths.admin.getHref(item.section ?? undefined)}
            aria-current={on ? 'page' : undefined}
            className={cn(
              'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-control whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground',
              on && 'bg-foreground font-medium text-background hover:text-background',
            )}
          >
            {item.label}
            {item.section === 'requests' && pending > 0 && (
              <span className="size-1.5 rounded-full bg-primary-fill" aria-label={`${pending} بانتظار قرارك`} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
