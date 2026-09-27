import { Link } from 'react-router';
import { useEffect, useState } from 'react';

import { BellIcon } from '@/components/ui/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
        <BellIcon className={cn('size-4.5 origin-top', ring && 'animate-ring')} onAnimationEnd={() => setRing(false)} />
        {unread > 0 && (
          <span
            className="absolute end-1 top-1 grid h-4 min-w-4 animate-pop-in place-items-center rounded-full bg-primary px-1 text-2xs leading-none font-medium text-white ring-2 ring-background"
            dir="ltr"
          >
            {unread}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="flex max-h-[min(560px,calc(100dvh-96px))] w-[min(380px,calc(100vw-24px))] flex-col overflow-hidden rounded-lg p-0 shadow-float"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-lg font-bold">الإشعارات</p>
          <MarkAllRead disabled={!unread} onClick={markAllRead} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* القائمة للحديث فقط (اليوم وهذا الأسبوع)؛ الأقدم في صفحة «كل الإشعارات» */}
          <NotificationList
            items={items.filter((n) => n.group !== 'earlier')}
            onRead={markRead}
            emptyText="لا جديد هذا الأسبوع."
          />
        </div>
        <Link
          to={allHref}
          onClick={() => setOpen(false)}
          className="border-t border-border px-5 py-3.5 text-center text-sm text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground"
        >
          عرض كل الإشعارات
        </Link>
      </PopoverContent>
    </Popover>
  );
}
