'use client';

import { useRouter } from 'next/navigation';
import { Collapsible as CollapsiblePrimitive, RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import { type ReactElement, useMemo, useState, useTransition } from 'react';

import { PriceDisplay } from '@/components/shared/price-display';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Chip, ChipGroup } from '@/components/ui/chip-group';
import {
  CartIcon,
  CheckIcon,
  ChevronDownIcon,
  ComputerIcon,
  CrossIcon,
  GlobeIcon,
  MobileIcon,
} from '@/components/ui/icons';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from '@/components/ui/toast';
import { paths } from '@/config/paths';
import { below } from '@/design-system/tokens';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/cn';
import { quote, USE_LABEL } from '@/lib/commerce/quote';
import { weightStyle } from '@/lib/font-weight';
import { formatMoney } from '@/lib/format';
import { cents } from '@/types/domain/commerce';
import {
  LICENSE_USES,
  type LicensePackage,
  type LicensePricing,
  type LicenseSelection,
  type LicenseUse,
} from '@/types/domain/license';

export type SubmitResult = { ok: true } | { ok: false; error: string };

const USE_META: Record<LicenseUse, { Icon: typeof ComputerIcon; hint: string }> = {
  desktop: { Icon: ComputerIcon, hint: 'مطبوعات وشعارات وصور تُصمّم على أجهزتك' },
  web: { Icon: GlobeIcon, hint: 'تضمين الخط في موقع عبر ‎@font-face' },
  app: { Icon: MobileIcon, hint: 'تضمين الخط داخل تطبيق جوال أو سطح مكتب' },
};

type Props = {
  fontName: string;
  foundry: string;
  pricing: LicensePricing;
  trigger: ReactElement;
  /** اختيار سابق (عند «تعديل الترخيص» من السلة) */
  initial?: LicenseSelection;
  defaultOpen?: boolean;
  /** إجراء الخادم الذي يضيف/يعدّل في السلة — يأتي من طبقة التطبيق */
  onSubmit: (selection: LicenseSelection) => Promise<SubmitResult>;
  submitLabel?: string;
};

function defaultSelection(p: LicensePricing): LicenseSelection {
  return { fontId: p.fontId, package: 'family', uses: { desktop: p.uses.desktop[0]?.id } };
}

/**
 * لوحة الترخيص (دليل التصميم 5.5): سؤالان — ماذا تشتري؟ أين ستستعمله؟ — والإجمالي أمام العين.
 * السعر هنا للعرض؛ الخادم يعيد حسابه عند الإضافة وعند الدفع.
 */
