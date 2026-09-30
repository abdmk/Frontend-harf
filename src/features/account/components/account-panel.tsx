import { Fragment } from 'react';
import { Link, useNavigate } from 'react-router';

import { sideNavIcon, sideNavRow } from '@/components/shared/side-nav';
import { ChartHistogramIcon, CrownIcon, LayersIcon, SignOutIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { signOut } from '@/features/account/api/sign-out';
import { accountNavGroups, PLAN_TITLE } from '@/features/account/config/nav';
import type { AccountSection, User } from '@/features/account/types';
import { cn } from '@/lib/cn';

import { PLAN_TEXT, PlanBadge } from './plan-badge';
import { UserAvatar } from './user-avatar';

type AccountPanelProps = {
  user: User;
  active?: AccountSection | null;
  /** sidebar: عمود صفحة الحساب — menu: قائمة الصورة في الترويسة */
  variant?: 'sidebar' | 'menu';
  onNavigate?: () => void;
  /** «إدارة الخطة» يفتح نافذة الخطط مباشرة؛ بدونه يذهب لصفحة الاشتراك */
  onManagePlan?: () => void;
};

/** القائمة المنسدلة أصغر من عمود صفحة الحساب: صفوف أقصر ونص وأيقونات أصغر */
const SIZE = {
  sidebar: {
    root: 'min-h-full gap-5',
    card: 'gap-4 rounded-lg p-5',
    avatar: 'size-14 text-lg',
    name: 'text-base',
    email: 'text-sm',
    row: 'h-11 gap-4 px-4 text-lead',
    icon: 'size-5',
    meta: 'text-sm',
    hr: 'my-4',
    box: 'gap-4 rounded-md p-4',
    boxTitle: 'text-lead',
    boxSub: 'text-sm',
  },
  menu: {
    root: 'gap-2',
    card: 'gap-3 rounded-md p-3',
    avatar: 'size-10 text-sm',
    name: 'text-control',
    email: 'text-meta',
    row: 'h-9 gap-3 px-3 text-control',
    icon: 'size-4.5',
    meta: 'text-meta',
    hr: 'my-2',
    box: 'gap-3 rounded-md p-3',
    boxTitle: 'text-control',
    boxSub: 'text-meta',
  },
} as const;

const MANAGE_PLAN = 'rounded-full border bg-card px-3 py-1 text-meta font-medium transition-colors hover:bg-background';

/** بطاقة المستخدم + قائمة الحساب + (للمجانية) دعوة التحويل + الخروج — مكوّن واحد في مكانين */
export function AccountPanel({
  user,
  active = null,
  variant = 'sidebar',
  onNavigate,
  onManagePlan,
}: AccountPanelProps) {
  const groups = accountNavGroups(user);
  const navigate = useNavigate();
  const s = SIZE[variant];
  const menu = variant === 'menu';
  const handleSignOut = () => {
    signOut();
    navigate('/');
  };
  return (
    <div className={cn('flex flex-col', s.root)}>
      <div className={cn('flex items-center bg-sunken', s.card)}>
        <UserAvatar user={user} className={s.avatar} />
        <div className="min-w-0 flex-1">
          <p className={cn('truncate font-semibold', s.name)}>{user.name}</p>
          <p className={cn('truncate text-right text-muted-foreground', s.email)} dir="ltr">
            {user.email}
          </p>
        </div>
        {/* في العمود الجانبي الضيّق (lg) تُخفى الشارة ليظهر البريد كاملاً؛ الخطة في بند «الاشتراك» */}
        {!menu && <PlanBadge plan={user.plan} className="lg:hidden" />}
      </div>

      {menu && (
        <div className="flex items-center gap-2.5 rounded-md bg-sunken py-2 ps-3 pe-2">
          <CrownIcon className={cn('size-4.5', PLAN_TEXT[user.plan])} />
          <p className="flex-1 text-control">{PLAN_TITLE[user.plan]}</p>
          {onManagePlan ? (
            <button type="button" onClick={onManagePlan} className={MANAGE_PLAN}>
              إدارة الخطة
            </button>
          ) : (
            <Link to={paths.account.getHref('subscription')} onClick={onNavigate} className={MANAGE_PLAN}>
              إدارة الخطة
            </Link>
          )}
        </div>
      )}

      <nav aria-label="قائمة الحساب" className="flex flex-col">
        {groups.map((group, g) => (
          <Fragment key={g}>
            {g > 0 && <hr className={cn('border-border', s.hr)} />}
            <ul className="flex flex-col gap-0.5">
              {group.map(({ section, label, Icon, meta, badge, href }) => {
                const on = active === section;
                const m = meta?.(user);
                return (
                  <li key={section}>
                    <Link
                      to={href ?? paths.account.getHref(section)}
                      onClick={onNavigate}
                      aria-current={on ? 'page' : undefined}
                      className={sideNavRow(on, menu ? 'sm' : 'lg')}
                    >
                      <Icon filled={on} className={sideNavIcon(on, menu ? 'sm' : 'lg')} />
                      <span className="flex-1">{label}</span>
                      {m && <span className={cn('text-muted-foreground', s.meta)}>{m}</span>}
                      {badge && (
                        <span className="rounded-full bg-tint-brand px-2.5 py-0.5 text-xs font-medium text-primary">
                          {badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Fragment>
        ))}
        {user.role === 'admin' && (
          <>
            <hr className={cn('border-border', s.hr)} />
            <Link
              to={paths.admin.analytics.getHref()}
              onClick={onNavigate}
              className={cn('flex items-center rounded-sm transition-colors hover:bg-sunken', s.row)}
            >
              <ChartHistogramIcon className={cn('text-foreground/80', s.icon)} />
              لوحة الإدارة
            </Link>
          </>
        )}
      </nav>

      <div className={cn('flex flex-col', menu ? 'gap-2' : 'mt-auto gap-5 pt-8')}>
        {user.plan !== 'studio' && (
          <div className={cn('flex items-center border', s.box)}>
            <LayersIcon className={cn('text-foreground/80', s.icon)} />
            <div className="min-w-0 flex-1">
              <p className={cn('font-medium', s.boxTitle)}>تريد تنشر أعمالك؟</p>
              <p className={cn('text-muted-foreground', s.boxSub)}>حوّل حسابك إلى استوديو</p>
            </div>
            <Link
              to={paths.account.getHref('subscription')}
              onClick={onNavigate}
              className={cn(
                'rounded-full bg-sunken font-medium transition-colors hover:bg-inset',
                menu ? 'px-3 py-1 text-meta' : 'px-4 py-1.5 text-sm',
              )}
            >
              تحويل
            </Link>
          </div>
        )}
        <form action={handleSignOut}>
          <button
            type="submit"
            className={cn(
              'group/out flex w-full items-center rounded-sm text-primary transition-colors hover:bg-tint-brand',
              s.row,
            )}
          >
            <SignOutIcon
              className={cn('transition-transform duration-(--dur-base) group-hover/out:-translate-x-0.5', s.icon)}
            />
            تسجيل خروج
          </button>
        </form>
      </div>
    </div>
  );
}
