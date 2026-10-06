import { useActionState, useEffect, useRef, useState } from 'react';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Chip, ChipGroup } from '@/components/ui/chip-group';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { PlusIcon, TrashIcon } from '@/components/ui/icons';
import { Input, Textarea } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import { formatMoney } from '@/utils/format';

import {
  createRevenue,
  localToday as today,
  type ManualRevenue,
  REVENUE_CATEGORIES,
  REVENUE_CATEGORY_LABEL,
  type RevenueCategory,
  type RevenueFormState,
} from '../api/manual-revenue';

const dateLabel = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString('ar', { day: 'numeric', month: 'long', year: 'numeric' });

/** نافذة «أضف إيراداً»: النوع، المبلغ، العميل، التاريخ، ملاحظة — تحقّق كامل قبل الحفظ */
export function AddRevenueDialog({
  onAdd,
  variant = 'default',
}: {
  onAdd: (e: ManualRevenue) => void;
  variant?: 'default' | 'outline';
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<RevenueCategory>('font-design');
  const [state, formAction, pending] = useActionState<RevenueFormState, FormData>(createRevenue, null);
  const handled = useRef<RevenueFormState>(null);
  const f = state?.fields ?? {};

  // حالة جديدة ناجحة ← أضفها مرّة واحدة وأغلق
  useEffect(() => {
    if (!state?.ok || !state.entry || handled.current === state) return;
    handled.current = state;
    onAdd(state.entry);
    toast({
      tone: 'success',
      title: 'أُضيف الإيراد',
      description: `${REVENUE_CATEGORY_LABEL[state.entry.category]} · ${formatMoney(state.entry.amount)}`,
    });
    const t = window.setTimeout(() => setOpen(false));
    return () => window.clearTimeout(t);
  }, [state, onAdd]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={variant}>
          <PlusIcon />
          أضف إيراداً
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-dialog-md">
        <div>
          <DialogTitle className="text-lg font-semibold">أضف إيراداً</DialogTitle>
          <DialogDescription className="mt-1 text-meta text-muted-foreground">
            دخل من خارج المتجر — تصميم أو تطوير خط لعميل، مخطوطة، استشارة…
          </DialogDescription>
        </div>
        <form key={JSON.stringify(state?.values ?? {})} action={formAction} noValidate className="flex flex-col gap-5">
          <input type="hidden" name="category" value={category} />
          <Field>
            <FieldLabel id="rev-cat-label" required>
              النوع
            </FieldLabel>
            <ChipGroup
              type="single"
              aria-labelledby="rev-cat-label"
              value={category}
              onValueChange={(v) => v && setCategory(v as RevenueCategory)}
            >
              {REVENUE_CATEGORIES.map((c) => (
                <Chip key={c} value={c}>
                  {REVENUE_CATEGORY_LABEL[c]}
                </Chip>
              ))}
            </ChipGroup>
            <FieldError>{f.category}</FieldError>
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="rev-amount" required>
                المبلغ (دولار)
              </FieldLabel>
              <Input
                id="rev-amount"
                name="amount"
                inputMode="decimal"
                dir="ltr"
                placeholder="250"
                defaultValue={state?.values?.amount}
                maxLength={10}
                aria-invalid={!!f.amount}
                aria-describedby="rev-amount-err"
              />
              <FieldError id="rev-amount-err">{f.amount}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="rev-date" required>
                التاريخ
              </FieldLabel>
              <Input
                id="rev-date"
                name="date"
                type="date"
                defaultValue={state?.values?.date ?? today()}
                max={today()}
                aria-invalid={!!f.date}
                aria-describedby="rev-date-err"
              />
              <FieldError id="rev-date-err">{f.date}</FieldError>
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="rev-client" required>
              العميل أو الجهة
            </FieldLabel>
            <Input
              id="rev-client"
              name="client"
              maxLength={80}
              placeholder="مثل: شركة ما"
              defaultValue={state?.values?.client}
              aria-invalid={!!f.client}
              aria-describedby="rev-client-err"
            />
            <FieldError id="rev-client-err">{f.client}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="rev-note">ملاحظة</FieldLabel>
            <Textarea
              id="rev-note"
              name="note"
              maxLength={200}
              className="min-h-20"
              placeholder="اختياري — تفاصيل المشروع"
              defaultValue={state?.values?.note}
              aria-invalid={!!f.note}
              aria-describedby="rev-note-err"
            />
            <FieldError id="rev-note-err">{f.note}</FieldError>
          </Field>
          {state?.message && !state.ok && <FieldError>{state.message}</FieldError>}
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Button type="submit" loading={pending}>
              حفظ الإيراد
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * «إيرادات أخرى»: ما يُكسب خارج المتجر، يسجّله المشرف يدوياً. توزيع حسب النوع فوق جدول القيود،
 * والحذف يُتراجع عنه من الإشعار.
 */
export function ManualRevenueSection({
  items,
  onAdd,
  onRemove,
  onRestore,
}: {
  items: ManualRevenue[];
  onAdd: (e: ManualRevenue) => void;
  onRemove: (id: string) => void;
  onRestore: (e: ManualRevenue) => void;
}) {
  const total = items.reduce((n, e) => n + e.amount.cents, 0);
  const byCat = REVENUE_CATEGORIES.map((c) => ({
    c,
    cents: items.filter((e) => e.category === c).reduce((n, e) => n + e.amount.cents, 0),
  })).filter((x) => x.cents > 0);

  const [removing, setRemoving] = useState<ManualRevenue | null>(null);
  const remove = (e: ManualRevenue) => {
    setRemoving(null);
    onRemove(e.id);
    toast({ title: 'حُذف الإيراد', description: e.client, action: { label: 'تراجع', onClick: () => onRestore(e) } });
  };

  return (
    <section aria-labelledby="manual-rev" className="flex flex-col gap-5 rounded-xl border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="manual-rev" className="text-lead font-semibold">
            إيرادات أخرى
          </h2>
          <p className="mt-1 text-meta text-muted-foreground">
            خدمات خارج المتجر تُسجَّل يدوياً · المجموع{' '}
            <strong dir="ltr" className="font-semibold text-foreground">
              {formatMoney({ cents: total, currency: 'USD' })}
            </strong>
          </p>
        </div>
        <AddRevenueDialog onAdd={onAdd} />
      </div>

      {byCat.length > 0 && (
        <ul aria-label="حسب النوع" className="flex flex-wrap gap-2">
          {byCat.map(({ c, cents }) => (
            <li key={c} className="inline-flex items-center gap-2 rounded-full bg-sunken px-3 py-1.5 text-meta">
              {REVENUE_CATEGORY_LABEL[c]}
              <strong dir="ltr" className="font-semibold">
                {formatMoney({ cents, currency: 'USD' })}
              </strong>
            </li>
          ))}
        </ul>
      )}

      {items.length ? (
        <Table aria-label="قيود الإيرادات الأخرى">
          <TableHeader>
            <TableRow>
              <TableHead>النوع</TableHead>
              <TableHead>العميل</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead className="text-end">المبلغ</TableHead>
              <TableHead className="w-10">
                <span className="sr-only">حذف</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((e) => (
              <TableRow key={e.id}>
                <TableCell>
                  <Badge tone="neutral">{REVENUE_CATEGORY_LABEL[e.category]}</Badge>
                </TableCell>
                <TableCell>
                  <p className="font-medium">{e.client}</p>
                  {e.note && <p className="mt-0.5 line-clamp-1 text-caption text-muted-foreground">{e.note}</p>}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{dateLabel(e.date)}</TableCell>
                <TableCell dir="ltr" className="text-start font-medium">
                  {formatMoney(e.amount)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`حذف إيراد ${e.client}`}
                    onClick={() => setRemoving(e)}
                  >
                    <TrashIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="rounded-md bg-sunken px-4 py-6 text-center text-meta text-muted-foreground">
          لا إيرادات يدوية بعد — أضف أول مشروع: تصميم خط، تطوير خط، أو تصميم مخطوطة.
        </p>
      )}
      <ConfirmDialog
        open={!!removing}
        onOpenChange={(o) => !o && setRemoving(null)}
        title="حذف هذا الإيراد؟"
        description={
          removing ? `«${removing.client}» بمبلغ ${formatMoney(removing.amount)} — يُستبعد من مجاميع التحليلات.` : ''
        }
        confirmLabel="حذف الإيراد"
        icon={<TrashIcon />}
        onConfirm={() => removing && remove(removing)}
      />
    </section>
  );
}
