'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { paths } from '@/config/paths';

import { ACCOUNT_SECTIONS, type AccountSection, type User } from '@/features/account/types';

import { AccountPanel } from './account-panel';
import { PlanBadge } from './plan-badge';
import { UserAvatar } from './user-avatar';

/** شارة الخطة + صورة المستخدم في الترويسة؛ الصورة تفتح قائمة الحساب نفسها */
export function AccountMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const seg = pathname.startsWith('/account/') ? pathname.split('/')[2] : null;
  const active = (ACCOUNT_SECTIONS as readonly string[]).includes(seg ?? '') ? (seg as AccountSection) : null;

  return (
    <>
      <Link
        href={paths.account.getHref('subscription')}
        className="mx-1 hidden transition-transform active:scale-95 sm:inline-flex"
        aria-label={`خطّتك: ${user.plan === 'studio' ? 'الاستوديو' : 'مجانية'}`}
      >
        <PlanBadge plan={user.plan} />
      </Link>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          aria-label={`حساب ${user.name}`}
          className="ms-1 rounded-full transition-[box-shadow,transform] duration-150 hover:shadow-[0_0_0_4px_var(--sunken)] active:scale-95"
        >
          <UserAvatar user={user} className="size-9 text-[13px]" />
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={10}
          className="max-h-[calc(100dvh-96px)] w-[min(360px,calc(100vw-24px))] overflow-y-auto rounded-xl p-4 shadow-overlay"
        >
          <AccountPanel user={user} active={active} variant="menu" onNavigate={() => setOpen(false)} />
        </PopoverContent>
      </Popover>
    </>
  );
}
