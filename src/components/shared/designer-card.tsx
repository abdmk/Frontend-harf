import { Link } from 'react-router';

import { Avatar } from './avatar';
import { FollowButton } from './follow-button';
import { VerifiedBadge } from './verified-badge';

/**
 * بطاقة المصمّم المختصرة (دليل التصميم 4.1): غلاف، صورة، متابعة، أرقام، وأشهر خطوطه.
 * مع `href` تصير البطاقة كلها رابطاً لصفحة المصمّم (زرّ المتابعة يبقى مستقلاً فوقه).
 */
export function DesignerCard({
  id,
  href,
  name,
  initials,
  subtitle,
  verified,
  stats,
  fonts,
  following,
}: {
  id: string;
  href?: string;
  name: string;
  initials: string;
  subtitle: string;
  verified?: boolean;
  stats: { fonts: number; weights: number; followers: number };
  fonts: string[];
  following?: boolean;
}) {
  return (
    <article className="relative overflow-hidden rounded-xl border bg-card transition-[border-color,box-shadow] duration-(--dur-base) has-[a:hover]:border-strong has-[a:hover]:shadow-soft">
      <div aria-hidden className="h-18 bg-sunken" />
      <div className="px-5 pb-5">
        <div className="relative -mt-8 flex items-end justify-between gap-3">
          <Avatar initials={initials} seed={id} size="xl" className="ring-4 ring-card" />
          <FollowButton name={name} initial={following} className="relative z-10" />
        </div>
        <h3 className="mt-3 flex items-center gap-1.5 text-lg font-semibold">
          {href ? (
            <Link
              to={href}
              className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary"
            >
              {name}
            </Link>
          ) : (
            name
          )}
          {verified && <VerifiedBadge />}
        </h3>
        <p className="text-caption text-muted-foreground">{subtitle}</p>
        <dl className="mt-4 grid grid-cols-3 divide-x divide-border rounded-md bg-sunken py-3 text-center">
          {(
            [
              ['خطوط', stats.fonts],
              ['أوزان', stats.weights],
              ['متابع', stats.followers],
            ] as const
          ).map(([k, v]) => (
            <div key={k}>
              <dd dir="ltr" className="text-base font-semibold">
                {v.toLocaleString('en-US')}
              </dd>
              <dt className="text-caption text-muted-foreground">{k}</dt>
            </div>
          ))}
        </dl>
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {fonts.slice(0, 3).map((f) => (
            <li
              key={f}
              title={f}
              className="grid h-11 min-w-0 place-items-center rounded-sm bg-ink px-2 text-control font-semibold text-ink-foreground"
            >
              <span className="block max-w-full truncate">{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
