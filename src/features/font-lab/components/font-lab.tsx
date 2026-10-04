import { Fragment, lazy, Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';

import { Dropzone } from '@/components/shared/dropzone';
import { LoadingState } from '@/components/shared/loading-state';
import { sideNavIcon, sideNavRow } from '@/components/shared/side-nav';
import { ToolTips } from '@/components/shared/tool-tips';
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
  ChevronDownIcon,
  CrossSmallIcon,
  FolderIcon,
  GlobeIcon,
  LayersIcon,
  PlusIcon,
  ShieldCheckIcon,
  SlidersIcon,
  TextIcon,
} from '@/components/ui/icons';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/cn';

import { libraryPackage } from '../api/library';
import { TOOL_GROUPS, type ToolKey, toolByKey, TOOLS } from '../data/tools';
import { LabProvider, useLab } from '../hooks/lab-context';
import type { LabFont } from '../types';
import { ACCEPT } from '../utils/load';

const TOOL_VIEWS: Record<ToolKey, React.LazyExoticComponent<() => React.JSX.Element | null>> = {
  overview: lazy(() => import('./tools/overview').then((m) => ({ default: m.Overview }))),
  sample: lazy(() => import('./tools/sample').then((m) => ({ default: m.Sample }))),
  waterfall: lazy(() => import('./tools/waterfall').then((m) => ({ default: m.Waterfall }))),
  weights: lazy(() => import('./tools/weights').then((m) => ({ default: m.Weights }))),
  letters: lazy(() => import('./tools/letters').then((m) => ({ default: m.Letters }))),
  marks: lazy(() => import('./tools/marks').then((m) => ({ default: m.Marks }))),
  numerals: lazy(() => import('./tools/numerals').then((m) => ({ default: m.Numerals }))),
  glyphs: lazy(() => import('./tools/glyphs').then((m) => ({ default: m.Glyphs }))),
  languages: lazy(() => import('./tools/languages').then((m) => ({ default: m.Languages }))),
  features: lazy(() => import('./tools/features').then((m) => ({ default: m.Features }))),
  compare: lazy(() => import('./tools/compare').then((m) => ({ default: m.Compare }))),
  info: lazy(() => import('./tools/info').then((m) => ({ default: m.Info }))),
};

/** «مختبر الخط»: كل الملفات تُقرأ في المتصفّح — لا يُرفع شيء إلى الخادم */
export function FontLab({ hero }: { hero: React.ReactNode }) {
  return (
    <LabProvider>
      <LabBody hero={hero} />
    </LabProvider>
  );
}

function LabBody({ hero }: { hero: React.ReactNode }) {
  const { active, addFromLibrary, fonts } = useLab();
  const [params] = useSearchParams();

  // ?font=cairo يفتح المختبر بخط من مكتبة حرف (رابط قابل للمشاركة)
  const requested = params.get('font');
  const tried = useRef<string | null>(null);
  useEffect(() => {
    if (!requested || tried.current === requested || fonts.length) return;
    tried.current = requested;
    const pkg = libraryPackage(requested);
    if (pkg) void addFromLibrary(pkg.id, pkg.url, pkg.name);
  }, [requested, fonts.length, addFromLibrary]);

  // بعد الرفع يختفي الـHero كاملاً وتصير الصفحة مساحة عمل
  return active ? (
    <Workbench />
  ) : (
    <div className="py-10 sm:py-14">
      {hero}
      <Empty />
    </div>
  );
}

/* ───────────────────────── الحالة الأولى ───────────────────────── */

/** ما يكشفه المختبر — كل بطاقة أداة حقيقية فيه */
const LAB_TIPS = [
  { icon: LayersIcon, title: 'العائلة كاملة', text: 'حمّل كل الأوزان لترى الحقيقية منها وتقارن بينها.' },
  { icon: TextIcon, title: 'اختبر بنصّك', text: 'اكتب نصّك وشاهده بكل وزن وحجم قبل أن تشتري أو تستخدم.' },
  { icon: GlobeIcon, title: 'اللغات والحروف', text: 'أي لغات يدعمها الخط، وما الحروف الناقصة منها.' },
  { icon: SlidersIcon, title: 'المحاور المتغيّرة', text: 'يقرأ الخطوط المتغيّرة ويتيح تحريك محاورها مباشرة.' },
  { icon: ShieldCheckIcon, title: 'ملفاتك في جهازك', text: 'القراءة والتحليل داخل المتصفّح، لا تُرفع إلى أي خادم.' },
] as const;

