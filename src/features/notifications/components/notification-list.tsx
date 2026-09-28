import { CheckIcon, DownloadIcon, MagicWandIcon, ReceiptIcon, UserIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import type { NotificationKind } from '@/types/domain/notification';

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

export function NotificationList({
  items,
  onRead,
  titleLevel = 'h3',
  emptyText = 'لا إشعارات بعد.',
}: {
  items: NotificationView[];
  onRead: (id: string) => void;
  titleLevel?: 'h2' | 'h3';
  emptyText?: string;
}) {
  if (!items.length) return <p className="px-5 py-10 text-center text-sm text-tertiary">{emptyText}</p>;
  const Heading = titleLevel;
  return (
    <div className="pb-2">
      {groupViews(items).map((g) => (
        <section key={g.key} aria-labelledby={`ntf-${g.key}`}>
          <Heading id={`ntf-${g.key}`} className="px-5 pt-4 pb-2 text-xs font-medium text-muted-foreground">
            {g.label}
          </Heading>
          <ul>
            {g.items.map((n) => {
              const { Icon, tone } = KIND[n.kind];
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => onRead(n.id)}
                    aria-label={n.unread ? `${n.text} — غير مقروء` : undefined}
                    className={cn(
                      'flex w-full items-start gap-3 px-5 py-3 text-start transition-colors hover:bg-sunken focus-visible:bg-sunken focus-visible:outline-none',
                      n.unread && 'bg-tint-brand/40 hover:bg-tint-brand/60',
                    )}
                  >
                    <span className={cn('grid size-10 shrink-0 place-items-center rounded-full', tone)}>
                      <Icon className="size-4.5" />
                    </span>
                    <span className="min-w-0 flex-1 pt-0.5">
                      <span className="block text-sm leading-relaxed">
                        <Emphasis text={n.text} strong={n.strong} />
                      </span>
                      <time dateTime={n.at} className="mt-0.5 block text-xs text-tertiary">
                        {n.when}
                      </time>
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        'mt-2 grid size-6 shrink-0 place-items-center rounded-full transition-opacity',
                        n.unread ? 'bg-tint-brand' : 'opacity-0',
                      )}
                    >
                      <span className="size-2 rounded-full bg-primary" />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function MarkAllRead({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-xs px-2 py-1 text-sm font-medium text-primary transition-colors hover:bg-tint-brand disabled:text-tertiary disabled:hover:bg-transparent"
    >
      تعليم الكل كمقروء
    </button>
  );
}
