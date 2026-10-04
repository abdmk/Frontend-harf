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
import { CheckIcon, ChevronDownIcon, CrossSmallIcon, ExclamationIcon, PlusIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

import { TestCanvas } from './canvas';
import { Inspector, type InspectorTab, useFamily } from './inspector';
import { qualityChecks } from './tools/overview';
import { GLYPH_SUBS, glyphSubByKey, routeOfTool, type ToolKey, type ViewKey, viewByKey, VIEWS } from '../data/tools';
import { useLab } from '../hooks/lab-context';
import { ACCEPT } from '../utils/load';

const lazyView = <P extends object, K extends string>(
  load: () => Promise<Record<K, (p: P) => React.JSX.Element | null>>,
  name: K,
) => lazy(() => load().then((m) => ({ default: m[name] })));

const Weights = lazyView(() => import('./tools/weights'), 'Weights');
const Waterfall = lazyView(() => import('./tools/waterfall'), 'Waterfall');
const Features = lazyView(() => import('./tools/features'), 'Features');
const Letters = lazyView(() => import('./tools/letters'), 'Letters');
const Marks = lazyView(() => import('./tools/marks'), 'Marks');
const Numerals = lazyView(() => import('./tools/numerals'), 'Numerals');
const Glyphs = lazyView(() => import('./tools/glyphs'), 'Glyphs');
const Languages = lazyView(() => import('./tools/languages'), 'Languages');
const Compare = lazyView(() => import('./tools/compare'), 'Compare');
const Info = lazyView(() => import('./tools/info'), 'Info');
const QuickCheck = lazy(() => import('./tools/overview').then((m) => ({ default: m.QuickCheck })));

/** حالة الصفحة في الرابط — قابلة للمشاركة: ?panel=ot (المفتش)، ?view=&sub= (التحليل)، و?tool= القديم يُترجم */
function usePageState() {
  const [params, setParams] = useSearchParams();
  const legacy = params.get('tool') as ToolKey | null;
  const fromLegacy = legacy ? routeOfTool(legacy) : null;
  const view = viewByKey(params.get('view') ?? fromLegacy?.view ?? null).key;
  const sub = glyphSubByKey(params.get('sub') ?? fromLegacy?.sub ?? null);
  const panel: InspectorTab = params.get('panel') === 'ot' || legacy === 'features' ? 'ot' : 'text';
  const patch = (next: Record<string, string | null>) =>
    setParams(
      (p) => {
        const n = new URLSearchParams(p);
        n.delete('tool');
        for (const [k, v] of Object.entries(next)) {
          if (v === null) n.delete(k);
          else n.set(k, v);
        }
        return n;
      },
      { replace: true },
    );
  return { view, sub, panel, patch };
}

/**
 * مساحة اختبار الخط — أداة مصمّمين لا لوحة تحكّم:
 * لوحة الاختبار هي البطل، وبجانبها مفتش واحد بتبويبين (النص، OpenType) — كل تغيير بجانب ما يتغيّر.
 * التحليل المفصّل تحتهما بهدوء، لمن يريد أن يتعمّق.
 */
export function Workspace() {
  const { view, sub, panel, patch } = usePageState();
  const { set, settings } = useLab();
  const analysis = useRef<HTMLDivElement>(null);
  const toCanvas = () => document.getElementById('lab-canvas')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const openView = (v: ViewKey, s?: string) => {
    patch({ view: v === 'styles' ? null : v, sub: s ?? null });
    analysis.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const goTool = (tool: ToolKey) => {
    const r = routeOfTool(tool);
    openView(r.view, r.sub);
  };
  const [compare, setCompare] = useCompare();

  return (
    <div className="pb-16">
      <FontHeader onCheck={() => openView('support')} />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <TestCanvas compare={compare} onCompare={setCompare} />
        <div className="lg:sticky lg:top-22 lg:max-h-[calc(100dvh-6.5rem)] lg:overflow-y-auto lg:overscroll-contain">
          <Inspector tab={panel} onTab={(t) => patch({ panel: t === 'ot' ? 'ot' : null })} onTry={toCanvas} />
        </div>
      </div>

      <section ref={analysis} aria-labelledby="lab-analysis-title" className="mt-16 scroll-mt-20">
        <h2 id="lab-analysis-title" className="text-xl font-semibold">
          تحليل الخط
        </h2>
        <AnalysisTabs current={view} onGo={(v) => openView(v)} />
        <p className="mt-5 mb-5 text-meta text-muted-foreground">{viewByKey(view).lead}</p>
        <Suspense fallback={<LoadingState label="جارٍ فتح القسم…" />}>
          <div key={`${view}-${sub}`} className="animate-fade-up">
            {view === 'styles' && <StylesView />}
            {view === 'opentype' && (
              <Features
                onTry={(tag, sample) => {
                  set({ text: sample, features: { ...settings.features, [tag]: true } });
                  patch({ panel: 'ot' });
                  toCanvas();
                }}
              />
            )}
            {view === 'glyphs' && <GlyphsView sub={sub} onSub={(s) => patch({ view: 'glyphs', sub: s })} />}
            {view === 'support' && <SupportView onGoTool={goTool} />}
            {view === 'compare' && <Compare />}
            {view === 'file' && <Info />}
          </div>
        </Suspense>
      </section>
    </div>
  );
}

/** «قبل / بعد» يُطفأ تلقائياً حين لا تبقى ميزات مغيّرة (اللوحة تعرض نصاً واحداً حينها) */
function useCompare(): [boolean, (v: boolean) => void] {
  const [params, setParams] = useSearchParams();
  return [
    params.get('compare') === '1',
    (v) =>
      setParams(
        (p) => {
          const n = new URLSearchParams(p);
          if (v) n.set('compare', '1');
          else n.delete('compare');
          return n;
        },
        { replace: true },
      ),
  ];
}

/* ───────────────────────── الرأس ───────────────────────── */

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

/* ───────────────────────── التحليل ───────────────────────── */

const TAB =
  'relative inline-flex h-12 shrink-0 items-center gap-2 px-1 text-control whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:font-semibold aria-[current=page]:text-foreground aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-0 aria-[current=page]:after:bottom-0 aria-[current=page]:after:h-0.5 aria-[current=page]:after:rounded-full aria-[current=page]:after:bg-primary-fill';

function AnalysisTabs({ current, onGo }: { current: ViewKey; onGo: (v: ViewKey) => void }) {
  return (
    <nav
      aria-label="أقسام المختبر"
      className="mt-2 flex [scrollbar-width:none] gap-6 overflow-x-auto border-b [&::-webkit-scrollbar]:hidden"
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
        </button>
      ))}
    </nav>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-3 text-base font-semibold">{children}</h3>;
}

function StylesView() {
  return (
    <div className="flex flex-col gap-10">
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

/** الدعم: الجواب أولاً (فحص سريع)، ثم اللغات */
function SupportView({ onGoTool }: { onGoTool: (t: ToolKey) => void }) {
  return (
    <div className="flex flex-col gap-10">
      <QuickCheck onGo={onGoTool} />
      <div>
        <SectionTitle>اللغات</SectionTitle>
        <Languages />
      </div>
    </div>
  );
}
