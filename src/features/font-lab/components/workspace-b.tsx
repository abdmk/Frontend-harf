import { lazy, Suspense, useEffect, useRef } from 'react';

import { LoadingState } from '@/components/shared/loading-state';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CheckIcon,
  ChevronDownIcon,
  CrossSmallIcon,
  ExclamationIcon,
  PlusIcon,
  RefreshIcon,
  SlidersIcon,
} from '@/components/ui/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/cn';

import { OpenTypeStrip, TestCanvas } from './canvas';
import {
  AdvancedTextControls,
  ControlsCard,
  PrimaryTextControls,
  SizeField,
  styleLabel,
  TextField,
  useFamily,
} from './controls';
import { FeaturesTool } from './features-tool';
import { QuickCheck, qualityChecks } from './tools/overview';
import { kb, useCounts, usePageState } from './workspace';
import { type ToolKey, toolByKey, TOOLS } from '../data/tools';
import { useLab } from '../hooks/lab-context';
import { ACCEPT } from '../utils/load';

const lazyTool = <P extends object, K extends string>(
  load: () => Promise<Record<K, (p: P) => React.JSX.Element | null>>,
  name: K,
) => lazy(() => load().then((m) => ({ default: m[name] })));

const Languages = lazyTool(() => import('./tools/languages'), 'Languages');
const Letters = lazyTool(() => import('./tools/letters'), 'Letters');
const Marks = lazyTool(() => import('./tools/marks'), 'Marks');
const Waterfall = lazyTool(() => import('./tools/waterfall'), 'Waterfall');
const Weights = lazyTool(() => import('./tools/weights'), 'Weights');
const Axes = lazyTool(() => import('./tools/weights'), 'Axes');
const Numerals = lazyTool(() => import('./tools/numerals'), 'Numerals');
const Glyphs = lazyTool(() => import('./tools/glyphs'), 'Glyphs');
const Compare = lazyTool(() => import('./tools/compare'), 'Compare');
const Info = lazyTool(() => import('./tools/info'), 'Info');

/**
 * الأدوات نفسها مجمّعة بسؤال المستخدم لا بترتيب الملف:
 * «جرّب» — نصّك بالخط (كلها تتبع شريط نصّ واحداً) · «افحص» — ما رسمه المصمّم · «تحقّق» — هل يصلح لعملي.
 */
const GROUPS: { key: string; label: string; tools: ToolKey[] }[] = [
  { key: 'try', label: 'جرّب', tools: ['sample', 'waterfall', 'weights', 'axes', 'compare'] },
  { key: 'inspect', label: 'افحص', tools: ['features', 'letters', 'marks', 'numerals', 'glyphs'] },
  { key: 'verify', label: 'تحقّق', tools: ['languages', 'info'] },
];
const TRY = new Set(GROUPS[0]!.tools);

/** أسماء قصيرة للتبويبات — حتى تتّسع الأدوات كلها في سطر واحد على الحاسوب؛ الاسم الكامل في التلميح وفي وصف الأداة */
const SHORT: Partial<Record<ToolKey, string>> = {
  sample: 'العيّنة',
  waterfall: 'الأحجام',
  axes: 'المحاور',
  features: 'OpenType',
  letters: 'الحروف',
  info: 'معلومات الملف',
};

/**
 * النسخة «ب» من مساحة المختبر — الأدوات والوظائف نفسها، بتوزيع آخر:
 * - رأس الخط بعرض الصفحة (الاسم بخطّه كبيراً)، ثم شريط أدوات مثبّت تحت ترويسة الموقع — التنقّل لا يبتعد أبداً.
 * - أدوات «جرّب» تتشارك شريط نصّ واحداً (والـOpenType تحته): تنتقل بين العيّنة والأحجام والأوزان
 *   والمقارنة والإعدادات في مكانها، فتقارن المشاهد دون إعادة الضبط.
 * - على الجوال: الإعدادات في لوحة سفلية تُفتح بزرّ، فتأخذ العيّنة الشاشة.
 */
