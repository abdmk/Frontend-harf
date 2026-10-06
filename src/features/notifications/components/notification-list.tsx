import { Link } from 'react-router';

import { CheckIcon, DownloadIcon, MagicWandIcon, ReceiptIcon, UserIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import type { NotificationKind } from '@/types/domain/notification';

import { safeHref } from '../hooks/use-notifications';
import { groupViews, type NotificationView } from '../utils/group';

const KIND = {
  approved: { Icon: CheckIcon, tone: 'bg-tint-ok text-ok-text' },
  download: { Icon: DownloadIcon, tone: 'bg-tint-brand text-primary' },
  receipt: { Icon: ReceiptIcon, tone: 'bg-tint-warn text-warn-text' },
  follow: { Icon: UserIcon, tone: 'bg-tint-info text-info-text' },
  ai: { Icon: MagicWandIcon, tone: 'bg-tint-ai text-ai-text' },
} satisfies Record<NotificationKind, unknown>;

/** يُبرز الجزء `strong` من النصّ — تقسيم نصّي بحت، بلا HTML */
function Emphasis({ text, strong }: { text: string; strong?: string }) {
  const i = strong ? text.indexOf(strong) : -1;
  if (!strong || i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <strong className="font-semibold">{strong}</strong>
      {text.slice(i + strong.length)}
    </>
  );
}

/** القائمة المنسدلة بمقاسات قائمة الحساب نفسها (صفوف مستديرة، نص 13px)؛ الصفحة أرحب */
const SIZE = {
  page: {
    root: 'pb-2',
    empty: 'px-5 py-10 text-sm',
    heading: 'px-5 pt-4 pb-2 text-xs',
    list: '',
    row: 'gap-3 px-5 py-3',
    badge: 'size-10',
    icon: 'size-4.5',
    text: 'text-sm',
    time: 'text-xs',
    dot: 'mt-2 size-6',
  },
  menu: {
    root: '',
    empty: 'px-3 py-8 text-control',
    heading: 'px-2.5 pt-3 pb-1.5 text-caption',
    list: 'flex flex-col gap-0.5',
    row: 'gap-2.5 rounded-md px-2.5 py-2',
    badge: 'size-8',
    icon: 'size-4',
    text: 'text-control',
    time: 'text-caption',
    dot: 'mt-1 size-5',
  },
} as const;

export function NotificationList({
  items,
  onRead,
  onNavigate,
  titleLevel = 'h3',
  emptyText = 'لا إشعارات بعد.',
  variant = 'page',
}: {
  items: NotificationView[];
  onRead: (id: string) => void;
  /** بعد النقر على إشعار له وجهة (مثل إغلاق القائمة) */
  onNavigate?: () => void;
  titleLevel?: 'h2' | 'h3';
  emptyText?: string;
  variant?: keyof typeof SIZE;
}) {
  const s = SIZE[variant];
  if (!items.length) return <p className={cn('text-center text-tertiary', s.empty)}>{emptyText}</p>;
  const Heading = titleLevel;
  return (
    <div className={s.root}>
      {groupViews(items).map((g) => (
        <section key={g.key} aria-labelledby={`ntf-${g.key}`}>
          <Heading id={`ntf-${g.key}`} className={cn('font-medium text-muted-foreground', s.heading)}>
            {g.label}
          </Heading>
          <ul className={s.list}>
            {g.items.map((n) => {
              const { Icon, tone } = KIND[n.kind];
              const href = safeHref(n.href);
              const label = n.unread ? `${n.text} — غير مقروء` : undefined;
              const rowCls = cn(
                'flex w-full items-start text-start transition-colors hover:bg-sunken focus-visible:bg-sunken focus-visible:outline-none',
                s.row,
                n.unread && 'bg-tint-brand/40 hover:bg-tint-brand/60',
              );
              const body = (
                <>
                  <span className={cn('grid shrink-0 place-items-center rounded-full', s.badge, tone)}>
                    <Icon className={s.icon} />
                  </span>
                  <span className="min-w-0 flex-1 pt-0.5">
                    <span className={cn('block leading-relaxed', s.text)}>
                      <Emphasis text={n.text} strong={n.strong} />
                    </span>
                    <time dateTime={n.at} className={cn('mt-0.5 block text-tertiary', s.time)}>
                      {n.when}
                    </time>
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      'grid shrink-0 place-items-center rounded-full transition-opacity',
                      s.dot,
                      n.unread ? 'bg-tint-brand' : 'opacity-0',
                    )}
                  >
                    <span className="size-2 rounded-full bg-primary-fill" />
                  </span>
                </>
              );
              return (
                <li key={n.id}>
                  {/* إشعار له وجهة يفتحها (ويُعلَّم مقروءاً)؛ بلا وجهة: يُعلَّم مقروءاً فقط */}
                  {href ? (
                    <Link
                      to={href}
                      onClick={() => {
                        onRead(n.id);
                        onNavigate?.();
                      }}
                      aria-label={label}
                      className={rowCls}
                    >
                      {body}
                    </Link>
                  ) : (
                    <button type="button" onClick={() => onRead(n.id)} aria-label={label} className={rowCls}>
                      {body}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function MarkAllRead({
  disabled,
  onClick,
  className,
}: {
  disabled: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'rounded-xs px-2 py-1 text-sm font-medium text-primary transition-colors hover:bg-tint-brand disabled:text-tertiary disabled:hover:bg-transparent',
        className,
      )}
    >
      تعليم الكل كمقروء
    </button>
  );
}
