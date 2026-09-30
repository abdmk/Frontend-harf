import { Link } from 'react-router';

import { BarList } from '@/components/shared/charts/bar-list';
import { ChartCard } from '@/components/shared/charts/chart-frame';
import { SectionCard } from '@/components/shared/section-card';
import { Button } from '@/components/ui/button';
import { CheckIcon, ClockIcon, DollarIcon, InfoIcon, RefreshIcon } from '@/components/ui/icons';
import { paths } from '@/config/paths';
import { formatDateAr, formatMoney } from '@/lib/format';
import { MOCK_MONTHLY_NET } from '@/mocks/studio';
import { cents } from '@/types/domain/commerce';

import { useEarnings } from '../../api/earnings';
import { netOf, PUBLISHER_TERMS } from '../../config/publisher-terms';

const EXAMPLE = 10000;

/** «الأرباح»: الرصيد المتاح، ما ينتظر انقضاء مدّة الاسترجاع، وكيف يُحسب صافيك من كل بيع */
export function EarningsSection() {
  const e = useEarnings();
  const ex = netOf(EXAMPLE);
  const rows = [
    [
      'قيد الاسترجاع',
      e.onHold,
      `يصير متاحاً بعد ${PUBLISHER_TERMS.holdDays} يوماً من البيع`,
      ClockIcon,
      'bg-tint-info text-info-text',
    ],
    ['قيد التحويل', e.processing, 'طلبات سحب قيد المعالجة', RefreshIcon, 'bg-tint-warn text-warn-text'],
    ['إجمالي أرباحك', e.total, 'منذ انضمامك، بعد حصّة حرف', DollarIcon, 'bg-tint-brand text-primary'],
    ['المحوَّل إليك', e.paid, 'مجموع التحويلات المكتملة', CheckIcon, 'bg-tint-ok text-ok-text'],
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <section
        aria-labelledby="balance-t"
        className="flex animate-fade-up flex-col gap-6 rounded-xl border bg-card p-6 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p id="balance-t" className="text-control text-muted-foreground">
            الرصيد المتاح للسحب
          </p>
          <p dir="ltr" className="mt-2 text-right text-5xl font-semibold tracking-tight tabular-nums">
            {formatMoney(cents(e.available))}
          </p>
          <p className="mt-2 text-meta text-muted-foreground">
            التحويل التلقائي القادم <strong className="text-foreground">{formatDateAr(e.nextPayout)}</strong>
          </p>
        </div>
        <Button asChild>
          <Link to={paths.account.getHref('payouts')}>
            <DollarIcon />
            اسحب رصيدك
          </Link>
        </Button>
      </section>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {rows.map(([label, amount, hint, Icon, tint]) => (
          <li key={label} className="flex items-center gap-4 rounded-xl border bg-card p-4">
            <span className={`grid size-11 shrink-0 place-items-center rounded-sm ${tint}`}>
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-caption text-muted-foreground">{label}</p>
              <p dir="ltr" className="text-right text-lg font-semibold tabular-nums">
                {formatMoney(cents(amount))}
              </p>
              <p className="truncate text-caption text-tertiary">{hint}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
        <ChartCard title="صافي أرباحك شهرياً" subtitle="آخر ستة أشهر · بالدولار">
          <BarList items={MOCK_MONTHLY_NET} />
        </ChartCard>

        <SectionCard title="كيف يُحسب صافيك" description={`مثال: بيع ترخيص بـ${formatMoney(cents(EXAMPLE))}`}>
          <dl className="flex flex-col text-control">
            {(
              [
                ['سعر البيع', EXAMPLE, ''],
                [`حصّة حرف (${PUBLISHER_TERMS.platformPct}٪، تشمل رسوم الدفع)`, -ex.fee, 'text-muted-foreground'],
              ] as const
            ).map(([k, v, cls]) => (
              <div key={k} className={`flex justify-between gap-4 border-b py-2.5 ${cls}`}>
                <dt>{k}</dt>
                <dd dir="ltr" className="tabular-nums">
                  {v < 0 ? '−' : ''}
                  {formatMoney(cents(Math.abs(v)))}
                </dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 pt-3 font-semibold">
              <dt>صافيك</dt>
              <dd dir="ltr" className="tabular-nums">
                {formatMoney(cents(ex.net))}
              </dd>
            </div>
          </dl>
          <p className="mt-5 flex gap-2 text-caption leading-relaxed text-tertiary">
            <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
            الأرقام تجريبية؛ النسبة ومدّة الاسترجاع والحدّ الأدنى للسحب تُحدَّد في اتفاقية الناشر.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
