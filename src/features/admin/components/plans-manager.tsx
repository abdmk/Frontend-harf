import { useId, useState } from 'react';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { SectionCard } from '@/components/shared/section-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldHint, FieldLabel } from '@/components/ui/field';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  CrossSmallIcon,
  CrownIcon,
  DiamondIcon,
  InfoIcon,
  PlusIcon,
  RefreshIcon,
  TrashIcon,
  UserIcon,
} from '@/components/ui/icons';
import { Input, InputGroup } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/format';
import {
  defaultPlan,
  MAX_PRICE_CENTS,
  PLAN_LIMITS,
  type PlanEdit,
  planEditSchema,
  toEdit,
  usePlanOffers,
} from '@/lib/plan-offers';
import { cents } from '@/types/domain/commerce';
import type { Plan } from '@/types/domain/user';

import { AdminPageHeader } from './admin-nav';
import { resetPlan, updatePlan } from '../api/plans';

const PLAN_ICON = { free: UserIcon, basic: DiamondIcon, studio: CrownIcon } as const;
/** ألوان شارة البطاقة كما في نافذة الخطط */
const BADGE_TONE: Record<Plan, string> = {
  free: 'bg-primary-fill text-primary-foreground',
  basic: 'bg-gold-500 text-gold-foreground',
  studio: 'bg-trial-600 text-paper',
};
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** نصّ السعر بالدولار ↔ سنتات: يقبل «9.99» و«10»، ويرفض ما سواها (null) */
const toDollars = (c: number) => (c % 100 === 0 ? String(c / 100) : (c / 100).toFixed(2));
function parseDollars(v: string): number | null {
  const t = v.trim().replace('٫', '.');
  if (!/^\d{1,4}(\.\d{1,2})?$/.test(t)) return null;
  const c = Math.round(Number(t) * 100);
  return c <= MAX_PRICE_CENTS ? c : null;
}

