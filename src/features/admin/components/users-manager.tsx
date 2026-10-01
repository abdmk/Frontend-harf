import { useDeferredValue, useId, useState } from 'react';

import { Avatar } from '@/components/shared/avatar';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { StatCard } from '@/components/shared/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldError, FieldHint, FieldLabel } from '@/components/ui/field';
import {
  BanIcon,
  CheckIcon,
  CrownIcon,
  GiftIcon,
  GlobeIcon,
  MenuDotsIcon,
  RefreshIcon,
  SearchIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserIcon,
} from '@/components/ui/icons';
import { Input, InputGroup, Textarea } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';
import { formatDateAr } from '@/lib/format';
import { PLANS, type Plan } from '@/types/domain/user';

import { AdminPageHeader } from './admin-nav';
import {
  type AccountStatus,
  type AdminAccount,
  ban,
  BAN_REASON_MIN,
  PLAN_NAME,
  removeAccount,
  restoreAccount,
  setPlan,
  unban,
  useAccounts,
} from '../api/users';
import { fmt } from '../utils';

const PLAN_TONE: Record<Plan, 'neutral' | 'studio' | 'info'> = { free: 'neutral', basic: 'studio', studio: 'info' };
const PLAN_HINT: Record<Plan, string> = {
  free: 'تحميل الخطوط المجانية بحدود يومية.',
  basic: 'تحميل غير محدود ومطابقة غير محدودة.',
  studio: 'كل ما سبق مع نشر الخطوط وبيعها.',
};

