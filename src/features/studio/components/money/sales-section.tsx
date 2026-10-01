import { useState } from 'react';
import { Link } from 'react-router';

import { SectionCard } from '@/components/shared/section-card';
import { StatCard } from '@/components/shared/stat-card';
import { Badge } from '@/components/ui/badge';
import { CartIcon, CheckIcon, ClockIcon, DollarIcon, RefreshIcon } from '@/components/ui/icons';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { paths } from '@/config/paths';
import { formatDateAr, formatMoney } from '@/lib/format';
import { cents } from '@/types/domain/commerce';

import { getSales, type Sale } from '../../api/earnings';
import { PUBLISHER_TERMS } from '../../config/publisher-terms';

const STATUS: Record<Sale['status'], { label: string; tone: 'success' | 'info' | 'danger'; Icon: typeof CheckIcon }> = {
  completed: { label: 'مكتملة', tone: 'success', Icon: CheckIcon },
  pending: { label: 'قيد الاسترجاع', tone: 'info', Icon: ClockIcon },
  refunded: { label: 'مستردّة', tone: 'danger', Icon: RefreshIcon },
};

type Filter = 'all' | Sale['status'];

/** «المبيعات»: كل عملية بيع لخطوطك — السعر، حصّة حرف، وصافيك. المشتري مقنّع (تقليل البيانات). */
export function SalesSection() {
  const sales = getSales();
  const [filter, setFilter] = useState<Filter>('all');
  const rows = sales.filter((s) => filter === 'all' || s.status === filter);
  const month = sales.filter((s) => s.date.startsWith('2026-09') && s.status !== 'refunded');
  const gross = month.reduce((n, s) => n + s.grossCents, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard tone="brand" label="مبيعات هذا الشهر" value={formatMoney(cents(gross))} icon={<CartIcon />} />
        <StatCard label="عدد العمليات" value={month.length} hint="دون المستردّة" />
        <StatCard
          tone="ok"
          label="متوسّط العملية"
          value={formatMoney(cents(month.length ? Math.round(gross / month.length) : 0))}
          hint="صافيك لكل عملية في الجدول"
          icon={<DollarIcon />}
        />
      </div>

      <SectionCard
        title="سجلّ المبيعات"
        description={`تبقى أرباح البيع «قيد الاسترجاع» ${PUBLISHER_TERMS.holdDays} يوماً، ثم تُضاف إلى رصيدك.`}
        bodyClassName="flex flex-col gap-4 p-4 sm:p-6"
      >
        <SegmentedControl
          label="حالة العملية"
          value={filter}
          onChange={setFilter}
          className="w-fit max-w-full overflow-x-auto"
          options={[
            { value: 'all', label: 'الكل' },
            { value: 'completed', label: 'مكتملة' },
            { value: 'pending', label: 'قيد الاسترجاع' },
            { value: 'refunded', label: 'مستردّة' },
          ]}
        />
        {rows.length ? (
          <Table aria-label="سجلّ المبيعات">
            <TableHeader>
              <TableRow>
                <TableHead>الخط والترخيص</TableHead>
                <TableHead>المشتري</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-end">السعر</TableHead>
                <TableHead className="text-end">صافيك</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => {
                const st = STATUS[s.status];
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Link
                        to={paths.font.getHref(s.fontId)}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {s.fontName}
                      </Link>
                      <span className="block text-caption text-muted-foreground">
                        {s.license} ·{' '}
                        <span dir="ltr" className="tabular-nums">
                          {s.id}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <bdi>{s.buyer}</bdi>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateAr(s.date)}</TableCell>
                    <TableCell>
                      <Badge tone={st.tone} icon={<st.Icon />}>
                        {st.label}
                      </Badge>
                    </TableCell>
                    <TableCell dir="ltr" className="text-start text-muted-foreground tabular-nums">
                      {formatMoney(cents(s.grossCents))}
                    </TableCell>
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
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="rounded-md bg-sunken px-4 py-8 text-center text-meta text-muted-foreground">
            لا عمليات بهذه الحالة.
          </p>
        )}
      </SectionCard>
    </div>
  );
}