function Empty() {
  const { add, busy } = useLab();
  const folder = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Dropzone
          feature
          formats={['OTF', 'TTF', 'TTC', 'WOFF', 'WOFF2', 'ZIP']}
          onFiles={(f) => void add(f)}
          accept={ACCEPT}
          multiple
          title="أفلت ملفات الخطوط هنا"
          hint="ملف واحد، عائلة كاملة، أو ملف ZIP"
          browseLabel="اختر ملفات"
          actions={
            <Button variant="outline" size="lg" shape="pill" onClick={() => folder.current?.click()}>
              <FolderIcon />
              اختر مجلّداً
            </Button>
          }
        />
        <input
          ref={folder}
          type="file"
          hidden
          multiple
          // مجلّد عائلة كاملة
          {...({ webkitdirectory: '' } as Record<string, string>)}
          onChange={(e) => {
            if (e.target.files?.length) void add(e.target.files);
            e.target.value = '';
          }}
        />
        {busy && (
          <div
            role="status"
            className="absolute inset-0 grid place-items-center rounded-2xl bg-card/85 text-control font-medium"
          >
            <span className="flex items-center gap-2">
              <Spinner /> جارٍ قراءة الملفات…
            </span>
          </div>
        )}
      </div>

      <ToolTips id="lab-tips" title="ما يكشفه المختبر" tips={LAB_TIPS} />
    </div>
  );
}

/* ───────────────────────── مساحة العمل ───────────────────────── */

/**
 * بعد الرفع: مساحة عمل بلغة صفحات الحساب والاستوديو — لا Hero ولا عناصر تسويقية.
 * عمود جانبي ثابت (بطاقة الخط ثم الأقسام بصفوف القائمة نفسها)، ورأس داخلي بسيط، ثم محتوى القسم.
 */
