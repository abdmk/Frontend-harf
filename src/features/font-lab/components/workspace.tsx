import { lazy, type ReactNode, Suspense, useRef } from 'react';
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
import {
  CheckIcon,
  ChevronDownIcon,
  CrossSmallIcon,
  ExclamationIcon,
  PlusIcon,
  RefreshIcon,
  SlidersIcon,
  TextIcon,
} from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/cn';

import { RangeControl } from './bits';
import { qualityChecks } from './tools/overview';
import { ALIGN, PRESETS, SWATCHES } from './tools/sample';
import { GLYPH_SUBS, glyphSubByKey, routeOfTool, type ToolKey, type ViewKey, viewByKey, VIEWS } from '../data/tools';
import { useLab } from '../hooks/lab-context';
import type { LabFont } from '../types';
import { ACCEPT } from '../utils/load';

const lazyView = <K extends string>(load: () => Promise<Record<K, () => React.JSX.Element | null>>, name: K) =>
  lazy(() => load().then((m) => ({ default: m[name] })));

const Sample = lazyView(() => import('./tools/sample'), 'Sample');
const Weights = lazyView(() => import('./tools/weights'), 'Weights');
const Waterfall = lazyView(() => import('./tools/waterfall'), 'Waterfall');
const Letters = lazyView(() => import('./tools/letters'), 'Letters');
const Marks = lazyView(() => import('./tools/marks'), 'Marks');
const Numerals = lazyView(() => import('./tools/numerals'), 'Numerals');
const Glyphs = lazyView(() => import('./tools/glyphs'), 'Glyphs');
const Languages = lazyView(() => import('./tools/languages'), 'Languages');
const Features = lazyView(() => import('./tools/features'), 'Features');
const Compare = lazyView(() => import('./tools/compare'), 'Compare');
const Info = lazyView(() => import('./tools/info'), 'Info');
const QuickCheck = lazy(() => import('./tools/overview').then((m) => ({ default: m.QuickCheck })));

/** حالة المشهد في الرابط (?view=&sub=) — قابلة للمشاركة، و?tool= القديم يُترجم */
function useView() {
  const [params, setParams] = useSearchParams();
  const legacy = params.get('tool') as ToolKey | null;
  const fromLegacy = legacy ? routeOfTool(legacy) : null;
  const view = viewByKey(params.get('view') ?? fromLegacy?.view ?? null).key;
  const sub = glyphSubByKey(params.get('sub') ?? fromLegacy?.sub ?? null);
  const go = (next: ViewKey, nextSub?: string) =>
    setParams(
      (p) => {
        const n = new URLSearchParams(p);
        n.delete('tool');
        if (next === 'preview') n.delete('view');
        else n.set('view', next);
        if (nextSub) n.set('sub', nextSub);
        else n.delete('sub');
        return n;
      },
      { replace: true },
    );
  return { view, sub, go };
}

/**
 * مساحة عمل المختبر بعد الرفع — المعاينة أولاً، وكل شيء يتبع نصّك:
 * رأس بالخط نفسه وملخّصه، شريط ثابت (النص، النمط، الحجم، المزيد) يطبَّق على كل المشاهد،
 * ثم خمسة مشاهد بعرض الصفحة كاملاً بدل اثنتي عشرة صفحة خلف قائمة جانبية.
 */
