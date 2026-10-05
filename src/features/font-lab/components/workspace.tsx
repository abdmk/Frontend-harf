import { lazy, Suspense, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router';

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
import { CheckIcon, ChevronDownIcon, CrossSmallIcon, ExclamationIcon, PlusIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

import { TestCanvas } from './canvas';
import { ControlsCard, SizeField, styleLabel, TextControls, useFamily } from './controls';
import { type FeaturesSub, FeaturesTool } from './features-tool';
import { QuickCheck, qualityChecks } from './tools/overview';
import { LANGUAGES } from '../data/languages';
import { canvasModeByKey, legacyTool, type ToolKey, toolByKey, TOOLS } from '../data/tools';
import { useLab } from '../hooks/lab-context';
import { coverage } from '../utils/coverage';
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
 * حالة الصفحة في الرابط — قابلة للمشاركة: ?tool= (الأداة)، ?mode= (سياق العيّنة)، ?sub= (عرض الميزات)،
 * ?compare=1 (قبل / بعد). روابط الإصدار السابق (?view=…) تُترجم إلى أداتها.
 */
function usePageState() {
  const [params, setParams] = useSearchParams();
  const tool = toolByKey(params.get('tool') ?? legacyTool(params)).key;
  const mode = canvasModeByKey(params.get('mode'));
  const sub: FeaturesSub = params.get('sub') === 'inventory' ? 'inventory' : 'live';
  const compare = params.get('compare') === '1';
  const patch = (next: Record<string, string | null>, push = false) =>
    setParams(
      (p) => {
        const n = new URLSearchParams(p);
        for (const k of ['view', 'panel']) n.delete(k);
        for (const [k, v] of Object.entries(next)) {
          if (v === null) n.delete(k);
          else n.set(k, v);
        }
        return n;
      },
      { replace: !push },
    );
  return { tool, mode, sub, compare, patch };
}

/**
 * مساحة «مختبر الخط» بترتيب مختبر حرف: عمود جانبي ثابت (بطاقة الخط + أدوات الفحص)،
 * وبجانبه الأداة المختارة بالبنية نفسها دائماً — عنوان، بطاقة إعدادات، ثم المعاينة.
 * «عيّنة النص» أولاً وأوسعها: هي مساحة التجربة، وOpenType حاضر فيها بشريط واحد.
 * على الجوال: بطاقة الخط ثم الأدوات شريطاً أفقياً، والأداة تحته.
 */
export function Workspace() {
  const { tool, mode, sub, compare, patch } = usePageState();
  const { set, settings } = useLab();
  const main = useRef<HTMLDivElement>(null);
  const current = toolByKey(tool);

  const go = (t: ToolKey) => {
    patch({ tool: t === 'sample' ? null : t, sub: null, mode: null }, true);
    // على الشاشات الضيّقة الأداة تحت الشريط — نصعد إلى بدايتها إن كانت فوق مجال الرؤية
    const top = main.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) main.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const trySample = (tag: string, sample: string) => {
    set({ text: sample, features: { ...settings.features, [tag]: true } });
    go('sample');
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 pt-6 pb-16 sm:pt-8 lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-8">
      <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-22 lg:max-h-[calc(100dvh-6.5rem)] lg:[scrollbar-width:thin] lg:overflow-y-auto lg:overscroll-contain lg:pb-2">
        <FontCard onCheck={() => go('languages')} />
        <ToolNav current={tool} onGo={(t) => go(t)} />
      </aside>

      <div ref={main} className="min-w-0 scroll-mt-24">
        <header className="mb-5">
          <h2 className="text-2xl font-semibold tracking-tight">{current.label}</h2>
          <p className="mt-1.5 text-meta text-muted-foreground">{current.lead}</p>
        </header>

        <Suspense fallback={<LoadingState label="جارٍ فتح الأداة…" />}>
          <div key={tool} className="flex animate-fade-up flex-col gap-5">
            {tool === 'sample' && (
              <>
                <TextControls />
                <TestCanvas
                  mode={mode}
                  onMode={(m) => patch({ mode: m === 'write' ? null : m })}
                  compare={compare}
                  onCompare={(v) => patch({ compare: v ? '1' : null })}
                  onAllFeatures={() => go('features')}
                />
              </>
            )}
            {tool === 'languages' && (
              <>
                <QuickCheck onGo={(t) => go(t)} />
                <ControlsCard label="إعدادات اللغات">
                  <SizeField min={18} max={64} label="حجم عيّنات اللغات" />
                </ControlsCard>
                <Languages />
              </>
            )}
            {tool === 'features' && (
              <FeaturesTool sub={sub} onSub={(s) => patch({ sub: s === 'live' ? null : s })} onTry={trySample} />
            )}
            {tool === 'letters' && <Letters />}
            {tool === 'marks' && <Marks />}
            {tool === 'waterfall' && <Waterfall />}
            {tool === 'weights' && <Weights />}
            {tool === 'axes' && <Axes />}
            {tool === 'numerals' && <Numerals />}
            {tool === 'glyphs' && <Glyphs />}
            {tool === 'compare' && <Compare />}
            {tool === 'info' && <Info />}
          </div>
        </Suspense>
      </div>
    </div>
  );
}

/* ───────────────────────── بطاقة الخط ───────────────────────── */

const kb = (n: number) => `${(n / 1024).toLocaleString('en-US', { maximumFractionDigits: 1 })} KB`;

/** الخط النشط: اسمه بخطّه، ملفه، جواب الفحص السريع، وتبديل العائلة أو إضافة خطوط */
function FontCard({ onCheck }: { onCheck: () => void }) {
  const { fonts, active, setActive, remove, clear, add, busy, specimen } = useLab();
  const input = useRef<HTMLInputElement>(null);
  const family = useFamily();
  if (!active) return null;
  const families = [...new Map(fonts.map((f) => [f.family, f])).values()];
  const checks = qualityChecks(active);
  const passed = checks.filter((c) => c.ok).length;
  const allOk = passed === checks.length;
  const meta = active.axes.length
    ? 'خط متغيّر'
    : family.length > 1
      ? `${family.length} أنماط · ${styleLabel(active)}`
      : `${styleLabel(active)} · ${active.weight}`;

  return (
    <section aria-label="الخط النشط" className="flex flex-col gap-3 rounded-2xl border bg-card p-4 lg:gap-4 lg:p-5">
      <div className="min-w-0">
        <p className="text-caption text-tertiary max-lg:sr-only">مختبر الخط</p>
        <h1
          dir="ltr"
          title={active.fullName}
          className="truncate text-right text-2xl leading-tight lg:mt-1"
          style={active.previewable ? specimen(active) : undefined}
        >
          {active.family}
        </h1>
        <p className="mt-1.5 text-caption text-muted-foreground">
          <span dir="ltr">{meta}</span>
          <span className="mx-1.5 text-tertiary">·</span>
          <span dir="ltr">
            {active.format} · {kb(active.bytes)}
          </span>
        </p>
        {!active.previewable && (
          <p className="mt-2 text-caption text-warn-text">تحليل فقط — المتصفّح لا يعرض هذا الملف</p>
        )}
      </div>

      {/* الجوال: الفحص والإجراءات في سطر واحد؛ الحاسوب: الفحص بعرض البطاقة ثم الإجراءات تحت فاصل */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* أوّل سؤال بعد الرفع: هل الخط سليم للعربية؟ — الجواب هنا، والتفصيل في «اللغات» */}
        <button
          type="button"
          onClick={onCheck}
          className={cn(
            'inline-flex h-8 basis-full items-center justify-center gap-1.5 rounded-full px-3 text-caption font-medium transition-colors sm:basis-auto lg:h-9 lg:basis-full lg:text-meta',
            allOk ? 'bg-tint-ok text-ok-text hover:bg-ok-500/20' : 'bg-tint-warn text-warn-text hover:bg-warn-500/20',
          )}
        >
          {allOk ? <CheckIcon className="size-4" /> : <ExclamationIcon className="size-4" />}
          الفحص السريع: {passed} من {checks.length}
        </button>
        <span aria-hidden className="hidden basis-full border-t lg:my-2.5 lg:block" />
        {families.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                الخطوط ({families.length})
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
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
    </section>
  );
}

/* ───────────────────────── أدوات الفحص ───────────────────────── */

/** الرقم بجانب كل أداة — جواب سريع قبل فتحها (لغات مدعومة، ميزات، محارف، محاور) */
function useCounts(): Partial<Record<ToolKey, number>> {
  const { active } = useLab();
  return useMemo(() => {
    if (!active) return {};
    const set = new Set(active.codepoints);
    return {
      languages: LANGUAGES.filter((l) => coverage(l, set).status === 'full').length,
      features: new Set(active.features.map((f) => f.tag)).size,
      glyphs: active.glyphCount,
      axes: active.axes.length,
    };
  }, [active]);
}

/**
 * قائمة الأدوات — عمودية في الجانب على الحاسوب، وشريط أفقي يُمرَّر على الجوال.
 * «المحاور المتغيّرة» باهتة للخط الثابت: موجودة في مكانها لكن لا شيء فيها له.
 */
function ToolNav({ current, onGo }: { current: ToolKey; onGo: (t: ToolKey) => void }) {
  const { active } = useLab();
  const counts = useCounts();
  return (
    <nav aria-label="أدوات الفحص" className="min-w-0">
      <p className="mb-2 px-3 text-caption text-tertiary max-lg:sr-only">أدوات الفحص</p>
      <ul className="flex [scrollbar-width:none] gap-1.5 overflow-x-auto max-lg:-mx-4 max-lg:px-4 lg:flex-col lg:gap-0.5 [&::-webkit-scrollbar]:hidden">
        {TOOLS.map((t) => {
          const on = t.key === current;
          const empty = t.key === 'axes' && !active?.axes.length;
          const count = counts[t.key];
          return (
            <li key={t.key} className="shrink-0">
              <button
                type="button"
                aria-current={on ? 'page' : undefined}
                onClick={() => onGo(t.key)}
                title={empty ? 'هذا الخط ثابت — لا محاور فيه' : undefined}
                className={cn(
                  'flex w-full items-center gap-2.5 text-control whitespace-nowrap transition-colors',
                  // الجوال: شرائح؛ الحاسوب: صفوف قائمة
                  'h-9 rounded-full border bg-card px-3.5 lg:h-10 lg:rounded-lg lg:border-transparent lg:bg-transparent lg:px-3',
                  on
                    ? 'border-primary/40 bg-tint-brand font-medium text-primary lg:bg-tint-brand'
                    : 'text-muted-foreground hover:text-foreground lg:hover:bg-sunken',
                  empty && !on && 'text-tertiary',
                )}
              >
                <t.icon filled={on} className="size-4 shrink-0" />
                <span className="lg:flex-1 lg:text-start">{t.label}</span>
                {count !== undefined && count > 0 && (
                  <span
                    dir="ltr"
                    className={cn('text-caption tabular-nums max-lg:hidden', on ? 'text-primary' : 'text-tertiary')}
                  >
                    {count.toLocaleString('en-US')}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
