import { lazy, Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';

import { Dropzone } from '@/components/shared/dropzone';
import { LoadingState } from '@/components/shared/loading-state';
import { Button } from '@/components/ui/button';
import { CheckIcon, CrossSmallIcon, FolderIcon, PlusIcon } from '@/components/ui/icons';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/cn';

import { libraryPackage } from '../api/library';
import { TOOL_GROUPS, type ToolKey, toolByKey, TOOLS } from '../data/tools';
import { LabProvider, useLab } from '../hooks/lab-context';
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
export function FontLab() {
  return (
    <LabProvider>
      <LabBody />
    </LabProvider>
  );
}

function LabBody() {
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

  return active ? <Workbench /> : <Empty />;
}

/* ───────────────────────── الحالة الأولى ───────────────────────── */

function Empty() {
  const { add, busy } = useLab();
  const folder = useRef<HTMLInputElement>(null);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
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

      <ul className="grid gap-3 text-caption text-muted-foreground sm:grid-cols-3">
        {[
          'يقرأ الخطوط المتغيّرة ويتيح تحريك محاورها.',
          'حمّل العائلة كاملة لترى الأوزان الحقيقية وتقارن بينها.',
          'اثنا عشر فحصاً: اللغات، الميزات، الأشكال، التشكيل، المحارف وغيرها.',
        ].map((t) => (
          <li key={t} className="flex gap-2 rounded-md bg-sunken p-3">
            <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-ok-text" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────────────────────── مساحة العمل ───────────────────────── */

function Workbench() {
  const [params, setParams] = useSearchParams();
  const tool = toolByKey(params.get('tool'));
  const View = TOOL_VIEWS[tool.key];
  const go = (key: ToolKey) =>
    setParams(
      (p) => {
        const n = new URLSearchParams(p);
        if (key === 'overview') n.delete('tool');
        else n.set('tool', key);
        return n;
      },
      { replace: true },
    );

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-8">
      <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-24">
        <FontShelf />
        <ToolNav current={tool.key} onGo={go} />
      </aside>

      <div className="flex min-w-0 flex-col gap-5">
        <header className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">{tool.label}</h2>
          <p className="text-meta text-muted-foreground">{tool.lead}</p>
        </header>
        <Suspense fallback={<LoadingState label="جارٍ فتح الأداة…" />}>
          <View key={tool.key} />
        </Suspense>
      </div>
    </div>
  );
}

/** رفّ الخطوط: الخط النشط، وبقية الخطوط المحمّلة، وإضافة المزيد */
function FontShelf() {
  const { fonts, active, setActive, remove, add, busy } = useLab();
  const input = useRef<HTMLInputElement>(null);
  if (!active) return null;
  return (
    <section aria-label="الخطوط المحمّلة" className="rounded-xl border bg-card p-2">
      <ul className="flex flex-col gap-0.5">
        {fonts.map((f) => {
          const on = f.id === active.id;
          return (
            <li key={f.id} className="group/f relative">
              <button
                type="button"
                aria-pressed={on}
                onClick={() => setActive(f.id)}
                className={cn(
                  'flex w-full flex-col items-start rounded-lg px-3 py-2.5 pe-9 text-start transition-colors',
                  on ? 'bg-tint-brand' : 'hover:bg-sunken',
                )}
              >
                <span dir="ltr" className={cn('w-full truncate text-control font-semibold', on && 'text-primary')}>
                  {f.fullName}
                </span>
                {!f.previewable && (
                  <span className="text-caption text-warn-text">تحليل فقط — المتصفّح لا يعرض هذا الملف</span>
                )}
                <span className="text-caption text-muted-foreground">
                  {f.format} · {f.axes.length ? 'متغيّر' : `وزن ${f.weight}`} ·{' '}
                  <span dir="ltr">{(f.bytes / 1024).toFixed(0)} KB</span>
                </span>
              </button>
              <button
                type="button"
                aria-label={`إزالة ${f.fullName}`}
                onClick={() => remove(f.id)}
                className="absolute end-1.5 top-2 grid size-7 place-items-center rounded-full text-tertiary opacity-100 transition-opacity hover:bg-card hover:text-foreground sm:opacity-0 sm:group-hover/f:opacity-100 sm:focus-visible:opacity-100"
              >
                <CrossSmallIcon className="size-4" />
              </button>
            </li>
          );
        })}
      </ul>
      <Button
        variant="ghost"
        size="sm"
        className="mt-1 w-full justify-center"
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
          if (e.target.files?.length) void add(e.target.files);
          e.target.value = '';
        }}
      />
    </section>
  );
}

/** التنقّل بين الأدوات: قائمة مجمّعة على الكمبيوتر، وشريط أفقي على الجوال */
function ToolNav({ current, onGo }: { current: ToolKey; onGo: (k: ToolKey) => void }) {
  const { active } = useLab();
  return (
    <>
      <nav aria-label="أدوات المختبر" className="max-lg:hidden">
        {TOOL_GROUPS.map((g) => (
          <div key={g.label || 'top'} className="mb-3">
            {g.label && <p className="px-3 pb-1.5 text-caption text-tertiary">{g.label}</p>}
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
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-control transition-colors',
                        on
                          ? 'bg-tint-brand font-medium text-primary'
                          : 'text-muted-foreground hover:bg-sunken hover:text-foreground',
                      )}
                    >
                      <t.icon filled={on} className="size-4 shrink-0" />
                      <span className="flex-1 text-start">{t.label}</span>
                      {count ? (
                        <span dir="ltr" className="text-caption text-tertiary tabular-nums">
                          {count}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <nav aria-label="أدوات المختبر" className="-mx-4 lg:hidden">
        <ul className="flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1 [&::-webkit-scrollbar]:hidden">
          {TOOLS.map((t) => {
            const on = t.key === current;
            return (
              <li key={t.key}>
                <button
                  type="button"
                  aria-current={on ? 'page' : undefined}
                  onClick={() => onGo(t.key)}
                  className={cn(
                    'inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-control whitespace-nowrap',
                    on ? 'border-primary font-medium text-primary' : 'bg-card text-muted-foreground',
                  )}
                >
                  <t.icon filled={on} className="size-4" />
                  {t.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