export function Workspace() {
  const { view, sub, go } = useView();
  const tabs = useRef<HTMLDivElement>(null);
  const open = (v: ViewKey, s?: string) => {
    go(v, s);
    tabs.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
  const goTool = (tool: ToolKey) => {
    const r = routeOfTool(tool);
    open(r.view, r.sub);
  };

  return (
    <div className="pb-16">
      <FontHeader onCheck={() => open('support')} />
      <TypeBar />
      <div ref={tabs} className="scroll-mt-44">
        <ViewTabs current={view} onGo={(v) => open(v)} />
      </div>
      <section aria-labelledby="lab-view-title" className="pt-6">
        <h2 id="lab-view-title" className="sr-only">
          {viewByKey(view).label}
        </h2>
        <p className="mb-5 text-meta text-muted-foreground">{viewByKey(view).lead}</p>
        <Suspense fallback={<LoadingState label="جارٍ فتح القسم…" />}>
          <div key={`${view}-${sub}`} className="animate-fade-up">
            {view === 'preview' && <PreviewView />}
            {view === 'glyphs' && <GlyphsView sub={sub} onSub={(s) => go('glyphs', s)} />}
            {view === 'support' && <SupportView onGoTool={goTool} />}
            {view === 'compare' && <Compare />}
            {view === 'file' && <Info />}
          </div>
        </Suspense>
      </section>
    </div>
  );
}

/* ───────────────────────── الرأس ───────────────────────── */

/** أنماط عائلة الخط النشط بترتيب الوزن — ما يختار منه الشريط */
function useFamily() {
  const { fonts, active } = useLab();
  const family = active ? fonts.filter((f) => f.family === active.family) : [];
  return family.sort((a, b) => a.weight - b.weight || Number(a.italic) - Number(b.italic));
}

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
    active.axes.length
      ? 'خط متغيّر'
      : family.length > 1
        ? `${family.length} أنماط`
        : `${active.style} ${active.weight}`,
    active.format,
    `${active.glyphCount.toLocaleString('en-US')} محرفاً`,
    `${active.features.length} ميزة OpenType`,
  ];

  return (
    <header className="flex flex-col gap-5 pt-8 pb-6 sm:pt-10 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-caption text-tertiary">مختبر الخط</p>
        <h1
          dir="ltr"
          title={active.fullName}
          className="mt-1 truncate text-right text-4xl leading-tight sm:text-5xl"
          style={active.previewable ? specimen(active) : undefined}
        >
          {active.family}
        </h1>
        <p className="mt-2 flex flex-wrap gap-x-2 text-meta text-muted-foreground">
          {meta.map((m, i) => (
            <span key={m}>
              {i > 0 && <span className="me-2 text-tertiary">·</span>}
              {m}
            </span>
          ))}
        </p>
        {!active.previewable && (
          <p className="mt-2 text-caption text-warn-text">تحليل فقط — المتصفّح لا يعرض هذا الملف</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* أوّل سؤال بعد الرفع: هل الخط سليم للعربية؟ — الجواب هنا، والتفصيل في «الدعم» */}
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
          أضف خطوطاً
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

/* ───────────────────────── الشريط ───────────────────────── */

/** اسم النمط مختصراً للشريحة: «SemiBold» لا «Graphik Arabic SemiBold» */
const styleLabel = (f: LabFont) => (f.italic && !/italic/i.test(f.style) ? `${f.style} Italic` : f.style);

/**
 * شريط واحد ثابت فوق كل المشاهد: النص (مع عيّنات جاهزة)، النمط من ملفات العائلة الحقيقية،
 * الحجم، و«المزيد» لما يُضبط أقلّ. يتغيّر مرّة ويتبعه كل مشهد.
 */
function TypeBar() {
  const { active, settings: s, set, setActive } = useLab();
  const family = useFamily();
  if (!active) return null;
  const wght = active.axes.find((a) => a.tag === 'wght');

  return (
    <div className="sticky top-28 z-30 -mx-2 lg:top-20">
      <div
        role="toolbar"
        aria-label="إعدادات المعاينة"
        className="flex flex-col gap-2 rounded-2xl border bg-card/95 p-2 shadow-soft backdrop-blur-md lg:flex-row lg:items-center"
      >
        {/* النص — أهمّ عنصر: يكتب المستخدم نصّه فيراه في كل مكان */}
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <Input
            aria-label="نصّ المعاينة"
            value={s.text}
            onChange={(e) => set({ text: e.target.value.slice(0, 2000) })}
            placeholder="اكتب نصّك…"
            className="h-10 min-w-0 flex-1 rounded-full border-transparent bg-sunken px-4 text-control"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="shrink-0">
                <TextIcon />
                <span className="max-sm:sr-only">عيّنات</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>نصوص جاهزة</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={s.text} onValueChange={(text) => set({ text })}>
                {PRESETS.map(([label, text]) => (
                  <DropdownMenuRadioItem key={label} value={text}>
                    {label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* الجوال: الأنماط صفّ يتمرّر وحده، والحجم و«المزيد» ظاهران تحته — لا يختبئان في آخر التمرير */}
        <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
          {/* النمط: ملفات العائلة الحقيقية — أو محور الوزن للخط المتغيّر */}
          {wght ? (
            <BarField label="الوزن" value={s.axes.wght ?? wght.default}>
              <Slider
                aria-label="الوزن"
                className="w-28 max-lg:flex-1"
                value={[s.axes.wght ?? wght.default]}
                min={wght.min}
                max={wght.max}
                onValueChange={([v]) => v !== undefined && set({ axes: { ...s.axes, wght: v } })}
              />
            </BarField>
          ) : family.length > 1 ? (
            <div
              role="radiogroup"
              aria-label="النمط"
              className="flex shrink-0 [scrollbar-width:none] gap-0.5 overflow-x-auto rounded-full bg-sunken p-1 max-lg:w-full [&::-webkit-scrollbar]:hidden"
            >
              {family.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="radio"
                  aria-checked={f.id === active.id}
                  title={`${f.style} · ${f.weight}`}
                  onClick={() => setActive(f.id)}
                  dir="ltr"
                  className="h-8 rounded-full px-3 text-caption whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground aria-checked:bg-card aria-checked:font-medium aria-checked:text-foreground aria-checked:shadow-soft"
                >
                  {styleLabel(f)}
                </button>
              ))}
            </div>
          ) : null}

          <BarField label="الحجم" value={`${s.size}px`}>
            <Slider
              aria-label="الحجم"
              className="w-28 max-lg:flex-1"
              value={[s.size]}
              min={12}
              max={200}
              onValueChange={([v]) => v !== undefined && set({ size: v })}
            />
          </BarField>

          <MoreSettings />
        </div>
      </div>
    </div>
  );
}

function BarField({ label, value, children }: { label: string; value: ReactNode; children: ReactNode }) {
  return (
    <div className="flex h-10 shrink-0 items-center gap-3 rounded-full bg-sunken px-4 max-lg:flex-1">
      <span className="text-caption text-muted-foreground">{label}</span>
      {children}
      <span dir="ltr" className="w-12 text-caption font-medium tabular-nums">
        {value}
      </span>
    </div>
  );
}

/** ما يُضبط أقلّ: التباعد، العرض، المحاذاة، الألوان — خلف «المزيد» كي يبقى الشريط هادئاً */
function MoreSettings() {
  const { settings: s, set, resetSettings } = useLab();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-10 shrink-0 rounded-full">
          <SlidersIcon />
          المزيد
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-80 flex-col gap-5 p-5">
        <RangeControl
          label="ارتفاع السطر"
          unit=""
          value={s.lineHeight}
          min={0.9}
          max={3}
          step={0.1}
          onChange={(lineHeight) => set({ lineHeight })}
        />
        <RangeControl
          label="تباعد الحروف"
          value={s.letterSpacing}
          min={-5}
          max={20}
          onChange={(letterSpacing) => set({ letterSpacing })}
        />
        <RangeControl
          label="تباعد الكلمات"
          value={s.wordSpacing}
          min={-10}
          max={40}
          onChange={(wordSpacing) => set({ wordSpacing })}
        />
        <RangeControl
          label="عرض النص"
          unit="%"
          value={s.width}
          min={30}
          max={100}
          onChange={(width) => set({ width })}
        />
        <div className="flex items-center justify-between gap-3">
          <div role="group" aria-label="المحاذاة" className="flex gap-1 rounded-full bg-sunken p-1">
            {ALIGN.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                aria-label={label}
                title={label}
                aria-pressed={s.align === value}
                onClick={() => set({ align: value })}
                className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-soft"
              >
                <Icon filled="auto" className="size-4" />
              </button>
            ))}
          </div>
          <div role="group" aria-label="الألوان" className="flex items-center gap-1">
            {SWATCHES.map((w) => (
              <button
                key={w.label}
                type="button"
                title={w.label}
                aria-label={w.label}
                aria-pressed={s.color === w.color && s.background === w.background}
                onClick={() => set({ color: w.color, background: w.background })}
                className="grid size-7 place-items-center rounded-full border text-caption font-semibold aria-pressed:ring-2 aria-pressed:ring-primary aria-pressed:ring-offset-1 aria-pressed:ring-offset-card"
                style={{ color: w.color || undefined, background: w.background || undefined }}
              >
                ب
              </button>
            ))}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={resetSettings} className="self-start">
          <RefreshIcon />
          الإعدادات الافتراضية
        </Button>
      </PopoverContent>
    </Popover>
  );
}

