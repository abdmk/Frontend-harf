import { Avatar } from './avatar';
import { FollowButton } from './follow-button';

/** بطاقة المصمّم المختصرة (دليل التصميم 4.1): غلاف، صورة، متابعة، أرقام، وأشهر خطوطه */
export function DesignerCard({
  id,
  name,
  initials,
  subtitle,
  verified,
  stats,
  fonts,
  following,
}: {
  id: string;
  name: string;
  initials: string;
  subtitle: string;
  verified?: boolean;
  stats: { fonts: number; downloads: string; followers: number };
  fonts: string[];
  following?: boolean;
}) {
  return (
    <article className="overflow-hidden rounded-xl border bg-card">
      <div aria-hidden className="h-21 bg-(image:--grad-aurora) opacity-80" />
      <div className="px-5 pb-5">
        <div className="-mt-8 flex items-end justify-between gap-3">
          <Avatar initials={initials} seed={id} size="xl" className="ring-4 ring-card" />
          <FollowButton name={name} initial={following} />
        </div>
        <h3 className="mt-3 flex items-center gap-1.5 text-lg font-semibold">
          {name}
          {verified && (
            <span className="grid size-4 place-items-center rounded-full bg-trial-500 text-white" title="موثّق">
              <svg viewBox="0 0 12 12" aria-hidden className="size-2.5">
                <path
                  d="M2.5 6.2 5 8.5l4.5-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="sr-only">موثّق</span>
            </span>
          )}
        </h3>
        <p className="text-caption text-muted-foreground">{subtitle}</p>
        <dl className="mt-4 grid grid-cols-3 divide-x divide-border rounded-md bg-sunken py-3 text-center divide-x-reverse">
          {(
            [
              ['خطوط', stats.fonts],
              ['تحميل', stats.downloads],
              ['متابع', stats.followers],
            ] as const
          ).map(([k, v]) => (
            <div key={k}>
              <dd dir="ltr" className="text-base font-semibold">
                {typeof v === 'number' ? v.toLocaleString('en-US') : v}
              </dd>
              <dt className="text-caption text-muted-foreground">{k}</dt>
            </div>
          ))}
        </dl>
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {fonts.slice(0, 3).map((f) => (
            <li
              key={f}
              className="grid h-11 place-items-center rounded-sm bg-(image:--grad-ink) text-control font-semibold text-white"
            >
              {f}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
