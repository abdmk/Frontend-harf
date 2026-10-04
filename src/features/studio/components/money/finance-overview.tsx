import { Link } from 'react-router';

import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { CheckIcon, ChevronLeftIcon, ClockIcon, DollarIcon, RefreshIcon } from '@/components/ui/icons';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { paths } from '@/config/paths';
import { useCurrentUser } from '@/hooks/use-current-user';
import { formatDateAr, formatMoney } from '@/lib/format';
import { PUBLISHER_TERMS } from '@/lib/publisher-terms';
import { useIsVerified } from '@/lib/studio-verification';
import { cents } from '@/types/domain/commerce';

import { getSales, useEarnings } from '../../api/earnings';

/** للاستوديو الذي لا يبيع: شرح واحد بدل أرقام صفرية */
export function FinanceEmpty() {
  return (
    <EmptyState
      icon={<DollarIcon />}
      title="لا مبيعات بعد"
      description={`خطوطك كلها مجانية. انشر خطاً مدفوعاً لتبدأ البيع — تحصل على ${100 - PUBLISHER_TERMS.platformPct}٪ من كل ترخيص.`}
      action={
        <Button asChild>
          <Link to={paths.studio.getHref('publish')}>انشر خطاً مدفوعاً</Link>
        </Button>
      }
    />
  );
}

/** «نظرة عامة مالية»: الأرصدة كلها في مكان واحد، وآخر المبيعات — والتفاصيل في الصفحات الفرعية */
export function FinanceOverview() {
  const e = useEarnings();
  const verified = useIsVerified(useCurrentUser()?.id);
  const sales = getSales();
  const refunds = sales.filter((s) => s.status === 'refunded');
  const tiles = [
    ['إجمالي أرباحك', e.total, 'منذ انضمامك، بعد حصّة حرف', DollarIcon, 'bg-tint-brand text-primary'],
    [
      'قيد الاسترجاع',
      e.onHold,
      `تصير متاحة بعد ${PUBLISHER_TERMS.holdDays} يوماً من البيع`,
      ClockIcon,
      'bg-tint-info text-info-text',
    ],
    ['قيد التحويل', e.processing, 'طلبات سحب قيد المعالجة', RefreshIcon, 'bg-tint-warn text-warn-text'],
    ['المحوَّل إليك', e.paid, 'مجموع التحويلات المكتملة', CheckIcon, 'bg-tint-ok text-ok-text'],
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <section
        aria-labelledby="bal-t"
        className="flex animate-fade-up flex-col gap-6 rounded-xl border moment p-6 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p id="bal-t" className="text-control text-muted-foreground">
            الرصيد المتاح للسحب
          </p>
          <p dir="ltr" className="mt-2 text-right text-5xl font-semibold tracking-tight tabular-nums">
            {formatMoney(cents(e.available))}
          </p>
          <p className="mt-2 text-meta text-muted-foreground">
            التحويل التلقائي القادم <strong className="text-foreground">{formatDateAr(e.nextPayout)}</strong>
          </p>
        </div>
        {/* قبل التوثيق: «ابدأ التوثيق» أعلى الصفحة هو الفعل الرئيسي — السحب ثانوي */}
        <Button asChild variant={verified ? 'primary' : 'secondary'}>
          <Link to={paths.studio.getHref('finance/payouts')}>
            <DollarIcon />
            اسحب رصيدك
          </Link>
        </Button>
      </section>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {tiles.map(([label, amount, hint, Icon, tint]) => (
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

      {refunds.length > 0 && (
        <p className="rounded-md bg-sunken px-4 py-3 text-meta text-muted-foreground">
          <strong className="font-medium text-foreground">{refunds.length} استرجاع</strong> هذا الشهر بقيمة{' '}
          <span dir="ltr">{formatMoney(cents(refunds.reduce((n, s) => n + s.grossCents, 0)))}</span> — خُصم صافيها من
          أرباحك.
        </p>
      )}

      <section aria-labelledby="recent-t" className="rounded-xl border bg-card p-4 sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <h2 id="recent-t" className="font-semibold">
            آخر المبيعات
          </h2>
          <Link
            to={paths.studio.getHref('finance/sales')}
            className="inline-flex items-center gap-1 text-meta font-medium text-primary hover:underline"
          >
            كل المبيعات
            <ChevronLeftIcon className="size-3.5" />
          </Link>
        </div>
        <Table aria-label="آخر المبيعات">
          <TableHeader>
            <TableRow>
              <TableHead>الخط</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead className="text-end">صافيك</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.slice(0, 5).map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <span className="font-medium">{s.fontName}</span>
                  <span className="block text-caption text-muted-foreground">{s.license}</span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateAr(s.date)}</TableCell>
                <TableCell
                  dir="ltr"
                  className={
                    s.status === 'refunded'
                      ? 'text-start text-tertiary tabular-nums line-through'
                      : 'text-start font-semibold tabular-nums'
                  }
                >
                  {formatMoney(cents(s.netCents))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