export function WorkspaceB() {
  const { tool, mode, sub, compare, patch } = usePageState();
  const { set, settings } = useLab();
  const top = useRef<HTMLDivElement>(null);
  const current = toolByKey(tool);
  const tryTool = TRY.has(tool);

  const go = (t: ToolKey) => {
    patch({ tool: t === 'sample' ? null : t, sub: null, mode: null }, true);
    // الشريط مثبّت: إن نزل المستخدم في أداة طويلة نعيده إلى بداية الأداة الجديدة
    if ((top.current?.getBoundingClientRect().top ?? 0) < 0)
      top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const trySample = (tag: string, sample: string) => {
    set({ text: sample, features: { ...settings.features, [tag]: true } });
    go('sample');
  };

  return (
    // اللوحات المثبّتة داخل الأدوات تنزل تحت شريط الأدوات المثبّت
    <div className="pb-16 [--lab-sticky:8.5rem]">
      <FontHeader onCheck={() => go('languages')} />
      <ToolTabs current={tool} onGo={go} />

      <div ref={top} className="scroll-mt-48 pt-6 lg:scroll-mt-36">
        <p className="mb-4 text-meta text-muted-foreground">{current.lead}</p>

        {tryTool && (
          <div className="mb-5 flex flex-col gap-3">
            <TextBar withText={tool !== 'sample'} />
            <OpenTypeStrip onAll={() => go('features')} />
          </div>
        )}

        <Suspense fallback={<LoadingState label="جارٍ فتح الأداة…" />}>
          <div key={tool} className="flex animate-fade-up flex-col gap-5">
            {tool === 'sample' && (
              <TestCanvas
                mode={mode}
                onMode={(m) => patch({ mode: m === 'write' ? null : m })}
                compare={compare}
                onCompare={(v) => patch({ compare: v ? '1' : null })}
                onAllFeatures={() => go('features')}
                strip={false}
              />
            )}
            {tool === 'waterfall' && <Waterfall controls={false} />}
            {tool === 'weights' && <Weights />}
            {tool === 'axes' && <Axes />}
            {tool === 'compare' && <Compare />}
            {tool === 'features' && (
              <FeaturesTool sub={sub} onSub={(s) => patch({ sub: s === 'live' ? null : s })} onTry={trySample} />
            )}
            {tool === 'letters' && <Letters />}
            {tool === 'marks' && <Marks />}
            {tool === 'numerals' && <Numerals />}
            {tool === 'glyphs' && <Glyphs />}
            {tool === 'languages' && (
              <>
                <QuickCheck onGo={go} />
                <ControlsCard label="إعدادات اللغات">
                  <SizeField min={18} max={64} label="حجم عيّنات اللغات" />
                </ControlsCard>
                <Languages />
              </>
            )}
            {tool === 'info' && <Info />}
          </div>
        </Suspense>
      </div>
    </div>
  );
}

/* ───────────────────────── رأس الخط ───────────────────────── */

/** الخط بعرض الصفحة: اسمه بخطّه كبيراً، ملفه، جواب الفحص السريع، وإجراءات الملفات */
function FontHeader({ onCheck }: { onCheck: () => void }) {
  const { fonts, active, setActive, remove, clear, add, busy, specimen } = useLab();
  const input = useRef<HTMLInputElement>(null);
  const family = useFamily();
  if (!active) return null;
  const families = [...new Map(fonts.map((f) => [f.family, f])).values()];
  const checks = qualityChecks(active);
  const passed = checks.filter((c) => c.ok).length;
  const allOk = passed === checks.length;
  const meta = [
    active.axes.length ? 'خط متغيّر' : family.length > 1 ? `${family.length} أنماط` : styleLabel(active),
    active.format,
    kb(active.bytes),
    `${active.glyphCount.toLocaleString('en-US')} محرفاً`,
  ];

  return (
    <header className="flex flex-col gap-4 pt-6 pb-5 sm:pt-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-caption text-tertiary">مختبر الخط</p>
        <h1
          dir="ltr"
          title={active.fullName}
          className="mt-1 truncate text-right text-3xl leading-tight sm:text-4xl"
          style={active.previewable ? specimen(active) : undefined}
        >
          {active.family}
        </h1>
        <p className="mt-2 flex flex-wrap gap-x-2 text-meta text-muted-foreground">
          {meta.map((m, i) => (
            <span key={m} className="flex gap-x-2">
              {i > 0 && <span className="text-tertiary">·</span>}
              <span dir="ltr">{m}</span>
            </span>
          ))}
        </p>
        {!active.previewable && (
          <p className="mt-2 text-caption text-warn-text">تحليل فقط — المتصفّح لا يعرض هذا الملف</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onCheck}
          className={cn(
            'inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-meta font-medium transition-colors',
            allOk ? 'bg-tint-ok text-ok-text hover:bg-ok-500/20' : 'bg-tint-warn text-warn-text hover:bg-warn-500/20',
          )}
        >
          {allOk ? <CheckIcon className="size-4" /> : <ExclamationIcon className="size-4" />}
          الفحص السريع: {passed} من {checks.length}
        </button>
        {families.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                الخطوط ({families.length})
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>بدّل العائلة</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={active.family}
                onValueChange={(fam) => {
                  const f = fonts.find((x) => x.family === fam);
                  if (f) setActive(f.id);
                }}
              >
                {families.map((f) => (
                  <DropdownMenuRadioItem key={f.family} value={f.family}>
                    <span dir="ltr">{f.family}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => family.forEach((f) => remove(f.id))}>
                <CrossSmallIcon />
                إزالة {active.family}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Button variant="outline" size="sm" loading={busy} onClick={() => input.current?.click()}>
          <PlusIcon />
          أضف خطاً
        </Button>
        <Button variant="ghost" size="sm" onClick={clear}>
          ابدأ من جديد
        </Button>
        <input
          ref={input}
          type="file"
          hidden
          multiple
          accept={ACCEPT}
          onChange={(e) => {
            if (e.target.files?.length) void add(Array.from(e.target.files));
            e.target.value = '';
          }}
        />
      </div>
    </header>
  );
}

/* ───────────────────────── شريط الأدوات ───────────────────────── */

const TAB =
  'relative inline-flex h-12 shrink-0 items-center gap-2 px-0.5 text-control whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:font-semibold aria-[current=page]:text-foreground aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-0 aria-[current=page]:after:bottom-0 aria-[current=page]:after:h-0.5 aria-[current=page]:after:rounded-full aria-[current=page]:after:bg-primary-fill';

/**
 * شريط واحد مثبّت تحت ترويسة الموقع: المجموعات الثلاث بأسمائها، وأدواتها تبويبات.
 * يُمرَّر أفقياً على الشاشات الضيّقة، والأداة المختارة تبقى ظاهرة.
 */
function ToolTabs({ current, onGo }: { current: ToolKey; onGo: (t: ToolKey) => void }) {
  const { active } = useLab();
  const counts = useCounts();
  const row = useRef<HTMLDivElement>(null);
  // الأداة المختارة تبقى ظاهرة في الشريط الأفقي (روابط مشاركة، أو أداة في آخره على الجوال)
  useEffect(() => {
    const el = row.current?.querySelector<HTMLElement>('[aria-current=page]');
    const box = row.current;
    if (!el || !box || box.scrollWidth <= box.clientWidth) return;
    const a = el.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    if (a.left < b.left || a.right > b.right) box.scrollBy({ left: a.left - b.left - (b.width - a.width) / 2 });
  }, [current]);
  return (
    <nav
      aria-label="أدوات الفحص"
      className="sticky top-28 z-30 -mx-1 border-b bg-background/95 px-1 backdrop-blur-lg lg:top-18"
    >
      <div
        ref={row}
        className="flex [scrollbar-width:none] items-center gap-x-4 overflow-x-auto xl:gap-x-5 [&::-webkit-scrollbar]:hidden"
      >
        {GROUPS.map((g, gi) => (
          <div key={g.key} role="group" aria-label={g.label} className="flex shrink-0 items-center gap-x-4 xl:gap-x-5">
            {gi > 0 && <span aria-hidden className="h-5 w-px bg-border" />}
            <span className="text-caption text-tertiary">{g.label}</span>
            {g.tools.map((k) => {
              const t = TOOLS.find((x) => x.key === k)!;
              const on = k === current;
              const empty = k === 'axes' && !active?.axes.length;
              const count = counts[k];
              return (
                <button
                  key={k}
                  type="button"
                  aria-current={on ? 'page' : undefined}
                  onClick={() => onGo(k)}
                  title={empty ? 'هذا الخط ثابت — لا محاور فيه' : t.label}
                  className={cn(TAB, empty && !on && 'text-tertiary')}
                >
                  {SHORT[k] ?? t.label}
                  {count !== undefined && count > 0 && (
                    <span dir="ltr" className="text-caption font-normal text-tertiary tabular-nums">
                      {count.toLocaleString('en-US')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </nav>
  );
}

/* ───────────────────────── شريط النص ───────────────────────── */

/**
 * شريط نصّ واحد لكل أدوات «جرّب» — يبقى في مكانه حين تنتقل بينها.
 * الحاسوب: الإعدادات الأساسية في صفّ واحد، والنادرة في نافذة «مزيد».
 * الجوال: نصّ المعاينة وزرّ يفتح كل الإعدادات في لوحة سفلية، فتبقى الشاشة للعيّنة.
 */
function TextBar({ withText }: { withText: boolean }) {
  const { settings: s, resetSettings } = useLab();
  return (
    <section aria-label="إعدادات النص" className="lg:rounded-2xl lg:border lg:bg-card lg:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-8">
        {withText && (
          <div className="lg:w-64 lg:shrink-0">
            <TextField />
          </div>
        )}

        {/* الحاسوب */}
        <PrimaryTextControls className="grid flex-1 grid-cols-4 items-end gap-x-6 max-lg:hidden" />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="shrink-0 max-lg:hidden">
              <SlidersIcon />
              مزيد
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[min(30rem,calc(100vw-2rem))] p-5">
            <AdvancedTextControls columns="sm:grid-cols-2" />
          </PopoverContent>
        </Popover>

        {/* الجوال */}
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <p dir="ltr" className="text-caption text-muted-foreground tabular-nums">
            {s.size}px · {s.lineHeight.toFixed(1)}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={resetSettings} aria-label="إعادة الإعدادات">
              <RefreshIcon />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersIcon />
                  إعدادات النص
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>إعدادات النص</SheetTitle>
                  <SheetDescription>تسري على العيّنة والأحجام والأوزان والمقارنة.</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-6 px-5 pb-6">
                  <PrimaryTextControls className="grid grid-cols-2 gap-x-6 gap-y-5" />
                  <div className="border-t pt-5">
                    <AdvancedTextControls columns="grid-cols-1" />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
}