function Workbench() {
  const [params, setParams] = useSearchParams();
  const tool = toolByKey(params.get('tool'));
  const View = TOOL_VIEWS[tool.key];
  const go = (key: ToolKey) => {
    setParams(
      (p) => {
        const n = new URLSearchParams(p);
        if (key === 'overview') n.delete('tool');
        else n.set('tool', key);
        return n;
      },
      { replace: true },
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 py-6 sm:py-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10 lg:py-10">
      <aside className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-26 lg:max-h-[calc(100dvh-8rem)] lg:self-start lg:overflow-y-auto">
        <FontCard />
        <ToolNav current={tool.key} onGo={go} />
      </aside>

      <section aria-labelledby="lab-tool-title" className="flex min-w-0 flex-col">
        <header className="mb-6">
          <p className="text-caption text-tertiary">مختبر الخط</p>
          <h1 id="lab-tool-title" key={tool.key} className="mt-1 animate-fade-up text-2xl font-semibold">
            {tool.label}
          </h1>
          <p className="mt-1 text-meta text-muted-foreground">{tool.lead}</p>
        </header>
        <Suspense fallback={<LoadingState label="جارٍ فتح القسم…" />}>
          <View key={tool.key} />
        </Suspense>
      </section>
    </div>
  );
}

/** «Aa / أب» بالخط نفسه — هويّة الخط في البطاقة مكان صورة المستخدم */
function FontMark({ font, className }: { font: LabFont; className?: string }) {
  const { specimen } = useLab();
  return (
    <span
      aria-hidden
      style={font.previewable ? specimen(font) : undefined}
      className={cn('grid shrink-0 place-items-center rounded-md bg-card leading-none', className)}
    >
      أب
    </span>
  );
}

/**
 * بطاقة الخط: الخط النشط واسم عائلته وتفاصيله المختصرة، والتبديل بين الخطوط المحمّلة من قائمة
 * (لا قائمة طويلة تدفع الأقسام للأسفل)، ثم «أضف خطوطاً» و«ابدأ من جديد».
 */
function FontCard() {
  const { fonts, active, setActive, remove, clear, add, busy } = useLab();
  const input = useRef<HTMLInputElement>(null);
  if (!active) return null;
  const family = fonts.filter((f) => f.family === active.family).length;
  const meta = [
    active.axes.length ? 'متغيّر' : `${active.style} ${active.weight}`,
    active.format,
    family > 1 ? `${family} أنماط` : null,
  ].filter(Boolean);

  return (
    <section aria-label="الخط الحالي" className="flex flex-col gap-3 rounded-lg bg-sunken p-4 lg:p-5">
      <div className="flex items-center gap-4">
        <FontMark font={active} className="size-14 text-2xl" />
        <div className="min-w-0 flex-1">
          <p dir="ltr" className="truncate text-end text-base font-semibold" title={active.fullName}>
            {active.family}
          </p>
          <p dir="ltr" className="mt-0.5 truncate text-end text-meta text-muted-foreground">
            {meta.join(' · ')}
          </p>
          {!active.previewable && (
            <p className="mt-1 text-caption text-warn-text">تحليل فقط — المتصفّح لا يعرض هذا الملف</p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {fonts.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 justify-between bg-card">
                <span>
                  الخطوط المحمّلة <span className="text-tertiary tabular-nums">({fonts.length})</span>
                </span>
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-80 w-72 overflow-y-auto">
              <DropdownMenuLabel>بدّل الخط</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={active.id} onValueChange={setActive}>
                {fonts.map((f) => (
                  <DropdownMenuRadioItem key={f.id} value={f.id} className="flex items-center gap-3">
                    <span dir="ltr" className="min-w-0 flex-1 truncate text-end">
                      {f.family === active.family ? f.style : f.fullName}
                    </span>
                    <span className="text-caption text-tertiary tabular-nums">{f.weight}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => remove(active.id)}>
                <CrossSmallIcon />
                إزالة {active.style} من المختبر
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Button
          variant="outline"
          size="sm"
          className={cn('bg-card', fonts.length === 1 && 'flex-1')}
          loading={busy}
          onClick={() => input.current?.click()}
        >
          <PlusIcon />
          أضف خطوطاً
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
      <button
        type="button"
        onClick={clear}
        className="self-start text-caption text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        ابدأ من جديد بخط آخر
      </button>
    </section>
  );
}

const TAB =
  'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-control whitespace-nowrap text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground aria-[current=page]:bg-foreground aria-[current=page]:font-medium aria-[current=page]:text-background';

/** الأقسام: صفوف القائمة الجانبية نفسها في الحساب والاستوديو، وشريط أفقي على الجوال */
function ToolNav({ current, onGo }: { current: ToolKey; onGo: (k: ToolKey) => void }) {
  const { active } = useLab();
  return (
    <>
      <nav aria-label="أقسام المختبر" className="flex flex-col max-lg:hidden">
        {TOOL_GROUPS.map((g, i) => (
          <Fragment key={g.label || 'top'}>
            {i > 0 && <hr className="my-3 border-border" />}
            {g.label && <p className="px-4 pb-1.5 text-caption text-tertiary">{g.label}</p>}
            <ul className="flex flex-col gap-0.5">
              {g.tools.map((t) => {
                const on = t.key === current;
                const count = active && t.count?.(active);
                return (
                  <li key={t.key}>
                    <button
                      type="button"
                      aria-current={on ? 'page' : undefined}
                      onClick={() => onGo(t.key)}
                      className={cn(sideNavRow(on, 'sm'), 'w-full')}
                    >
                      <t.icon filled={on} className={sideNavIcon(on, 'sm')} />
                      <span className="flex-1 text-start">{t.label}</span>
                      {count ? (
                        <span dir="ltr" className="text-caption text-muted-foreground tabular-nums">
                          {count}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </Fragment>
        ))}
      </nav>

      <nav
        aria-label="أقسام المختبر"
        className="-mx-4 flex [scrollbar-width:none] gap-1 overflow-x-auto px-4 lg:hidden [&::-webkit-scrollbar]:hidden"
      >
        {TOOLS.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-current={t.key === current ? 'page' : undefined}
            onClick={() => onGo(t.key)}
            className={TAB}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </>
  );
}
