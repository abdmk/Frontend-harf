import { type ReactNode, useState } from 'react';

import { UsageMeter } from '@/components/shared/usage-meter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  CalendarIcon,
  CheckIcon,
  CreditCardIcon,
  CrossIcon,
  CrownIcon,
  DownloadIcon,
  LockIcon,
  MagicWandIcon,
  ReceiptIcon,
} from '@/components/ui/icons';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import type { Invoice, PlanOffer, Subscription } from '@/types/domain/subscription';
import type { User } from '@/types/domain/user';
import { formatDateAr, formatMoney } from '@/utils/format';

const STATUS: Record<Invoice['status'], ['success' | 'danger' | 'neutral', string]> = {
  paid: ['success', 'مدفوعة'],
  failed: ['danger', 'فشلت'],
  refunded: ['neutral', 'مُستردّة'],
};

function Card({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex animate-fade-up flex-col gap-4 rounded-xl border bg-card p-6">
      <header className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold [&_svg]:size-4.5 [&_svg]:text-muted-foreground">
          {icon}
          {title}
        </h2>
        {action}
      </header>
      {children}
    </section>
  );
}

/**
 * تغيير البطاقة: لا تمرّ أرقام البطاقة بموقع حرف أبداً — التحديث في صفحة Stripe الآمنة.
 * ⚠️ عرض: في المنتج يطلب الزرّ من الخادم جلسة Stripe Customer Portal وينقل المستخدم إليها.
 */
function ChangeCardDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          تغيير
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-dialog-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-tint-info text-info-text [&_svg]:size-6">
            <LockIcon />
          </span>
          <div>
            <DialogTitle className="text-lg font-bold">تغيير البطاقة</DialogTitle>
            <DialogDescription className="mt-2 text-control leading-relaxed text-muted-foreground">
              ننقلك إلى صفحة Stripe الآمنة لتضيف بطاقة جديدة. لا تمرّ أرقام بطاقتك بموقع حرف، والاشتراك يستمرّ دون
              انقطاع.
            </DialogDescription>
          </div>
          <div className="flex w-full flex-col gap-2.5">
            <Button
              size="lg"
              onClick={() => {
                setOpen(false);
                toast({
                  tone: 'info',
                  title: 'نسخة تجريبية',
                  description: 'في المنتج تُفتح صفحة Stripe لتحديث البطاقة.',
                });
              }}
            >
              متابعة إلى Stripe
            </Button>
            <Button size="lg" variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * «الاشتراك» (دليل التصميم 6.3): الخطة الحالية، الاستخدام، طريقة الدفع، والفواتير.
 * «تغيير الخطة» يأتي من طبقة التطبيق (نافذة الخطط).
 */
export function SubscriptionSection({
  user,
  plan,
  subscription,
  invoices,
  changePlan,
}: {
  user: User;
  plan: PlanOffer;
  subscription: Subscription;
  invoices: Invoice[];
  changePlan: ReactNode;
}) {
  const paid = plan.monthly.cents > 0;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-2">
      <Card title="خطتك الحالية" icon={<CrownIcon />} action={<Badge tone="success">نشطة</Badge>}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold">{plan.name}</p>
            <p className="text-meta text-muted-foreground">
              {paid ? (
                <>
                  <span dir="ltr">{formatMoney(plan.monthly)}</span> / شهرياً · فوترة{' '}
                  {subscription.cycle === 'monthly' ? 'شهرية' : 'سنوية'}
                </>
              ) : (
                'مجانية دائماً — بلا بطاقة'
              )}
            </p>
          </div>
          {changePlan}
        </div>
        {subscription.renewsAt && (
          <p className="flex items-center gap-2 rounded-md bg-sunken px-4 py-3 text-control">
            <CalendarIcon className="size-4 text-muted-foreground" />
            يتجدّد تلقائياً في <span className="font-medium">{formatDateAr(subscription.renewsAt)}</span>
          </p>
        )}
        {paid && (
          <p className="text-caption text-tertiary">
            لإلغاء الاشتراك غيّر خطتك إلى المجانية — تبقى المزايا حتى نهاية الدورة.
          </p>
        )}
      </Card>

      <Card title="الاستخدام هذه الدورة" icon={<ReceiptIcon />}>
        <UsageMeter label="تحميل الخطوط" icon={<DownloadIcon />} meter={user.usage.downloads} />
        <UsageMeter label="عين" icon={<MagicWandIcon />} meter={user.usage.matching} />
        <p className="text-caption text-tertiary">الحدود أمثلة تجريبية.</p>
      </Card>

      <Card title="ما تشمله خطتك" icon={<CheckIcon />}>
        <ul className="flex flex-col gap-2.5">
          {plan.features.map((f) => (
            <li
              key={f.label}
              className={
                f.included ? 'flex items-center gap-2 text-meta' : 'flex items-center gap-2 text-meta text-tertiary'
              }
            >
              {f.included ? <CheckIcon className="size-3.5 text-ok-text" /> : <CrossIcon className="size-3" />}
              {f.label}
            </li>
          ))}
        </ul>
      </Card>

      <Card
        title="طريقة الدفع"
        icon={<CreditCardIcon />}
        action={subscription.paymentMethod ? <ChangeCardDialog /> : undefined}
      >
        {subscription.paymentMethod ? (
          <div className="flex items-center gap-4 rounded-md border p-4">
            <span className="rounded-[4px] border px-1.5 text-micro font-bold font-medium text-visa uppercase">
              {subscription.paymentMethod.brand}
            </span>
            <div className="flex-1">
              <p dir="ltr" className="text-right text-control tabular-nums">
                •••• {subscription.paymentMethod.last4}
              </p>
              <p className="text-caption text-muted-foreground">تنتهي {subscription.paymentMethod.expires}</p>
            </div>
          </div>
        ) : (
          <p className="text-meta text-muted-foreground">لا توجد بطاقة محفوظة.</p>
        )}
        <p className="flex items-center gap-1.5 text-caption text-tertiary">
          <LockIcon className="size-3.5" />
          تُحفظ البطاقة لدى Stripe، لا لدى حرف.
        </p>
      </Card>

      <section className="animate-fade-up rounded-xl border bg-card p-2 sm:p-4 xl:col-span-2">
        <h2 className="flex items-center gap-2 px-3 pt-3 pb-2 text-base font-semibold">
          <ReceiptIcon className="size-4.5 text-muted-foreground" />
          الفواتير
        </h2>
        {invoices.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead className="text-end">المبلغ</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => {
                const [tone, label] = STATUS[inv.status];
                return (
                  <TableRow key={inv.id}>
                    <TableCell>{formatDateAr(inv.date)}</TableCell>
                    <TableCell className="text-muted-foreground">{inv.description}</TableCell>
                    <TableCell dir="ltr" className="text-start font-medium">
                      {formatMoney(inv.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge tone={tone}>{label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="px-3 pb-4 text-meta text-muted-foreground">لا فواتير — أنت على الخطة المجانية.</p>
        )}
      </section>
    </div>
  );
}