function PlanDialog({ u, onClose }: { u: AdminAccount; onClose: () => void }) {
  const [plan, setP] = useState<Plan>(u.plan);
  const [error, setError] = useState<string>();
  const upgrade = PLANS.indexOf(plan) > PLANS.indexOf(u.basePlan);
  function save() {
    const r = setPlan(u.id, plan);
    if (!r.ok) return setError(r.error);
    toast({ tone: 'success', title: `خطة ${u.name}: ${PLAN_NAME[plan]}`, description: 'تُطبَّق على الحساب فوراً.' });
    onClose();
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-dialog-md">
        <div>
          <DialogTitle>خطة {u.name}</DialogTitle>
          <DialogDescription className="mt-1 text-meta text-muted-foreground">
            امنح خطة أو غيّرها دون دفع — تُطبَّق فوراً وتُسجَّل في سجلّ النشاط.
          </DialogDescription>
        </div>
        <div role="radiogroup" aria-label="الخطة" className="flex flex-col gap-2">
          {PLANS.map((p) => {
            const on = plan === p;
            return (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setP(p)}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-3.5 text-start transition-[border-color,background-color,box-shadow] hover:border-strong',
                  on && 'border-primary bg-tint-brand/50 shadow-[0_0_0_1px_var(--color-primary)]',
                )}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sunken text-muted-foreground">
                  <CrownIcon filled={on} className="size-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-control font-semibold">
                    {PLAN_NAME[p]}
                    {p === u.basePlan && <Badge>خطّته الأصلية</Badge>}
                  </span>
                  <span className="block text-caption text-muted-foreground">{PLAN_HINT[p]}</span>
                </span>
                <span
                  aria-hidden
                  className={cn(
                    'grid size-5 shrink-0 place-items-center rounded-full border-[1.5px] border-strong',
                    on && 'border-transparent bg-primary-fill',
                  )}
                >
                  {on && <CheckIcon className="size-3 text-white" />}
                </span>
              </button>
            );
          })}
        </div>
        <FieldError>{error}</FieldError>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            إلغاء
          </Button>
          <Button disabled={plan === u.plan} onClick={save}>
            {upgrade ? <GiftIcon /> : null}
            {upgrade ? `امنح ${PLAN_NAME[plan]}` : 'حفظ الخطة'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BanDialog({ u, onClose }: { u: AdminAccount; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string>();
  const id = useId();
  function save() {
    const r = ban(u.id, reason);
    if (!r.ok) return setError(r.error);
    toast({ tone: 'info', title: `حُظر ${u.name}`, description: 'لا يستطيع الدخول حتى يُفكّ الحظر.' });
    onClose();
  }
  return (
    <ConfirmDialog
      open
      onOpenChange={(o) => !o && onClose()}
      title={`حظر ${u.name}؟`}
      description="تُنهى جلسته ولا يستطيع الدخول. مشترياته وتراخيصه تبقى محفوظة، ويمكن فكّ الحظر في أي وقت."
      confirmLabel="حظر الحساب"
      icon={<BanIcon />}
      disabled={reason.trim().length < BAN_REASON_MIN}
      onConfirm={save}
    >
      <Field>
        <FieldLabel htmlFor={`${id}-r`} required>
          السبب
        </FieldLabel>
        <Textarea
          id={`${id}-r`}
          value={reason}
          maxLength={300}
          onChange={(e) => {
            setReason(e.target.value);
            setError(undefined);
          }}
          placeholder="مثل: إعادة توزيع خطوط مدفوعة"
          className="min-h-20"
        />
        <FieldHint>يُحفظ في سجلّ النشاط للمشرفين فقط.</FieldHint>
        <FieldError>{error}</FieldError>
      </Field>
    </ConfirmDialog>
  );
}

function DeleteDialog({ u, onClose }: { u: AdminAccount; onClose: () => void }) {
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string>();
  const id = useId();
  function save() {
    const r = removeAccount(u.id, confirm);
    if (!r.ok) return setError(r.error);
    toast({ tone: 'info', title: `حُذف حساب ${u.name}`, description: 'يمكن استرجاعه من «المحذوفة».' });
    onClose();
  }
  return (
    <ConfirmDialog
      open
      onOpenChange={(o) => !o && onClose()}
      title={`حذف حساب ${u.name}؟`}
      description="يُغلق الحساب ويختفي من الموقع. يمكن استرجاعه لاحقاً قبل الحذف النهائي من الخادم."
      confirmLabel="حذف الحساب"
      icon={<TrashIcon />}
      disabled={confirm.trim().toLowerCase() !== u.email.toLowerCase()}
      onConfirm={save}
    >
      <Field>
        <FieldLabel htmlFor={`${id}-c`}>
          اكتب{' '}
          <bdi dir="ltr" className="font-semibold text-foreground">
            {u.email}
          </bdi>{' '}
          للتأكيد
        </FieldLabel>
        <Input
          id={`${id}-c`}
          dir="ltr"
          value={confirm}
          autoComplete="off"
          onChange={(e) => {
            setConfirm(e.target.value);
            setError(undefined);
          }}
        />
        <FieldError>{error}</FieldError>
      </Field>
    </ConfirmDialog>
  );
}

type Dlg = { kind: 'plan' | 'ban' | 'delete'; u: AdminAccount } | null;

function RowActions({ u, open }: { u: AdminAccount; open: (d: Dlg) => void }) {
  if (u.admin)
    return (
      <Badge tone="brand" icon={<ShieldCheckIcon />}>
        مشرف
      </Badge>
    );
  const done = (r: { ok: boolean }, title: string) => r.ok && toast({ tone: 'success', title });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`إجراءات ${u.name}`}>
          <MenuDotsIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {u.status === 'deleted' ? (
          <DropdownMenuItem onSelect={() => done(restoreAccount(u.id), `استُرجع حساب ${u.name}`)}>
            <RefreshIcon />
            استرجاع
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem onSelect={() => open({ kind: 'plan', u })}>
              <CrownIcon />
              تغيير الخطة
            </DropdownMenuItem>
            {u.status === 'banned' ? (
              <DropdownMenuItem onSelect={() => done(unban(u.id), `فُكّ حظر ${u.name}`)}>
                <CheckIcon />
                فكّ الحظر
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onSelect={() => open({ kind: 'ban', u })}>
                <BanIcon />
                حظر
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => open({ kind: 'delete', u })}>
              <TrashIcon />
              حذف
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const STATUS_LABEL: Record<AccountStatus, string> = { active: 'نشط', banned: 'محظور', deleted: 'محذوف' };

/** «المستخدمون»: أرقام الحسابات، ثم الجدول بالبحث والتصفية، وإجراءات كل حساب في قائمته */
export function UsersManager({ visits }: { visits: number }) {
  const all = useAccounts();
  const [q, setQ] = useState('');
  const query = useDeferredValue(q.trim().toLowerCase());
  const [status, setStatus] = useState<'all' | AccountStatus>('all');
  const [plan, setPlanFilter] = useState<'all' | Plan>('all');
  const [dlg, setDlg] = useState<Dlg>(null);

  const count = (s: AccountStatus) => all.filter((u) => u.status === s).length;
  const live = all.filter((u) => u.status !== 'deleted');
  const subscribers = live.filter((u) => u.plan !== 'free').length;
  const rows = all
    .filter((u) => (status === 'all' ? u.status !== 'deleted' : u.status === status))
    .filter((u) => plan === 'all' || u.plan === plan)
    .filter((u) => !query || u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query));

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader title="المستخدمون" description="الحسابات، خططها، والحظر والحذف — كل إجراء يُسجَّل." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          tone="info"
          label="المسجّلون"
          value={fmt(live.length)}
          icon={<UserIcon />}
          hint="الحسابات النشطة والمحظورة"
        />
        <StatCard
          tone="warn"
          label="المشتركون"
          value={fmt(subscribers)}
          icon={<CrownIcon />}
          hint={`${((subscribers / Math.max(1, live.length)) * 100).toFixed(0)}% من المسجّلين`}
        />
        <StatCard tone="ok" label="الزيارات" value={fmt(visits)} icon={<GlobeIcon />} hint="آخر 30 يوماً" />
        <StatCard
          tone="danger"
          label="المحظورون"
          value={fmt(count('banned'))}
          icon={<BanIcon />}
          hint="لا يستطيعون الدخول"
        />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div
          role="group"
          aria-label="الحالة"
          className="flex [scrollbar-width:none] gap-1 overflow-x-auto border-b px-3 sm:px-5"
        >
          {(
            [
              ['all', 'الكل', live.length],
              ['active', 'نشط', count('active')],
              ['banned', 'محظور', count('banned')],
              ['deleted', 'المحذوفة', count('deleted')],
            ] as const
          ).map(([v, label, n]) => (
            <button
              key={v}
              type="button"
              aria-pressed={status === v}
              onClick={() => setStatus(v)}
              className="relative flex h-13 shrink-0 items-center gap-2 px-3 text-control text-muted-foreground transition-colors hover:text-foreground aria-pressed:font-semibold aria-pressed:text-foreground aria-pressed:after:absolute aria-pressed:after:inset-x-2 aria-pressed:after:bottom-0 aria-pressed:after:h-0.5 aria-pressed:after:rounded-full aria-pressed:after:bg-primary-fill"
            >
              {label}
              <span dir="ltr" className="rounded-full bg-sunken px-2 py-0.5 text-caption font-medium tabular-nums">
                {n}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 border-b bg-sunken/40 p-3 sm:px-5 sm:py-4">
          <InputGroup
            start={<SearchIcon />}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث باسم أو بريد"
            aria-label="بحث في المستخدمين"
            maxLength={80}
            className="min-w-0 flex-1 basis-60 bg-card"
          />
          <Select value={plan} onValueChange={(v) => setPlanFilter(v as typeof plan)}>
            <SelectTrigger aria-label="الخطة" className="w-40 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الخطط</SelectItem>
              {PLANS.map((p) => (
                <SelectItem key={p} value={p}>
                  {PLAN_NAME[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {rows.length ? (
          <Table aria-label="المستخدمون" className="min-w-190">
            <TableHeader>
              <TableRow>
                <TableHead>الحساب</TableHead>
                <TableHead>الخطة</TableHead>
                <TableHead>انضمّ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>
                  <span className="sr-only">إجراءات</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id} className={u.status === 'deleted' ? 'opacity-60' : undefined}>
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar initials={u.name.slice(0, 2).toUpperCase()} seed={u.id} size="md" />
                      <div className="min-w-0">
                        <p className="font-semibold">{u.name}</p>
                        <p dir="ltr" className="text-end text-caption text-muted-foreground">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={PLAN_TONE[u.plan]} icon={u.plan === 'free' ? undefined : <CrownIcon />}>
                        {PLAN_NAME[u.plan]}
                      </Badge>
                      {u.plan !== u.basePlan && (
                        <Badge tone="ai" icon={<GiftIcon />}>
                          من الإدارة
                        </Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-meta text-muted-foreground">{formatDateAr(u.joined)}</TableCell>
                  <TableCell>
                    <Badge
                      tone={u.status === 'active' ? 'success' : 'danger'}
                      title={u.banReason}
                      icon={u.status === 'active' ? <CheckIcon /> : u.status === 'banned' ? <BanIcon /> : <TrashIcon />}
                    >
                      {STATUS_LABEL[u.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-24 text-end">
                    <RowActions u={u} open={setDlg} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            className="rounded-none border-0"
            icon={<UserIcon />}
            title="لا حسابات تطابق"
            description="جرّب اسماً أو بريداً آخر، أو غيّر التصفية."
          />
        )}
      </div>

      {dlg?.kind === 'plan' && <PlanDialog u={dlg.u} onClose={() => setDlg(null)} />}
      {dlg?.kind === 'ban' && <BanDialog u={dlg.u} onClose={() => setDlg(null)} />}
      {dlg?.kind === 'delete' && <DeleteDialog u={dlg.u} onClose={() => setDlg(null)} />}
    </div>
  );
}
