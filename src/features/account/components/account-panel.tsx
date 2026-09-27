import Link from 'next/link';
import { Fragment } from 'react';

import { LayersIcon, SignOutIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { signOut } from '@/features/account/api/sign-out';
import { accountNavGroups } from '@/features/account/config/nav';
import type { AccountSection, User } from '@/features/account/types';
import { cn } from '@/lib/cn';

import { PlanBadge } from './plan-badge';
import { UserAvatar } from './user-avatar';

type AccountPanelProps = {
  user: User;
  active?: AccountSection | null;
  /** sidebar: عمود صفحة الحساب — menu: قائمة الصورة في الترويسة */
  variant?: 'sidebar' | 'menu';
  onNavigate?: () => void;
};

/** بطاقة المستخدم + قائمة الحساب + (للمجانية) دعوة التحويل + الخروج — مكوّن واحد في مكانين */
export function AccountPanel({ user, active = null, variant = 'sidebar', onNavigate }: AccountPanelProps) {
  const groups = accountNavGroups(user);
  return (
    <div className={cn('flex flex-col', variant === 'sidebar' ? 'min-h-full gap-5' : 'gap-3')}>
      <div className="flex items-center gap-4 rounded-lg bg-sunken p-5">
        <UserAvatar user={user} className="size-14 text-lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">{user.name}</p>
          <p className="truncate text-right text-sm text-muted-foreground" dir="ltr">
            {user.email}
          </p>
        </div>
        <PlanBadge plan={user.plan} />
      </div>

      <nav aria-label="قائمة الحساب" className="flex flex-col">
        {groups.map((group, g) => (
          <Fragment key={g}>
            {g > 0 && <hr className="my-4 border-border" />}
            <ul className="flex flex-col gap-0.5">
              {group.map(({ section, label, Icon, meta, badge }) => {
                const on = active === section;
                const m = meta?.(user);
                return (
                  <li key={section}>
                    <Link
                      href={paths.account.getHref(section)}
                      onClick={onNavigate}
                      aria-current={on ? 'page' : undefined}
                      className={cn(
                        'group/it relative flex h-11 items-center gap-4 rounded-sm px-4 text-lead transition-colors duration-150',
                        on
                          ? 'bg-tint-brand text-primary before:absolute before:inset-y-1.5 before:start-0 before:w-0.75 before:animate-in before:rounded-full before:bg-primary before:zoom-in-50'
                          : 'text-foreground hover:bg-sunken',
                      )}
                    >
                      <Icon
                        className={cn(
                          'size-5 transition-transform duration-200 ease-pop group-hover/it:scale-110',
                          on ? 'text-primary' : 'text-foreground/80',
                        )}
                      />
                      <span className="flex-1">{label}</span>
                      {m && <span className="text-sm text-muted-foreground">{m}</span>}
                      {badge && (
                        <span className="rounded-full bg-tint-brand px-3 py-1 text-xs font-medium text-primary">
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
      </nav>

      <div className={cn('flex flex-col gap-5', variant === 'sidebar' && 'mt-auto pt-8')}>
        {user.plan === 'free' && (
          <div className="flex items-center gap-4 rounded-md border p-4">
            <LayersIcon className="size-5 text-foreground/80" />
            <div className="min-w-0 flex-1">
              <p className="text-lead font-medium">تريد تنشر أعمالك؟</p>
              <p className="text-sm text-muted-foreground">حوّل حسابك إلى استوديو</p>
            </div>
            <Link
              href={paths.account.getHref('subscription')}
              onClick={onNavigate}
              className="rounded-full bg-sunken px-4 py-1.5 text-sm font-medium transition-colors hover:bg-inset"
            >
              تحويل
            </Link>
          </div>
        )}
        <form action={signOut}>
          <button
            type="submit"
            className="group/out flex h-11 w-full items-center gap-4 rounded-sm px-4 text-lead text-primary transition-colors hover:bg-tint-brand"
          >
            <SignOutIcon className="size-5 transition-transform duration-200 group-hover/out:-translate-x-0.5" />
            تسجيل خروج
          </button>
        </form>
      </div>
    </div>
  );
}
