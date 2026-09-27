import { Link } from 'react-router';

import { DownloadButton } from '@/components/shared/download-button';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { ReceiptIcon } from '@/components/ui/icons';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { paths } from '@/config/paths';
import { formatDateAr, formatMoney } from '@/lib/format';
import type { Purchase } from '@/types/domain/commerce';

import { SectionCard } from './section-card';

/** المشتريات: رقم الترخيص، الخط، الحزمة، التاريخ، المبلغ، والتحميل مجدداً */
export function PurchasesSection({ purchases }: { purchases: Purchase[] }) {
  if (!purchases.length)
    return (
      <EmptyState
        icon={<ReceiptIcon />}
        title="لا مشتريات بعد"
        description="تراخيص الخطوط التي تشتريها تظهر هنا مع ملفاتها وإيصالاتها."
        action={
          <Button asChild>
            <Link to="/?license=paid">تصفّح الخطوط المدفوعة</Link>
          </Button>
        }
      />
    );
  return (
    <SectionCard bodyClassName="p-2 sm:p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الترخيص</TableHead>
            <TableHead>الخط</TableHead>
            <TableHead>التاريخ</TableHead>
            <TableHead className="text-end">المبلغ</TableHead>
            <TableHead>
              <span className="sr-only">إجراءات</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((p) => (
            <TableRow key={p.licenseId}>
              <TableCell dir="ltr" className="text-right font-mono text-meta">
                {p.licenseId}
              </TableCell>
              <TableCell>
                <Link to={paths.font.getHref(p.fontId)} dir="ltr" className="font-medium hover:underline">
                  {p.fontName}
                </Link>
                <span className="block text-caption text-muted-foreground">{p.summary}</span>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDateAr(p.date)}</TableCell>
              <TableCell dir="ltr" className="text-start font-medium">
                {formatMoney(p.amount)}
              </TableCell>
              <TableCell>
                <DownloadButton fontName={p.fontName} label="تحميل" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SectionCard>
  );
}