/** حقل سعر: يُكتب بالدولار، ويُرفع إلى المسودّة بالسنت فقط حين يكون صالحاً */
function PriceInput({
  id,
  value,
  onChange,
  disabled,
  invalid,
  describedBy,
}: {
  id: string;
  value: number;
  onChange: (c: number | null) => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [text, setText] = useState(() => toDollars(value));
  const [synced, setSynced] = useState(value);
  // المسودّة تغيّرت من الخارج (استعادة الافتراضي) ← نعيد كتابة النص
  if (value !== synced && parseDollars(text) !== value) {
    setSynced(value);
    setText(toDollars(value));
  }
  return (
    // الحقل كلّه من اليسار: «$» ملاصق للرقم كما يُقرأ السعر
    <div dir="ltr">
      <InputGroup
        id={id}
        inputMode="decimal"
        autoComplete="off"
        start={<span className="text-control">$</span>}
        value={text}
        disabled={disabled}
        aria-invalid={invalid || parseDollars(text) === null || undefined}
        aria-describedby={describedBy}
        onChange={(e) => {
          setText(e.target.value);
          const c = parseDollars(e.target.value);
          if (c !== null) setSynced(c);
          onChange(c);
        }}
      />
    </div>
  );
}

/** معاينة البطاقة كما تظهر في «اختر خطتك» — تتحدّث مع الكتابة */
function PlanPreview({ draft, cycle }: { draft: PlanEdit; cycle: 'monthly' | 'yearly' }) {
  const Icon = PLAN_ICON[draft.id];
  const free = draft.id === 'free';
  const price = cycle === 'monthly' ? draft.monthlyCents : draft.yearlyPerMonthCents;
  return (
    <div className="relative flex flex-col gap-5 rounded-xl border bg-card p-5 shadow-soft">
      {draft.badge && (
        <span
          className={cn(
            'absolute start-5 -top-3 rounded-full px-2.5 py-0.5 text-caption font-medium',
            BADGE_TONE[draft.id],
          )}
        >
          {draft.badge}
        </span>
      )}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Icon className="size-4.5" />
          {draft.name || '—'}
        </h3>
        <p className="mt-1 text-caption text-muted-foreground">{draft.tagline || '—'}</p>
      </div>
      <div className="rounded-md bg-sunken p-4">
        <p className="flex items-baseline gap-1.5">
          <span dir="ltr" className="text-4xl font-semibold tracking-tight">
            {formatMoney(cents(price))}
          </span>
          <span className="text-caption text-muted-foreground">{free ? 'دائماً' : '/ شهرياً'}</span>
        </p>
        {!free && cycle === 'yearly' && (
          <p className="mt-2 text-caption text-muted-foreground">
            يُدفع سنوياً: <span dir="ltr">{formatMoney(cents(draft.yearlyPerMonthCents * 12))}</span>
          </p>
        )}
      </div>
      <div>
        {draft.inherits && <p className="mb-3 text-caption text-tertiary">{draft.inherits}</p>}
        <ul className="flex flex-col gap-2.5">
          {draft.features.map((f, i) => (
            <li key={i} className={cn('flex items-center gap-2 text-meta', !f.included && 'text-tertiary')}>
              {f.included ? (
                <CheckIcon className="size-3.5 shrink-0 text-ok-text" />
              ) : (
                <CrossSmallIcon className="size-3.5 shrink-0" />
              )}
              {f.label || '—'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PlanEditor({ saved }: { saved: PlanEdit }) {
  const [draft, setDraft] = useState(saved);
  // سعر غير صالح قيد الكتابة: يمنع الحفظ دون أن يُفسد المسودّة
  const [badPrice, setBadPrice] = useState({ monthly: false, yearly: false });
  const [error, setError] = useState<string>();
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [confirmReset, setConfirmReset] = useState(false);
  const id = useId();
  const free = draft.id === 'free';
  const dirty = !same(draft, saved);
  const isDefault = same(saved, toEdit(defaultPlan(saved.id)));
  const check = planEditSchema.safeParse(draft);
  const discount = draft.monthlyCents > 0 ? Math.round((1 - draft.yearlyPerMonthCents / draft.monthlyCents) * 100) : 0;

  const patch = (p: Partial<PlanEdit>) => setDraft((d) => ({ ...d, ...p }));
  const patchFeature = (i: number, p: Partial<PlanEdit['features'][number]>) =>
    setDraft((d) => ({ ...d, features: d.features.map((f, k) => (k === i ? { ...f, ...p } : f)) }));
  const move = (i: number, dir: -1 | 1) =>
    setDraft((d) => {
      const features = [...d.features];
      [features[i], features[i + dir]] = [features[i + dir]!, features[i]!];
      return { ...d, features };
    });

  function save() {
    if (badPrice.monthly || badPrice.yearly) return setError('اكتب السعر بالدولار، مثل 10 أو 9.99.');
    const r = updatePlan(draft.id, draft);
    if (!r.ok) return setError(r.error);
    setError(undefined);
    toast({ tone: 'success', title: `حُفظت خطة «${draft.name}»`, description: 'تظهر للمشتركين الجدد فوراً.' });
  }

  function reset() {
    const r = resetPlan(draft.id);
    setConfirmReset(false);
    if (!r.ok) return setError(r.error);
    setError(undefined);
    toast({ tone: 'success', title: 'أُعيدت الخطة إلى الافتراضي' });
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex flex-col gap-6">
        <SectionCard
          title="التعريف"
          description="الاسم والوصف كما يظهران في نافذة الخطط"
          action={dirty ? <Badge tone="warning">تغييرات غير محفوظة</Badge> : null}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor={`${id}-n`} required>
                اسم الخطة
              </FieldLabel>
              <Input
                id={`${id}-n`}
                value={draft.name}
                maxLength={PLAN_LIMITS.name}
                onChange={(e) => patch({ name: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${id}-b`}>شارة البطاقة</FieldLabel>
              <Input
                id={`${id}-b`}
                value={draft.badge}
                maxLength={PLAN_LIMITS.badge}
                placeholder="مثل: الأكثر اختياراً"
                onChange={(e) => patch({ badge: e.target.value })}
              />
              <FieldHint>اتركها فارغة لإخفائها.</FieldHint>
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor={`${id}-t`} required>
                الوصف
              </FieldLabel>
              <Input
                id={`${id}-t`}
                value={draft.tagline}
                maxLength={PLAN_LIMITS.tagline}
                onChange={(e) => patch({ tagline: e.target.value })}
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="السعر" description={free ? 'الخطة المجانية بلا سعر دائماً' : 'بالدولار الأمريكي، لكل شهر'}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor={`${id}-m`} required={!free}>
                الدفع الشهري
              </FieldLabel>
              <PriceInput
                id={`${id}-m`}
                value={draft.monthlyCents}
                disabled={free}
                onChange={(c) => {
                  setBadPrice((b) => ({ ...b, monthly: c === null }));
                  if (c !== null) patch({ monthlyCents: c });
                }}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${id}-y`} required={!free}>
                الشهر في الدفع السنوي
              </FieldLabel>
              <PriceInput
                id={`${id}-y`}
                value={draft.yearlyPerMonthCents}
                disabled={free}
                describedBy={`${id}-yh`}
                onChange={(c) => {
                  setBadPrice((b) => ({ ...b, yearly: c === null }));
                  if (c !== null) patch({ yearlyPerMonthCents: c });
                }}
              />
              {!free && (
                <FieldHint id={`${id}-yh`}>
                  المجموع السنوي <span dir="ltr">{formatMoney(cents(draft.yearlyPerMonthCents * 12))}</span>
                  {discount > 0 && ` · خصم ${discount}٪ عن الشهري`}
                </FieldHint>
              )}
            </Field>
          </div>
          {!free && (
            <p className="mt-5 flex items-start gap-2 rounded-md bg-tint-info px-4 py-3 text-caption leading-relaxed text-info-text">
              <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
              السعر الجديد يسري على الاشتراكات الجديدة فقط؛ المشتركون الحاليون يبقون على سعرهم حتى يغيّروا خطتهم.
            </p>
          )}
        </SectionCard>

        <SectionCard
          title="ما تتضمّنه الخطة"
          description={`حتى ${PLAN_LIMITS.features} مزايا · المفعّلة تظهر بعلامة صحّ، والمعطّلة مشطوبة للمقارنة`}
        >
          <div className="flex flex-col gap-5">
            <Field>
              <FieldLabel htmlFor={`${id}-i`}>سطر ما قبل المزايا</FieldLabel>
              <Input
                id={`${id}-i`}
                value={draft.inherits}
                maxLength={PLAN_LIMITS.inherits}
                placeholder="مثل: كل ما في المجانية، وإضافةً إليها"
                onChange={(e) => patch({ inherits: e.target.value })}
              />
            </Field>
            <ol className="flex flex-col gap-2" aria-label="المزايا">
              {draft.features.map((f, i) => (
                <li key={i} className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border bg-card p-2 ps-3">
                  <Switch
                    checked={f.included}
                    onCheckedChange={(v) => patchFeature(i, { included: v })}
                    aria-label={`الميزة ${i + 1} مضمّنة`}
                  />
                  <Input
                    value={f.label}
                    maxLength={PLAN_LIMITS.feature}
                    aria-label={`نصّ الميزة ${i + 1}`}
                    onChange={(e) => patchFeature(i, { label: e.target.value })}
                    className="h-9 min-w-0 flex-1 basis-40 border-transparent bg-transparent shadow-none"
                  />
                  <div className="ms-auto flex shrink-0 items-center">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`نقل الميزة ${i + 1} للأعلى`}
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                    >
                      <ArrowUpIcon className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`نقل الميزة ${i + 1} للأسفل`}
                      disabled={i === draft.features.length - 1}
                      onClick={() => move(i, 1)}
                    >
                      <ArrowDownIcon className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`حذف الميزة ${i + 1}`}
                      disabled={draft.features.length === 1}
                      onClick={() => setDraft((d) => ({ ...d, features: d.features.filter((_, k) => k !== i) }))}
                      className="hover:text-dgr-text"
                    >
                      <TrashIcon className="size-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
            <Button
              variant="outline"
              className="self-start"
              disabled={draft.features.length >= PLAN_LIMITS.features}
              onClick={() => setDraft((d) => ({ ...d, features: [...d.features, { label: '', included: true }] }))}
            >
              <PlusIcon />
              إضافة ميزة
            </Button>
          </div>
        </SectionCard>

        <div className="flex flex-col gap-3">
          <FieldError>{error ?? (dirty && !check.success ? check.error.issues[0]?.message : undefined)}</FieldError>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {!isDefault && (
              <Button variant="ghost" onClick={() => setConfirmReset(true)}>
                <RefreshIcon />
                استعادة الافتراضي
              </Button>
            )}
            {dirty && (
              <Button variant="outline" onClick={() => (setDraft(saved), setError(undefined))}>
                تجاهل التغييرات
              </Button>
            )}
            <Button disabled={!dirty} onClick={save}>
              حفظ الخطة
            </Button>
          </div>
        </div>
      </div>

      <aside aria-label="معاينة البطاقة" className="flex flex-col gap-3 xl:sticky xl:top-24">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-meta font-medium text-muted-foreground">المعاينة</h2>
          {!free && (
            <div role="group" aria-label="دورة الدفع في المعاينة" className="flex rounded-full bg-sunken p-0.5">
              {(['monthly', 'yearly'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={cycle === c}
                  onClick={() => setCycle(c)}
                  className={cn(
                    'rounded-full px-3 py-1 text-caption transition-colors',
                    cycle === c ? 'bg-card font-medium text-foreground shadow-soft' : 'text-muted-foreground',
                  )}
                >
                  {c === 'monthly' ? 'شهري' : 'سنوي'}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="pt-3">
          <PlanPreview draft={draft} cycle={free ? 'monthly' : cycle} />
        </div>
      </aside>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title={`استعادة «${saved.name}» إلى الافتراضي؟`}
        description="يُستبدل الاسم والسعر والمزايا بالقيم الأصلية، ويظهر ذلك للزوّار فوراً."
        confirmLabel="استعادة الافتراضي"
        icon={<RefreshIcon />}
        onConfirm={reset}
      />
    </div>
  );
}

/** «الخطط والأسعار»: تعديل كل خطة — الاسم والسعر والمزايا — مع معاينة حيّة لبطاقتها */
export function PlansManager({ embedded = false }: { embedded?: boolean }) {
  const plans = usePlanOffers();
  const [tab, setTab] = useState<Plan>('basic');
  return (
    <div className="flex flex-col gap-5">
      {embedded ? (
        <p className="text-meta text-muted-foreground">ما يراه الزائر في «اختر خطتك» وصفحة الاشتراك.</p>
      ) : (
        <AdminPageHeader
          title="الخطط والأسعار"
          description="ما يراه الزائر في «اختر خطتك» وصفحة الاشتراك. كل حفظ يُسجَّل في سجلّ النشاط."
        />
      )}
      <Tabs value={tab} onValueChange={(v) => setTab(v as Plan)}>
        <TabsList aria-label="الخطط">
          {plans.map((p) => {
            const Icon = PLAN_ICON[p.id];
            return (
              <TabsTrigger key={p.id} value={p.id} className="gap-2">
                <Icon className="size-4" />
                {p.name}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {plans.map((p) => {
          const saved = toEdit(p);
          return (
            <TabsContent key={p.id} value={p.id}>
              {/* key: يعيد تهيئة المسودّة بعد الحفظ أو الاستعادة */}
              <PlanEditor key={JSON.stringify(saved)} saved={saved} />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
