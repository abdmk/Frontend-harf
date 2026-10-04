import { type Ref, useState } from 'react';
import { Link, useLocation } from 'react-router';

import { ShieldCheckIcon } from '@/components/ui/icons';
import { focusPanel, Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { paths } from '@/config/paths';
import { navKeyFor } from '@/features/account/config/nav';
import type { User } from '@/features/account/types';

import { AccountPanel } from './account-panel';
import { PLAN_BADGE_LABEL, PlanBadge } from './plan-badge';
import { UserAvatar } from './user-avatar';

/** شارة الخطة + صورة المستخدم في الترويسة؛ الصورة تفتح قائمة الحساب نفسها */
export function AccountMenu({
  user,
  onManagePlan,
  triggerRef,
}: {
  user: User;
  onManagePlan?: () => void;
  /** زرّ الصورة — ليعود إليه التركيز من نوافذ تُفتح من القائمة */
  triggerRef?: Ref<HTMLButtonElement>;
}) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const active = navKeyFor(pathname);

  return (
    <>
      {/* المشرف: «الإدارة» مكان شارة الخطة — مدخل لوحة الإدارة */}
      {user.role === 'admin' ? (
        <Link
          to={paths.admin.getHref()}
          className="mx-1 hidden h-7.5 items-center gap-1.5 rounded-full bg-tint-brand px-3 text-meta leading-none font-medium whitespace-nowrap text-primary transition-transform active:scale-95 sm:inline-flex"
        >
          <ShieldCheckIcon className="size-3.5" />
          الإدارة
        </Link>
      ) : (
        <Link
          to={paths.account.getHref('subscription')}
          className="mx-1 hidden transition-transform active:scale-95 sm:inline-flex"
          aria-label={`خطّتك: ${PLAN_BADGE_LABEL[user.plan]}`}
        >
          <PlanBadge plan={user.plan} />
        </Link>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          ref={triggerRef}
          aria-label={`حساب ${user.name}`}
          className="ms-1 rounded-full transition-[box-shadow,transform] duration-(--dur-fast) hover:shadow-[0_0_0_4px_var(--sunken)] active:scale-95"
        >
          <UserAvatar user={user} className="size-9 text-control" />
        </PopoverTrigger>
        <PopoverContent
          align="end"
          tabIndex={-1}
          onOpenAutoFocus={focusPanel}
          sideOffset={10}
          className="max-h-[calc(100dvh-96px)] w-[min(var(--container-menu),calc(100vw-24px))] overflow-y-auto rounded-xl p-2.5 shadow-overlay"
        >
          <AccountPanel
            user={user}
            active={active}
            variant="menu"
            onNavigate={() => setOpen(false)}
            onManagePlan={
              onManagePlan &&
              (() => {
                setOpen(false);
                onManagePlan();
              })
            }
          />
        </PopoverContent>
      </Popover>
    </>
  );
}
