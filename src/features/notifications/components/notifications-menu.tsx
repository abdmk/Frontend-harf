import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { BellIcon } from '@/components/ui/icons';
import { focusPanel, Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/cn';

import { MarkAllRead, NotificationList } from './notification-list';
import { useNotifications } from '../hooks/use-notifications';
import type { NotificationView } from '../utils/group';

export function NotificationsMenu({ initial, allHref }: { initial: NotificationView[]; allHref: string }) {
  const { items, unread, markRead, markAllRead } = useNotifications(initial);
  const [open, setOpen] = useState(false);
  const [ring, setRing] = useState(false);

  // الجرس يرنّ مرّة عند وجود جديد
  useEffect(() => {
    if (!unread || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(() => setRing(true), 900);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- مرّة واحدة عند التحميل
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={`الإشعارات${unread ? ` — ${unread} غير مقروءة` : ''}`}
        className="relative grid size-9 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground data-[state=open]:bg-sunken data-[state=open]:text-foreground"
      >
        <BellIcon
          filled={open}
          className={cn('size-4.5 origin-top', ring && 'animate-ring')}
          onAnimationEnd={() => setRing(false)}
        />
        {unread > 0 && (
          <span
            className="absolute end-1 top-1 grid h-4 min-w-4 animate-pop-in place-items-center rounded-full bg-primary-fill px-1 text-2xs leading-none font-medium text-white ring-2 ring-background"
            dir="ltr"
          >
            {unread}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        tabIndex={-1}
        onOpenAutoFocus={focusPanel}
        sideOffset={10}
        className="flex max-h-[min(520px,calc(100dvh-96px))] w-[min(var(--container-menu),calc(100vw-24px))] flex-col overflow-hidden rounded-xl p-2.5 shadow-overlay"
      >
        <div className="flex items-center justify-between gap-2 px-2.5 pt-1 pb-2.5">
          <p className="text-control font-semibold">الإشعارات</p>
          <MarkAllRead disabled={!unread} onClick={markAllRead} className="-me-2 text-meta" />
        </div>
        <hr className="-mx-2.5 border-border" />
        <div className="-mx-2.5 min-h-0 flex-1 overflow-y-auto px-2.5">
          {/* القائمة للحديث فقط (اليوم وهذا الأسبوع)؛ الأقدم في صفحة «كل الإشعارات» */}
          <NotificationList
            variant="menu"
            items={items.filter((n) => n.group !== 'earlier')}
            onRead={markRead}
            onNavigate={() => setOpen(false)}
            emptyText="لا جديد هذا الأسبوع."
          />
        </div>
        <hr className="-mx-2.5 mt-2.5 border-border" />
        <Link
          to={allHref}
          onClick={() => setOpen(false)}
          className="mt-2 grid h-9 place-items-center rounded-md text-control text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground"
        >
          عرض كل الإشعارات
        </Link>
      </PopoverContent>
    </Popover>
  );
}
