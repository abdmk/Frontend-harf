import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ClockIcon, CrownIcon, DownloadIcon, MagicWandIcon } from '@/components/ui/icons';
import { PLAN_TITLE } from '@/features/account/config/nav';
import type { User } from '@/features/account/types';
import { cn } from '@/lib/cn';
import type { UsageMeter } from '@/types/domain/user';

import { PLAN_TEXT } from '../plan-badge';

/** صيغ العدد العربية: واحد / مثنّى / 3–10 / 11+ */
type Forms = { one: string; two: string; few: string; many: string };
const plural = (n: number, f: Forms) =>
  n === 1 ? f.one : n === 2 ? f.two : n <= 10 ? `${n} ${f.few}` : `${n} ${f.many}`;

const LIMITS = [
  {
    key: 'downloads',
    label: 'تحميل الخطوط',
    Icon: DownloadIcon,
    forms: { one: 'تحميل واحد', two: 'تحميلان', few: 'تحميلات', many: 'تحميلاً' },
    spent: 'استُخدمت جميع التحميلات المتاحة',
  },
  {
    key: 'matching',
    label: 'عين',
    Icon: MagicWandIcon,
    forms: { one: 'مطابقة واحدة', two: 'مطابقتان', few: 'مطابقات', many: 'مطابقة' },
    spent: 'اكتملت المطابقات المتاحة',
  },
] as const;

/**
 * حالة الاستخدام: سطر الخطة، ملخّص الحدود المتاحة، ثم بطاقة لكل حدّ مجمّعة حسب دورة التجدّد
 * مع عدّاد تنازلي. «ترقية الخطة» تظهر فقط على الحدّ الذي نفد.
 */
export function UsageSection({ user, onManagePlan }: { user: User; onManagePlan?: () => void }) {
  const meters = LIMITS.map((l) => ({ ...l, meter: user.usage[l.key] }));
  const limited = meters.filter((m) => m.meter.limit !== null);
  const available = limited.filter((m) => m.meter.used < m.meter.limit!).length;
  const countdown = useCountdown(user.usage.resetsInHours);
  const canUpgrade = user.plan !== 'studio' && !!onManagePlan;

  return (
    <div className="flex flex-col gap-6">
      <p className="-mt-3 text-control text-muted-foreground">تابع استخدامك والحدود المتاحة ضمن خطتك الحالية.</p>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 rounded-xl bg-sunken py-3.5 ps-5 pe-3">
          <CrownIcon className={cn('size-5', PLAN_TEXT[user.plan])} />
          <p className="flex-1 text-lead font-medium">{PLAN_TITLE[user.plan]}</p>
          {onManagePlan && (
            <Button size="sm" variant="outline" shape="pill" onClick={onManagePlan}>
              إدارة الخطة
            </Button>
          )}
        </div>
        {limited.length > 0 ? (
          <div className="flex items-center gap-3 px-1">
            <div className="flex gap-1" aria-hidden>
              {limited.map((m) => (
                <span
                  key={m.key}
                  className={cn(
                    'h-1.5 w-8 rounded-full',
                    m.meter.used < m.meter.limit! ? PLAN_BAR[user.plan] : 'bg-inset',
                  )}
                />
              ))}
            </div>
            <p className="text-meta text-muted-foreground">{availableLabel(available, limited.length)}</p>
          </div>
        ) : (
          <p className="px-1 text-meta text-muted-foreground">لا حدود على التحميل و«عين» في خطتك.</p>
        )}
      </div>

      <section aria-labelledby="usage-daily" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2 px-1">
          <h2 id="usage-daily" className="text-control font-medium">
            يومياً
          </h2>
          {limited.length > 0 && (
            <p className="flex items-center gap-1.5 text-meta text-muted-foreground">
              <ClockIcon className="size-3.5" />
              يتجدّد بعد
              <time dir="ltr" className="font-medium text-foreground tabular-nums">
                {countdown}
              </time>
            </p>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {meters.map((m) => (
            <LimitCard
              key={m.key}
              label={m.label}
              Icon={m.Icon}
              meter={m.meter}
              status={statusLine(m.meter, m.forms, m.spent)}
              onUpgrade={canUpgrade ? onManagePlan : undefined}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

const PLAN_BAR = { free: 'bg-ok-500', basic: 'bg-warn-500', studio: 'bg-trial-500' } as const;

function availableLabel(n: number, total: number) {
  if (n === total) return total === 2 ? 'الحدّان متاحان' : `كل الحدود متاحة (${total})`;
  if (n === 0) return 'نفدت كل الحدود حتى التجدّد القادم';
  return `${n === 1 ? 'حدّ واحد متاح' : `${n} حدود متاحة`} من ${total}`;
}

function statusLine(meter: UsageMeter, forms: Forms, spent: string) {
  if (meter.limit === null) return 'غير محدود في خطتك';
  const left = meter.limit - meter.used;
  return left <= 0 ? spent : `المتبقّي: ${plural(left, forms)}`;
}

function LimitCard({
  label,
  Icon,
  meter,
  status,
  onUpgrade,
}: {
  label: string;
  Icon: (typeof LIMITS)[number]['Icon'];
  meter: UsageMeter;
  status: string;
  onUpgrade?: () => void;
}) {
  const unlimited = meter.limit === null;
  const spent = !unlimited && meter.used >= meter.limit!;
  const pct = unlimited ? 100 : Math.min(100, Math.round((meter.used / meter.limit!) * 100));
  return (
    <article
      className={cn(
        'flex animate-fade-up flex-col gap-4 rounded-xl border p-5 transition-colors',
        spent ? 'bg-sunken' : 'bg-card',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="flex items-center gap-2 text-lead font-medium">
            <Icon className="size-4.5 text-foreground/80" />
            {label}
          </h3>
          <p className={cn('text-meta', spent ? 'text-warn-text' : 'text-muted-foreground')}>{status}</p>
        </div>
        {!unlimited && (
          <p dir="ltr" className="shrink-0 text-2xl font-semibold tabular-nums">
            {meter.used}
            <span className="text-base font-normal text-tertiary"> / {meter.limit}</span>
          </p>
        )}
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={meter.limit ?? meter.used}
        aria-valuenow={meter.used}
        aria-valuetext={status}
        className="h-2 overflow-hidden rounded-full bg-inset"
      >
        <span
          className={cn(
            'block h-full rounded-full transition-[width] duration-(--dur-xslow) ease-out-quint',
            unlimited ? 'bg-ok-500' : spent ? 'bg-warn-500' : 'bg-primary-fill',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {spent && onUpgrade && (
        <Button size="sm" variant="outline" shape="pill" className="self-start" onClick={onUpgrade}>
          ترقية الخطة
        </Button>
      )}
    </article>
  );
}

/** عدّاد تنازلي HH:MM:SS حتى التجدّد — الهدف يُثبَّت عند أول رسم */
function useCountdown(hours: number) {
  const [target] = useState(() => Date.now() + hours * 3_600_000);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const s = Math.max(0, Math.floor((target - now) / 1000));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}
