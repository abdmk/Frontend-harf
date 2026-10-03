import { type ReactElement, useMemo, useState, useTransition } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router';

import { PanelSheetContent } from '@/components/shared/panel-sheet';
import { Button } from '@/components/ui/button';
import { Chip, ChipGroup } from '@/components/ui/chip-group';
import { CartIcon, CheckIcon, ComputerIcon, CrossIcon, GlobeIcon, MobileIcon, PlusIcon } from '@/components/ui/icons';
import { Sheet, SheetClose, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from '@/components/ui/toast';
import { paths } from '@/config/paths';
import { cn } from '@/lib/cn';
import { quote } from '@/lib/commerce/quote';
import { faceStyle, weightStyle } from '@/lib/font-weight';
import { formatMoney, weightsLabel } from '@/lib/format';
import { cents } from '@/types/domain/commerce';
import type { LiveFace } from '@/types/domain/font';
import { LICENSE_USES, type LicensePricing, type LicenseSelection, type LicenseUse } from '@/types/domain/license';

/**
 * انتقال سلس بين حالتين (View Transitions): البطاقة المختارة تنساب إلى مكانها في الملخّص بدل
 * الاستبدال المفاجئ. المتصفّحات التي لا تدعمه، و«تقليل الحركة»، تحصل على التغيير فوراً.
 */
function morph(update: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (!doc.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return update();
  doc.startViewTransition(() => flushSync(update));
}

export type SubmitResult = { ok: true } | { ok: false; error: string };

/**
 * الاستخدام بلغة المشتري لا بلغة التراخيص: ماذا سيفعل بالخط، وأمثلة يعرفها.
 * «scope» يشرح النطاق الافتراضي بكلمات بسيطة.
 */
const USES: Record<LicenseUse, { Icon: typeof ComputerIcon; title: string; hint: string; scope: string }> = {
  desktop: {
    Icon: ComputerIcon,
    title: 'تصميم ومطبوعات',
    hint: 'شعارات، منشورات، هويّات ومطبوعات تصمّمها على جهازك',
    scope: 'عدد الأجهزة التي يُثبَّت عليها الخط',
  },
  web: {
    Icon: GlobeIcon,
    title: 'موقع إلكتروني',
    hint: 'يظهر الخط نفسه لزوّار موقعك',
    scope: 'زيارات الموقع شهرياً',
  },
  app: {
    Icon: MobileIcon,
    title: 'تطبيق',
    hint: 'داخل تطبيق جوال أو برنامج',
    scope: 'عدد التطبيقات',
  },
};

type Props = {
  fontName: string;
  foundry: string;
  pricing: LicensePricing;
  trigger: ReactElement;
  /** خط العرض الحيّ — يُكتب به اسم الخط أعلى النافذة */
  face?: LiveFace;
  /** اختيار سابق (عند «تعديل الترخيص» من السلة) */
  initial?: LicenseSelection;
  defaultOpen?: boolean;
  /** إجراء الخادم الذي يضيف/يعدّل في السلة — يأتي من طبقة التطبيق */
  onSubmit: (selection: LicenseSelection) => SubmitResult | Promise<SubmitResult>;
  submitLabel?: string;
};

const usesOf = (s: LicenseSelection) => LICENSE_USES.filter((u) => !!s.uses[u]);

/**
 * نافذة الشراء — قرار واحد مطلوب: «لِمَ تحتاج الخط؟». كل ما عداه له افتراض معقول يظهر سطراً
 * هادئاً مع «تغيير» (النطاق، العائلة أو وزن واحد، استخدام إضافي). السعر يتحدّث أمام العين.
 * لا نختار الاستخدام عن المشتري: ترخيص خاطئ (مطبوعات لموقع) يكلّفه لاحقاً.
 * السعر هنا للعرض؛ الخادم يعيد حسابه عند الإضافة وعند الدفع.
 */
export function LicenseSheet({
  fontName,
  foundry,
  pricing,
  trigger,
  face,
  initial,
  defaultOpen,
  onSubmit,
  submitLabel,
}: Props) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [sel, setSel] = useState<LicenseSelection>(
    () => initial ?? { fontId: pricing.fontId, package: 'family', uses: {} },
  );
  /** السطر المفتوح للتعديل — واحد في كل مرّة */
  const [editing, setEditing] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [intent, setIntent] = useState<'cart' | 'buy' | null>(null);
  const navigate = useNavigate();

  const q = useMemo(() => quote(pricing, sel), [pricing, sel]);
  const chosen = usesOf(sel);
  const ratio = sel.package === 'family' ? 1 : pricing.singleCents / Math.max(1, pricing.familyCents);
  const saving = Math.round(
    (1 - pricing.familyCents / Math.max(1, pricing.singleCents * pricing.weights.length)) * 100,
  );
  // «من $X» لكل استخدام: العائلة بأوّل نطاق — ما سيدفعه إن لم يغيّر شيئاً
  const fromPrice = (use: LicenseUse) =>
    quote(pricing, { fontId: pricing.fontId, package: 'family', uses: { [use]: pricing.uses[use][0]?.id } })?.cents ??
    0;
  const lowest = Math.min(...LICENSE_USES.map(fromPrice));

  const setUse = (use: LicenseUse, tier: string | undefined) =>
    setSel((s) => ({ ...s, uses: { ...s.uses, [use]: tier } }));
  /** الاختيار الأوّل يستبدل؛ ما بعده يُضاف من «أحتاج أيضاً» — والبطاقة المختارة تنساب إلى سطر الملخّص */
  const pickPrimary = (use: LicenseUse) =>
    morph(() => setSel((s) => ({ ...s, uses: { [use]: s.uses[use] ?? pricing.uses[use][0]?.id } })));

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

  const weight = pricing.weights.find((w) => w.id === sel.weightId);
  const others = LICENSE_USES.filter((u) => !sel.uses[u]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <PanelSheetContent className="sm:max-h-[min(760px,calc(100dvh-3rem))] sm:w-[min(520px,calc(100vw-2rem))]">
        {/* الخط نفسه أوّلاً — بخطّه */}
        <header className="relative px-6 pt-6 pb-5">
          <SheetClose className="absolute end-4 top-4 grid size-9 place-items-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-sunken hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground/15">
            <CrossIcon className="size-4" />
            <span className="sr-only">إغلاق</span>
          </SheetClose>
          <p className="text-meta text-muted-foreground">ترخيص</p>
          <SheetTitle
            dir="ltr"
            className="mt-1 truncate pe-10 text-right text-3xl leading-tight font-semibold"
            style={face ? faceStyle(face, 600) : undefined}
          >
            {fontName}
          </SheetTitle>
          <SheetDescription className="mt-1 truncate text-meta text-muted-foreground">
            <bdi>{foundry}</bdi> · {weightsLabel(pricing.weights.length)}
          </SheetDescription>
        </header>

        <div className="scroll-none flex flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-6 pb-6">
          {/* القرار الوحيد المطلوب */}
          <section aria-labelledby="lic-use">
            <h3 id="lic-use" className="mb-3 text-lead font-semibold">
              لِمَ تحتاج الخط؟
            </h3>
            {chosen.length === 0 ? (
              <ul className="flex flex-col gap-2">
                {LICENSE_USES.map((use) => {
                  const { Icon, title, hint } = USES[use];
                  return (
                    <li key={use}>
                      <button
                        type="button"
                        onClick={() => pickPrimary(use)}
                        style={{ viewTransitionName: `lic-${use}` }}
                        className="group flex w-full items-center gap-4 rounded-lg border bg-card p-4 text-start transition-[border-color,background-color,transform] duration-(--dur-base) ease-out-quint outline-none hover:border-primary hover:bg-tint-brand/30 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
                      >
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tint-brand text-primary transition-colors group-hover:bg-primary-fill group-hover:text-primary-foreground">
                          <Icon className="size-4.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-control font-semibold">{title}</span>
                          <span className="mt-0.5 block text-meta text-muted-foreground">{hint}</span>
                        </span>
                        <span className="shrink-0 text-end text-caption text-tertiary">
                          من
                          <span dir="ltr" className="block text-control font-semibold text-foreground tabular-nums">
                            {formatMoney(cents(fromPrice(use)))}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ul className="divide-y rounded-lg border bg-card">
                {chosen.map((use) => {
                  const tiers = pricing.uses[use];
                  const tier = tiers.find((t) => t.id === sel.uses[use]);
                  const key = `use-${use}`;
                  const { Icon, title, scope } = USES[use];
                  return (
                    <li key={use} className="p-4" style={{ viewTransitionName: `lic-${use}` }}>
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 animate-pop-in place-items-center rounded-full bg-primary-fill text-primary-foreground">
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-control font-semibold">{title}</span>
                          <span className="block text-meta text-muted-foreground">{tier?.label}</span>
                        </span>
                        <button
                          type="button"
                          aria-expanded={editing === key}
                          onClick={() => setEditing(editing === key ? null : key)}
                          className="text-meta font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          {editing === key ? 'تمّ' : 'تغيير'}
                        </button>
                        {/* الإزالة متاحة دائماً: إزالة آخر استخدام تعيد الخيارات الثلاثة */}
                        {
                          <button
                            type="button"
                            aria-label={`إزالة ${title}`}
                            onClick={() =>
                              morph(() => {
                                setUse(use, undefined);
                                setEditing(null);
                              })
                            }
                            className="grid size-7 place-items-center rounded-full text-tertiary hover:bg-sunken hover:text-foreground"
                          >
                            <CrossIcon className="size-3.5" />
                          </button>
                        }
                      </div>
                      {editing === key && (
                        <div className="mt-3 animate-fade-up ps-7.5">
                          <p className="mb-2 text-caption text-muted-foreground">{scope}</p>
                          <ChipGroup
                            type="single"
                            aria-label={`نطاق ${title}`}
                            value={sel.uses[use]}
                            onValueChange={(v) => v && setUse(use, v)}
                          >
                            {tiers.map((t, i) => (
                              <Chip key={t.id} value={t.id}>
                                {t.label}
                                {i > 0 && (
                                  <span dir="ltr" className="ms-1.5 text-caption tabular-nums opacity-75">
                                    +{formatMoney(cents(Math.round((t.addCents - tiers[0]!.addCents) * ratio)))}
                                  </span>
                                )}
                              </Chip>
                            ))}
                          </ChipGroup>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            {chosen.length > 0 && others.length > 0 && (
              <div
                className="mt-2 flex animate-fade-up flex-wrap items-center gap-x-1 gap-y-1 text-meta text-muted-foreground"
                style={{ animationDelay: '60ms' }}
              >
                <PlusIcon className="size-3.5" />
                أحتاج أيضاً:
                {others.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => morph(() => setUse(u, pricing.uses[u][0]?.id))}
                    className="rounded-full px-2 py-0.5 font-medium text-foreground hover:bg-sunken"
                  >
                    {USES[u].title}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* بعد الاختيار: الأوزان بافتراض العائلة — سطر واحد مع «تغيير» */}
          {chosen.length > 0 && (
            <section aria-labelledby="lic-weights" className="animate-fade-up" style={{ animationDelay: '120ms' }}>
              <h3 id="lic-weights" className="sr-only">
                الأوزان
              </h3>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-3">
                  <span className="min-w-0 flex-1">
                    <span className="block text-control font-semibold">
                      {sel.package === 'family' ? 'العائلة الكاملة' : `وزن واحد · ${weight?.nameAr ?? ''}`}
                    </span>
                    <span className="block text-meta text-muted-foreground">
                      {sel.package === 'family'
                        ? `${weightsLabel(pricing.weights.length)}${saving >= 5 ? ` · توفّر ${saving}٪ عن شرائها منفردة` : ''}`
                        : 'تستطيع ترقيتها للعائلة لاحقاً'}
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-expanded={editing === 'weights'}
                    onClick={() => setEditing(editing === 'weights' ? null : 'weights')}
                    className="text-meta font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {editing === 'weights' ? 'تمّ' : 'تغيير'}
                  </button>
                </div>
                {editing === 'weights' && (
                  <div className="mt-3 flex animate-fade-up flex-col gap-3">
                    <div role="radiogroup" aria-label="ماذا تشتري؟" className="grid grid-cols-2 gap-2">
                      {(['family', 'single'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          role="radio"
                          aria-checked={sel.package === p}
                          onClick={() =>
                            setSel((s) => ({
                              ...s,
                              package: p,
                              weightId: p === 'single' ? (s.weightId ?? pricing.weights[0]?.id) : undefined,
                            }))
                          }
                          className={cn(
                            'rounded-md border px-3 py-2.5 text-start transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            sel.package === p
                              ? 'border-primary bg-tint-brand/40 ring-1 ring-primary'
                              : 'hover:border-strong',
                          )}
                        >
                          <span className="block text-control font-medium">
                            {p === 'family' ? 'العائلة الكاملة' : 'وزن واحد'}
                          </span>
                          <span dir="ltr" className="block text-end text-meta text-muted-foreground tabular-nums">
                            {formatMoney(cents(p === 'family' ? pricing.familyCents : pricing.singleCents))}
                          </span>
                        </button>
                      ))}
                    </div>
                    {sel.package === 'single' && (
                      <ul aria-label="اختر الوزن" className="max-h-52 overflow-y-auto rounded-md border">
                        {pricing.weights.map((w) => {
                          const on = sel.weightId === w.id;
                          return (
                            <li key={w.id}>
                              <button
                                type="button"
                                aria-pressed={on}
                                onClick={() => setSel((s) => ({ ...s, weightId: w.id }))}
                                className="flex w-full items-center gap-3 px-3 py-2 transition-colors hover:bg-sunken aria-pressed:bg-sunken"
                              >
                                <span
                                  aria-hidden
                                  className={cn(
                                    'grid size-4.5 shrink-0 place-items-center rounded-full',
                                    on ? 'bg-primary-fill text-primary-foreground' : 'border border-strong',
                                  )}
                                >
                                  {on && <CheckIcon className="size-3" />}
                                </span>
                                <span className="flex-1 text-start text-control">{w.nameAr}</span>
                                <span
                                  aria-hidden
                                  className="text-lg"
                                  style={face ? faceStyle(face, w.value) : weightStyle(w.value)}
                                >
                                  أبجد
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          <details className="group text-meta text-muted-foreground">
            <summary className="cursor-pointer list-none font-medium text-foreground underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden">
              ماذا يشمل الترخيص؟
            </summary>
            <ul className="mt-2 flex list-disc flex-col gap-1 ps-5 leading-relaxed">
              <li>ملفات الخط (OTF وWOFF2) للتحميل فوراً بعد الدفع.</li>
              <li>ملف ترخيص باسمك يصلك مع الإيصال.</li>
              <li>ترقية لاحقة تدفع فيها الفرق فقط.</li>
            </ul>
            <p className="mt-2">
              علامة تجارية كبيرة أو بثّ تلفزيوني؟{' '}
              <a href="mailto:abdulmalik@harflibrary.com" className="font-medium text-primary hover:underline">
                تواصل معنا
              </a>
            </p>
          </details>
        </div>

        <footer className="border-t px-6 py-4">
          <div className="mb-3 flex items-baseline justify-between gap-4" aria-live="polite">
            <span className="text-meta text-muted-foreground">{q ? 'الإجمالي' : 'يبدأ من'}</span>
            {/* المبلغ يتجدّد بحركة قصيرة كلما تغيّر — يلفت إلى أثر الاختيار */}
            <span
              key={q ? q.cents : 'from'}
              dir="ltr"
              className="animate-fade-up text-3xl font-semibold tracking-tight tabular-nums"
            >
              {formatMoney(cents(q ? q.cents : lowest))}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <Button size="lg" disabled={!q} loading={pending && intent === 'cart'} onClick={() => submit('cart')}>
              <CartIcon />
              {q ? (submitLabel ?? 'أضف إلى السلة') : 'اختر الاستخدام أولاً'}
            </Button>
            {!initial && q && (
              <Button
                variant="ghost"
                loading={pending && intent === 'buy'}
                onClick={() => submit('buy')}
                className="text-foreground"
              >
                اشترِ الآن مباشرة
              </Button>
            )}
          </div>
        </footer>
      </PanelSheetContent>
    </Sheet>
  );
}
