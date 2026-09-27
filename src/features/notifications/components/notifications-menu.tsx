'use client';

import { useEffect, useState } from 'react';

import { BellIcon, CheckIcon, DownloadIcon, ReceiptIcon } from '@/components/ui/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/cn';

import type { Notification } from '@/types/domain/notification';

const KIND_ICON = { ok: CheckIcon, download: DownloadIcon, receipt: ReceiptIcon } as const;

export function NotificationsMenu({ initial }: { initial: Notification[] }) {
  const [items, setItems] = useState(initial);
  const [ring, setRing] = useState(false);
  const unread = items.filter((n) => n.unread).length;

  // الجرس يرنّ مرّة عند وجود جديد
  useEffect(() => {
    if (!unread || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(() => setRing(true), 900);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- مرّة واحدة عند التحميل
  }, []);

  return (
    <Popover>
      <PopoverTrigger
        aria-label={`الإشعارات${unread ? ` — ${unread} غير مقروءة` : ''}`}
        className="relative grid size-9 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground data-[state=open]:bg-sunken data-[state=open]:text-foreground"
      >
        <BellIcon
          className={cn('size-[18px] origin-top', ring && 'animate-ring')}
          onAnimationEnd={() => setRing(false)}
        />
        {unread > 0 && (
          <span
            className="absolute end-1 top-1 grid h-4 min-w-4 animate-pop-in place-items-center rounded-full bg-primary px-1 text-[9.5px] leading-none font-medium text-white ring-2 ring-background"
            dir="ltr"
          >
            {unread}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[min(360px,calc(100vw-24px))] rounded-lg p-2 shadow-float"
      >
        <div className="flex items-center justify-between px-3 py-2">
          <p className="text-sm font-semibold">الإشعارات</p>
          <button
            type="button"
            disabled={!unread}
            onClick={() => setItems((xs) => xs.map((n) => ({ ...n, unread: false })))}
            className="rounded-xs px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground disabled:opacity-40"
          >
            تعليم الكل مقروءاً
          </button>
        </div>
        {items.length ? (
          <ul>
            {items.map((n) => {
              const Icon = KIND_ICON[n.kind];
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => setItems((xs) => xs.map((x) => (x.id === n.id ? { ...x, unread: false } : x)))}
                    className="flex w-full gap-3 rounded-sm p-3 text-start transition-colors hover:bg-sunken"
                  >
                    <span
                      className={cn(
                        'grid size-8 shrink-0 place-items-center rounded-[10px]',
                        n.unread ? 'bg-tint-brand text-primary' : 'bg-sunken text-muted-foreground',
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm leading-relaxed">{n.text}</span>
                      <span className="block text-xs text-tertiary">{n.when}</span>
                    </span>
                    <span
                      className={cn(
                        'mt-2 size-[7px] shrink-0 rounded-full transition-colors',
                        n.unread ? 'bg-primary' : 'bg-transparent',
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="p-6 text-center text-sm text-tertiary">لا إشعارات بعد.</p>
        )}
      </PopoverContent>
    </Popover>
  );
}