/* ───────────────────────── المشاهد ───────────────────────── */

const TAB =
  'relative inline-flex h-12 shrink-0 items-center gap-2 px-1 text-control whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:font-semibold aria-[current=page]:text-foreground aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-0 aria-[current=page]:after:bottom-0 aria-[current=page]:after:h-0.5 aria-[current=page]:after:rounded-full aria-[current=page]:after:bg-primary-fill';

function ViewTabs({ current, onGo }: { current: ViewKey; onGo: (v: ViewKey) => void }) {
  const { fonts } = useLab();
  return (
    <nav
      aria-label="أقسام المختبر"
      className="mt-4 flex [scrollbar-width:none] gap-6 overflow-x-auto border-b [&::-webkit-scrollbar]:hidden"
    >
      {VIEWS.map((v) => (
        <button
          key={v.key}
          type="button"
          aria-current={v.key === current ? 'page' : undefined}
          onClick={() => onGo(v.key)}
          className={TAB}
        >
          <v.icon filled={v.key === current} className="size-4" />
          {v.label}
          {v.key === 'compare' && fonts.length > 1 && (
            <span className="rounded-full bg-sunken px-1.5 text-caption tabular-nums">{fonts.length}</span>
          )}
        </button>
      ))}
    </nav>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-3 text-base font-semibold">{children}</h3>;
}

/** المعاينة: نصّك كبيراً، ثم أنماط العائلة به، ثم تدرّج الأحجام — صفحة عيّنة كاملة في تمريرة واحدة */
function PreviewView() {
  return (
    <div className="flex flex-col gap-10">
      <Sample />
      <div>
        <SectionTitle>الأنماط والأوزان</SectionTitle>
        <Weights />
      </div>
      <div>
        <SectionTitle>تدرّج الأحجام</SectionTitle>
        <Waterfall />
      </div>
    </div>
  );
}

const SUB_TAB =
  'inline-flex h-9 shrink-0 items-center rounded-full px-4 text-control whitespace-nowrap text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground aria-pressed:bg-foreground aria-pressed:font-medium aria-pressed:text-background';

function GlyphsView({ sub, onSub }: { sub: string; onSub: (s: string) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div role="group" aria-label="أقسام الحروف" className="flex [scrollbar-width:none] gap-1 overflow-x-auto">
        {GLYPH_SUBS.map((g) => (
          <button
            key={g.key}
            type="button"
            aria-pressed={g.key === sub}
            onClick={() => onSub(g.key)}
            className={SUB_TAB}
          >
            {g.label}
          </button>
        ))}
      </div>
      {sub === 'letters' && <Letters />}
      {sub === 'marks' && <Marks />}
      {sub === 'numerals' && <Numerals />}
      {sub === 'glyphs' && <Glyphs />}
    </div>
  );
}

/** الدعم: الجواب أولاً (فحص سريع)، ثم التفصيل — اللغات، ثم ميزات OpenType */
function SupportView({ onGoTool }: { onGoTool: (t: ToolKey) => void }) {
  return (
    <div className="flex flex-col gap-10">
      <QuickCheck onGo={onGoTool} />
      <div>
        <SectionTitle>اللغات</SectionTitle>
        <Languages />
      </div>
      <div id="lab-features">
        <SectionTitle>ميزات OpenType</SectionTitle>
        <Features />
      </div>
    </div>
  );
}
