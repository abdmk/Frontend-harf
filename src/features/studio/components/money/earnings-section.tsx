import { BarList } from '@/components/shared/charts/bar-list';
import { ChartCard } from '@/components/shared/charts/chart-frame';
import { SectionCard } from '@/components/shared/section-card';
import { InfoIcon } from '@/components/ui/icons';
import { formatMoney } from '@/lib/format';
import { MOCK_MONTHLY_NET } from '@/mocks/studio';
import { cents } from '@/types/domain/commerce';
import type { StudioFont } from '@/types/domain/foundry';

import { getSales } from '../../api/earnings';
import { netOf, PUBLISHER_TERMS } from '../../config/publisher-terms';

function Row({ k, v, strong, muted }: { k: string; v: number; strong?: boolean; muted?: boolean }) {
  return (
    <div
      className={`flex justify-between gap-4 py-2.5 ${strong ? 'pt-3 font-semibold' : 'border-b'} ${muted ? 'text-muted-foreground' : ''}`}
    >
      <dt>{k}</dt>
      <dd dir="ltr" className="tabular-nums">
        {v < 0 ? '−' : ''}
        {formatMoney(cents(Math.abs(v)))}
      </dd>
    </div>
  );
}

/**
 * «الأرباح»: فهم الصافي — من سعر البيع إلى ما يصلك (حصّة حرف والرسوم والاسترجاعات)، وتطوّره
 * شهرياً، وأرباح كل خط. الأرصدة نفسها في «نظرة عامة مالية» فلا تتكرّر هنا.
 */
export function EarningsSection({ fonts }: { fonts: StudioFont[] }) {
  const month = getSales().filter((s) => s.date.startsWith('2026-09'));
  const gross = month.reduce((n, s) => n + s.grossCents, 0);
  const refunded = month.filter((s) => s.status === 'refunded');
  const refundGross = refunded.reduce((n, s) => n + s.grossCents, 0);
  const fee = month.filter((s) => s.status !== 'refunded').reduce((n, s) => n + s.feeCents, 0);
  const net = gross - refundGross - fee;
  const perFont = fonts
    .filter((f) => f.type === 'paid' && f.revenueCents)
    .map((f) => ({ label: f.name, value: Math.round(netOf(f.revenueCents!).net / 100) }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
        <SectionCard title="صافي هذا الشهر" description="سبتمبر 2026 — من سعر البيع إلى ما يصلك">
          <dl className="flex flex-col text-control">
            <Row k="مبيعات الشهر" v={gross} />
            <Row k="الاسترجاعات" v={-refundGross} muted />
            <Row k={`حصّة حرف (${PUBLISHER_TERMS.platformPct}٪، تشمل رسوم الدفع)`} v={-fee} muted />
            <Row k="صافيك" v={net} strong />
          </dl>
          <p className="mt-5 flex gap-2 text-caption leading-relaxed text-tertiary">
            <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
            الأرقام تجريبية؛ النسبة ومدّة الاسترجاع والحدّ الأدنى للسحب تُحدَّد في اتفاقية الناشر.
          </p>
        </SectionCard>
        <ChartCard title="صافي أرباحك شهرياً" subtitle="آخر ستة أشهر · بالدولار">
          <BarList items={MOCK_MONTHLY_NET} />
        </ChartCard>
      </div>
      <ChartCard title="أرباح كل خط" subtitle="صافيك منذ النشر · بالدولار">
        <BarList items={perFont} color="var(--chart-2)" />
      </ChartCard>
    </div>
  );
}