export function LicenseSheet({
  fontName,
  foundry,
  pricing,
  trigger,
  initial,
  defaultOpen,
  onSubmit,
  submitLabel,
}: Props) {
  const [open, setOpen] = useState(!!defaultOpen);
  const mobile = useMediaQuery(below('sm'));
  const [sel, setSel] = useState<LicenseSelection>(() => initial ?? defaultSelection(pricing));
  const [pending, startTransition] = useTransition();
  const [intent, setIntent] = useState<'cart' | 'buy' | null>(null);
  const router = useRouter();

  const q = useMemo(() => quote(pricing, sel), [pricing, sel]);
  const setPackage = (pkg: LicensePackage) =>
    setSel((s) => ({
      ...s,
      package: pkg,
      weightId: pkg === 'single' ? (s.weightId ?? pricing.weights[0]?.id) : undefined,
    }));
  const toggleUse = (use: LicenseUse, on: boolean) =>
    setSel((s) => ({ ...s, uses: { ...s.uses, [use]: on ? pricing.uses[use][0]?.id : undefined } }));

  function submit(mode: 'cart' | 'buy') {
    if (!q) return;
    setIntent(mode);
    startTransition(async () => {
      const res = await onSubmit(sel);
      setIntent(null);
      if (!res.ok) {
        toast({ tone: 'danger', title: 'لم تتمّ الإضافة', description: res.error });
        return;
      }
      setOpen(false);
      if (mode === 'buy') router.push(paths.checkout.getHref());
      else
        toast({
          tone: 'success',
          title: initial ? 'عُدِّل الترخيص' : 'أُضيف إلى السلة',
          description: `${fontName} — ${formatMoney(cents(q.cents))}`,
          action: { label: 'عرض السلة', onClick: () => router.push(paths.cart.getHref()) },
        });
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side={mobile ? 'bottom' : 'left'}
        showCloseButton={false}
        className={cn(
          'gap-0 border bg-sheet p-0 shadow-overlay data-[state=open]:duration-500',
          mobile
            ? 'max-h-[92dvh] rounded-t-xl'
            : 'inset-y-3 left-3 h-auto w-[min(520px,calc(100vw-24px))] rounded-xl sm:max-w-none',
        )}
      >
        <header className="flex items-center gap-4 border-b px-6 py-5">
          <span
            aria-hidden
            className="grid size-12 shrink-0 place-items-center rounded-sm bg-ink text-lg font-semibold text-ink-foreground"
          >
            {fontName.slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <SheetTitle dir="ltr" className="truncate text-right text-base font-semibold">
              {fontName}
            </SheetTitle>
            <SheetDescription className="truncate text-meta text-muted-foreground">
              {foundry} · {pricing.weights.length} أوزان · OTF / WOFF2
            </SheetDescription>
          </div>
          <SheetClose className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground">
            <CrossIcon className="size-4" />
            <span className="sr-only">إغلاق</span>
          </SheetClose>
        </header>

        <div className="flex flex-1 flex-col gap-8 overflow-y-auto overscroll-contain px-6 py-6">
          <section aria-labelledby="lic-q1">
            <Step n={1} id="lic-q1">
              ماذا تشتري؟
            </Step>
            <RadioGroupPrimitive.Root
              aria-labelledby="lic-q1"
              value={sel.package}
              onValueChange={(v) => setPackage(v as LicensePackage)}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              <PackageOption
                value="family"
                title="العائلة الكاملة"
                hint={`${pricing.weights.length} أوزان — كل ما في الخط`}
                price={pricing.familyCents}
                compareAt={pricing.compareAtFamilyCents}
              />
              <PackageOption
                value="single"
                title="وزن واحد"
                hint="اختر الوزن الذي تحتاجه"
                price={pricing.singleCents}
              />
            </RadioGroupPrimitive.Root>

            <WeightList pricing={pricing} sel={sel} onPick={(weightId) => setSel((s) => ({ ...s, weightId }))} />
          </section>

          <section aria-labelledby="lic-q2">
            <Step n={2} id="lic-q2">
              أين ستستعمله؟
            </Step>
            <p className="-mt-2 mb-4 text-meta text-muted-foreground">اختر كل ما ينطبق — ولكل استخدام نطاقه.</p>
            <div className="flex flex-col gap-3">
              {LICENSE_USES.map((use) => {
                const tiers = pricing.uses[use];
                const on = !!sel.uses[use];
                const { Icon, hint } = USE_META[use];
                const from = (use === 'desktop' ? 0 : tiers[0]?.addCents) ?? 0;
                return (
                  <div
                    key={use}
                    className={cn(
                      'rounded-md border p-4 transition-colors duration-(--dur-base)',
                      on ? 'border-primary bg-tint-brand/60' : 'bg-card hover:border-strong',
                    )}
                  >
                    <label className="flex cursor-pointer items-start gap-3">
                      <Checkbox checked={on} onCheckedChange={(v) => toggleUse(use, v === true)} className="mt-0.5" />
                      <span className="grid size-8 shrink-0 place-items-center rounded-xs bg-sunken text-muted-foreground">
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-control font-medium">{USE_LABEL[use]}</span>
                        <span className="block text-caption text-muted-foreground">{hint}</span>
                      </span>
                      {!on && use !== 'desktop' && (
                        <span className="text-end text-caption text-tertiary">
                          يبدأ من
                          <span dir="ltr" className="block text-control font-semibold text-foreground">
                            +{formatMoney(cents(from))}
                          </span>
                        </span>
                      )}
                    </label>
                    {on && (
                      <ChipGroup
                        type="single"
                        aria-label={`نطاق ${USE_LABEL[use]}`}
                        value={sel.uses[use]}
                        onValueChange={(v) => v && setSel((s) => ({ ...s, uses: { ...s.uses, [use]: v } }))}
                        className="mt-3 ps-8"
                      >
                        {tiers.map((t) => (
                          <Chip key={t.id} value={t.id}>
                            {t.label}
                          </Chip>
                        ))}
                      </ChipGroup>
                    )}
                  </div>
                );
              })}
              <p className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-dashed px-4 py-3 text-meta text-muted-foreground">
                استخدام أوسع؟ علامة تجارية، بثّ، أو مؤسسة كبيرة
                <a href="mailto:hello@harf.co" className="font-medium text-primary hover:underline">
                  تواصل معنا
                </a>
              </p>
            </div>
          </section>

          <CollapsiblePrimitive.Root className="rounded-md border">
            <CollapsiblePrimitive.Trigger className="group flex w-full items-center justify-between px-4 py-3.5 text-control font-medium">
              ماذا يشمل الترخيص؟
              <ChevronDownIcon className="size-4 transition-transform group-data-[state=open]:rotate-180" />
            </CollapsiblePrimitive.Trigger>
            <CollapsiblePrimitive.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
              <ul className="flex flex-col gap-2 px-4 pb-4 text-meta text-muted-foreground">
                <li>ملفات الخط بالصيغ المتاحة للحزمة المختارة.</li>
                <li>ملف ترخيص باسم صاحب الترخيص يصلك مع الإيصال.</li>
                <li>نصّ شروط الترخيص الكامل يُعرض هنا كما تعتمده حرف.</li>
              </ul>
            </CollapsiblePrimitive.Content>
          </CollapsiblePrimitive.Root>
        </div>

        <footer className="border-t px-6 pt-4 pb-5">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-caption text-tertiary">الإجمالي</p>
              <div aria-live="polite">
                {q ? (
                  <PriceDisplay price={cents(q.cents)} size="lg" />
                ) : (
                  <span className="text-meta text-dgr-text">اختر استخداماً واحداً على الأقل</span>
                )}
              </div>
            </div>
            {q && <p className="truncate text-end text-caption text-muted-foreground">{q.summary.join(' · ')}</p>}
          </div>
          <div className="grid grid-cols-[2fr_1fr] gap-3">
            <Button size="lg" disabled={!q} loading={pending && intent === 'cart'} onClick={() => submit('cart')}>
              <CartIcon />
              {submitLabel ?? 'أضف إلى السلة'}
            </Button>
            {!initial && (
              <Button
                size="lg"
                variant="outline"
                disabled={!q}
                loading={pending && intent === 'buy'}
                onClick={() => submit('buy')}
              >
                اشترِ الآن
              </Button>
            )}
          </div>
        </footer>
      </SheetContent>
    </Sheet>
  );
}

function Step({ n, id, children }: { n: number; id: string; children: string }) {
  return (
    <h3 id={id} className="mb-4 flex items-center gap-2 text-base font-semibold">
      <span
        dir="ltr"
        className="grid size-6 place-items-center rounded-full bg-sunken text-caption text-muted-foreground"
      >
        {n}
      </span>
      {children}
    </h3>
  );
}

function PackageOption({
  value,
  title,
  hint,
  price,
  compareAt,
}: {
  value: LicensePackage;
  title: string;
  hint: string;
  price: number;
  compareAt?: number;
}) {
  return (
    <RadioGroupPrimitive.Item
      value={value}
      className="group flex items-start gap-3 rounded-md border bg-card p-4 text-start transition-colors duration-(--dur-base) hover:border-strong data-[state=checked]:border-primary data-[state=checked]:bg-tint-brand/60"
    >
      <span className="mt-0.5 size-5 shrink-0 rounded-full border-[1.5px] border-strong bg-card transition-[border-width,border-color] duration-(--dur-base) ease-pop group-data-[state=checked]:border-[5px] group-data-[state=checked]:border-primary" />
      <span className="min-w-0 flex-1">
        <span className="block text-control font-medium">{title}</span>
        <span className="block text-caption text-muted-foreground">{hint}</span>
      </span>
      <PriceDisplay
        price={cents(price)}
        compareAt={compareAt ? cents(compareAt) : undefined}
        size="sm"
        className="flex-col items-end gap-0"
      />
    </RadioGroupPrimitive.Item>
  );
}

function WeightList({
  pricing,
  sel,
  onPick,
}: {
  pricing: LicensePricing;
  sel: LicenseSelection;
  onPick: (id: string) => void;
}) {
  const family = sel.package === 'family';
  const rows = pricing.weights.map((w) => {
    const on = family || sel.weightId === w.id;
    const content = (
      <>
        <span
          aria-hidden
          className={cn(
            'grid size-5 shrink-0 place-items-center rounded-full transition-colors',
            on ? 'bg-tint-ok text-ok-text' : 'border border-strong',
          )}
        >
          {on && <CheckIcon className="size-3" />}
        </span>
        <span className="min-w-0 flex-1 text-start">
          <span className="block text-control">{w.nameAr}</span>
          <span dir="ltr" className="block text-right text-caption text-tertiary">
            {w.nameEn} · {w.value}
          </span>
        </span>
        <span aria-hidden className="text-xl" style={weightStyle(w.value)}>
          أبجد هوز
        </span>
      </>
    );
    return family ? (
      <li key={w.id} className="flex items-center gap-3 px-4 py-3">
        {content}
      </li>
    ) : (
      <li key={w.id}>
        <button
          type="button"
          aria-pressed={on}
          onClick={() => onPick(w.id)}
          className="flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-sunken aria-pressed:bg-tint-brand/50"
        >
          {content}
        </button>
      </li>
    );
  });
  return (
    <ul
      aria-label={family ? 'الأوزان المشمولة' : 'اختر الوزن'}
      className="mt-3 max-h-72 divide-y overflow-y-auto rounded-md border bg-card"
    >
      {rows}
    </ul>
  );
}
