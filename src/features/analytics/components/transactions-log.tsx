'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatMoney } from '@/lib/format';
import type { AdminAnalytics } from '@/types/domain/analytics';

/** سجلّ العمليات: مبيعات واشتراكات — كلٌّ بشارته، وفلتر فوق الجدول */
export function TransactionsLog({ items }: { items: AdminAnalytics['transactions'] }) {
  const [kind, setKind] = useState<'all' | 'sale' | 'subscription'>('all');
  const rows = items.filter((t) => kind === 'all' || t.kind === kind);
  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl
        label="نوع العملية"
        value={kind}
        onChange={setKind}
        options={[
          { value: 'all', label: 'الكل' },
          { value: 'sale', label: 'مبيعات' },
          { value: 'subscription', label: 'اشتراكات' },
        ]}
        className="w-fit"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>العملية</TableHead>
            <TableHead>المشتري</TableHead>
            <TableHead>النوع</TableHead>
            <TableHead>متى</TableHead>
            <TableHead className="text-end">المبلغ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((t) => (
            <TableRow key={t.id}>
              <TableCell dir="ltr" className="text-right font-mono text-caption">
                {t.id}
              </TableCell>
              <TableCell>{t.buyer}</TableCell>
              <TableCell>
                {t.kind === 'sale' ? <Badge tone="brand">مبيعات</Badge> : <Badge tone="info">اشتراك</Badge>}
              </TableCell>
              <TableCell className="text-muted-foreground">{t.when}</TableCell>
              <TableCell dir="ltr" className="text-start font-medium">
                {formatMoney(t.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
