import { Collapsible as CollapsiblePrimitive, RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import { type ReactElement, useMemo, useState, useTransition } from 'react';
import { useNavigate } from 'react-router';

import { PanelSheetContent } from '@/components/shared/panel-sheet';
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
import { Sheet, SheetClose, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from '@/components/ui/toast';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';
import { quote, USE_LABEL } from '@/lib/commerce/quote';
import { weightStyle } from '@/lib/font-weight';
import { formatMoney, weightsLabel } from '@/lib/format';
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
  onSubmit: (selection: LicenseSelection) => SubmitResult | Promise<SubmitResult>;
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
  const [sel, setSel] = useState<LicenseSelection>(() => initial ?? defaultSelection(pricing));
  const [pending, startTransition] = useTransition();
  const [intent, setIntent] = useState<'cart' | 'buy' | null>(null);
  const navigate = useNavigate();

  const q = useMemo(() => quote(pricing, sel), [pricing, sel]);
  // التوفير الحقيقي للعائلة مقابل شراء كل الأوزان منفردة
  const saving = Math.round(
    (1 - pricing.familyCents / Math.max(1, pricing.singleCents * pricing.weights.length)) * 100,
  );
  // الإضافات تُحسب على أساس الحزمة (كما في quote)
  const ratio = sel.package === 'family' ? 1 : pricing.singleCents / Math.max(1, pricing.familyCents);
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
      if (mode === 'buy') navigate(paths.checkout.getHref());
      else
        toast({
          tone: 'success',
          title: initial ? 'عُدِّل الترخيص' : 'أُضيف إلى السلة',
          description: `${fontName} — ${formatMoney(cents(q.cents))}`,
          action: { label: 'عرض السلة', onClick: () => navigate(paths.cart.getHref()) },
        });
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <PanelSheetContent>
        <header className="flex items-center gap-3 border-b px-5 py-4">
          <span
            aria-hidden
            className="grid size-10 shrink-0 place-items-center rounded-xs bg-ink text-control font-semibold text-ink-foreground"
          >
            {fontName.slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <SheetTitle dir="ltr" className="truncate text-right text-base font-semibold">
              {fontName}
            </SheetTitle>
            {/* كل جزء معزول الاتجاه: اسم لاتيني بجانب نصّ عربي لا يقلب ترتيب السطر */}
            <SheetDescription className="truncate text-meta text-muted-foreground">
              <bdi>{foundry}</bdi> · {weightsLabel(pricing.weights.length)} · <bdi dir="ltr">OTF / WOFF2</bdi>
            </SheetDescription>
          </div>
          <SheetClose className="-me-2 grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground">
            <CrossIcon className="size-4" />
            <span className="sr-only">إغلاق</span>
          </SheetClose>
        </header>

        <div className="flex flex-1 scroll-thin flex-col gap-6 overflow-y-auto overscroll-contain px-5 py-5">
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
                hint={weightsLabel(pricing.weights.length)}
                price={pricing.familyCents}
                compareAt={pricing.compareAtFamilyCents}
                badge={saving >= 5 ? `وفّر ${saving}٪` : undefined}
              />
              <PackageOption value="single" title="وزن واحد" hint="تختاره بالأسفل" price={pricing.singleCents} />
            </RadioGroupPrimitive.Root>

            <WeightList pricing={pricing} sel={sel} onPick={(weightId) => setSel((s) => ({ ...s, weightId }))} />
          </section>

          <section aria-labelledby="lic-q2">
            <Step n={2} id="lic-q2">
              أين ستستعمله؟
            </Step>
            <p className="-mt-1.5 mb-3 text-caption text-muted-foreground">اختر كل ما ينطبق — ولكل استخدام نطاقه.</p>
            <div className="flex flex-col gap-2">
              {LICENSE_USES.map((use) => {
                const tiers = pricing.uses[use];
                const on = !!sel.uses[use];
                const { Icon, hint } = USE_META[use];
                const from = (use === 'desktop' ? 0 : tiers[0]?.addCents) ?? 0;
                return (
                  <div
                    key={use}
                    className={cn(
                      'rounded-md border p-3.5 transition-colors duration-(--dur-base)',
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
                        {tiers.map((t, i) => (
                          <Chip key={t.id} value={t.id}>
                            {t.label}
                            {/* فرق السعر عن أوّل مستوى — لا مفاجأة في الإجمالي */}
                            {i > 0 && (
                              <span dir="ltr" className="ms-1.5 text-caption tabular-nums opacity-75">
                                +{formatMoney(cents(Math.round((t.addCents - tiers[0]!.addCents) * ratio)))}
                              </span>
                            )}
                          </Chip>
                        ))}
                      </ChipGroup>
                    )}
                  </div>
                );
              })}
              <p className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-dashed px-3.5 py-2.5 text-caption text-muted-foreground">
                استخدام أوسع؟ علامة تجارية، بثّ، أو مؤسسة كبيرة
                <a href="mailto:abdulmalik@harflibrary.com" className="font-medium text-primary hover:underline">
                  تواصل معنا
                </a>
              </p>
            </div>
          </section>

          <CollapsiblePrimitive.Root className="rounded-md border">
            <CollapsiblePrimitive.Trigger className="group flex w-full items-center justify-between px-3.5 py-3 text-control font-medium">
              ماذا يشمل الترخيص؟
              <ChevronDownIcon className="size-4 transition-transform group-data-[state=open]:rotate-180" />
            </CollapsiblePrimitive.Trigger>
            <CollapsiblePrimitive.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
              <ul className="flex flex-col gap-1.5 px-3.5 pb-3.5 text-meta text-muted-foreground">
                <li>ملفات الخط بالصيغ المتاحة للحزمة المختارة.</li>
                <li>ملف ترخيص باسم صاحب الترخيص يصلك مع الإيصال.</li>
                <li>نصّ شروط الترخيص الكامل يُعرض هنا كما تعتمده حرف.</li>
              </ul>
            </CollapsiblePrimitive.Content>
          </CollapsiblePrimitive.Root>
        </div>

        <footer className="border-t px-5 py-4">
          <div className="mb-3 flex items-end justify-between gap-4">
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
            {q && (
              <p className="line-clamp-2 max-w-[60%] text-end text-caption leading-relaxed text-muted-foreground">
                {q.summary.join(' · ')}
              </p>
            )}
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
      </PanelSheetContent>
    </Sheet>
  );
}

function Step({ n, id, children }: { n: number; id: string; children: string }) {
  return (
    <h3 id={id} className="mb-3 flex items-center gap-2 text-control font-semibold">
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
  badge,
}: {
  value: LicensePackage;
  title: string;
  hint: string;
  price: number;
  compareAt?: number;
  badge?: string;
}) {
  return (
    <RadioGroupPrimitive.Item
      value={value}
      className="group flex items-start gap-3 rounded-md border bg-card p-3.5 text-start transition-colors duration-(--dur-base) hover:border-strong data-[state=checked]:border-primary data-[state=checked]:bg-tint-brand/60"
    >
      <span className="mt-0.5 size-5 shrink-0 rounded-full border-[1.5px] border-strong bg-card transition-[border-width,border-color] duration-(--dur-base) ease-pop group-data-[state=checked]:border-[5px] group-data-[state=checked]:border-primary" />
      <span className="min-w-0 flex-1">
        <span className="block text-control font-medium">{title}</span>
        <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-caption text-muted-foreground">
          {hint}
          {badge && (
            <span className="rounded-full bg-tint-ok px-1.5 py-0.5 text-micro font-medium text-ok-text">{badge}</span>
          )}
        </span>
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
  // العائلة: سطر واحد يرسم مدى الأوزان بأوزانها الحقيقية (من الأخفّ إلى الأثقل) — معلومة لا اختيار،
  // بدل قائمة شرائح ✓ تملأ المساحة وتدفع السؤال الثاني بعيداً
  if (sel.package === 'family') {
    const first = pricing.weights[0];
    const last = pricing.weights.at(-1);
    return (
      <div className="mt-3 flex items-center gap-4 rounded-md bg-sunken px-4 py-3">
        <p
          aria-label={`الأوزان المشمولة: ${pricing.weights.map((w) => w.nameAr).join('، ')}`}
          className="flex flex-1 items-baseline gap-2.5 overflow-hidden text-2xl leading-none"
        >
          {pricing.weights.map((w) => (
            <span key={w.id} aria-hidden title={`${w.nameAr} ${w.value}`} style={weightStyle(w.value)}>
              ب
            </span>
          ))}
        </p>
        {first && last && (
          <p className="shrink-0 text-end text-caption leading-tight text-muted-foreground">
            {first.nameAr} ← {last.nameAr}
            <span dir="ltr" className="block text-tertiary tabular-nums">
              {first.value}–{last.value}
            </span>
          </p>
        )}
      </div>
    );
  }

  return (
    <ul aria-label="اختر الوزن" className="mt-3 max-h-56 divide-y overflow-y-auto rounded-md border bg-card">
      {pricing.weights.map((w) => {
        const on = sel.weightId === w.id;
        return (
          <li key={w.id}>
            <button
              type="button"
              aria-pressed={on}
              onClick={() => onPick(w.id)}
              className="flex w-full items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-sunken aria-pressed:bg-tint-brand/50"
            >
              <span
                aria-hidden
                className={cn(
                  'grid size-5 shrink-0 place-items-center rounded-full transition-colors',
                  on ? 'bg-primary-fill text-primary-foreground' : 'border border-strong',
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
              <span aria-hidden className="text-lg" style={weightStyle(w.value)}>
                أبجد هوز
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
