import { useSearchParams } from 'react-router';

import { CheckIcon, ExclamationIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

import { LANGUAGES } from '../../data/languages';
import type { ToolKey } from '../../data/tools';
import { useLab } from '../../hooks/lab-context';
import type { LabFont } from '../../types';
import { coverage, STATUS_LABEL } from '../../utils/coverage';
import { Panel, StatusPill } from '../bits';

type Check = { ok: boolean; label: string; detail: string; tool: ToolKey };

/** فحص سريع: نقاط الجودة التي يسأل عنها المصمّم أولاً، كل منها يقود لأداة التفصيل */
function checks(f: LabFont): Check[] {
  const has = (t: string) => f.features.some((x) => x.tag === t);
  const set = new Set(f.codepoints);
  const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i).every((c) => set.has(c));
  return [
    {
      ok: has('init') && has('medi') && has('fina'),
      label: 'أشكال الحروف السياقية',
      detail: has('init') ? 'init · medi · fina موجودة' : 'لا أشكال سياقية — الحروف لن تتّصل',
      tool: 'letters',
    },
    {
      ok: has('mark') && has('mkmk'),
      label: 'مواضع التشكيل',
      detail: has('mark') ? (has('mkmk') ? 'mark و mkmk موجودتان' : 'mark بلا mkmk — تراكب الحركات قد يتصادم') : 'لا mark — الحركات قد لا تُوضع فوق الحروف',
      tool: 'marks',
    },
    {
      ok: has('kern'),
      label: 'التقنين (kern)',
      detail: has('kern') ? 'أزواج مضبوطة المسافة' : 'بلا تقنين — المسافات بين الأزواج كما رُسمت',
      tool: 'features',
    },
    {
      ok: has('rlig') || has('liga') || set.has(0xfefb),
      label: 'ربطة اللام ألف',
      detail: has('rlig') ? 'عبر rlig' : set.has(0xfefb) ? 'عبر أشكال العرض' : 'لا ربطة — «لا» ستظهر حرفين',
      tool: 'features',
    },
    {
      ok: range(0x0660, 0x0669),
      label: 'الأرقام الهندية ٠–٩',
      detail: range(0x0660, 0x0669) ? 'كاملة' : 'ناقصة — سيُستعمل خط بديل',
      tool: 'numerals',
    },
    {
      ok: range(0x064b, 0x0652),
      label: 'الحركات الأساسية',
      detail: range(0x064b, 0x0652) ? 'فتحة، ضمّة، كسرة، تنوين، شدّة، سكون' : 'بعض الحركات ناقصة',
      tool: 'marks',
    },
  ];
}

export function Overview() {
  const { active, specimen } = useLab();
  const [, setParams] = useSearchParams();
  if (!active) return null;
  const set = new Set(active.codepoints);
  const langs = LANGUAGES.map((l) => ({ l, c: coverage(l, set) }));
  const list = checks(active);
  const passed = list.filter((c) => c.ok).length;
  const go = (tool: ToolKey) => setParams((p) => ({ ...Object.fromEntries(p), tool }), { replace: true });

  const stats: [string, string | number][] = [
    ['المحارف', active.glyphCount.toLocaleString('en-US')],
    ['نقاط يونيكود', active.codepoints.length.toLocaleString('en-US')],
    ['ميزات OpenType', active.features.length],
    ['اللغات المدعومة', `${langs.filter((x) => x.c.status === 'full').length} من ${langs.length}`],
    [active.axes.length ? 'المحاور' : 'الوزن', active.axes.length ? active.axes.map((a) => a.tag).join(' · ') : active.weight],
    ['الصيغة', `${active.format} · ${active.outline === 'TrueType (glyf)' ? 'glyf' : active.outline}`],
  ];

  return (
    <div className="flex flex-col gap-5">
      <Panel label="عيّنة" className="overflow-hidden">
        <div className="bg-sunken px-6 py-10 sm:px-10 sm:py-14">
          <p className="text-5xl leading-snug sm:text-6xl" style={specimen()}>
            {active.family}
          </p>
          <p className="mt-4 max-w-[36ch] text-2xl leading-relaxed text-foreground/80" style={specimen()}>
            أبجد هوز حطي كلمن سعفص قرشت ثخذ ضظغ ١٢٣٤٥٦٧٨٩٠
          </p>
        </div>
        <dl className="grid grid-cols-2 divide-y border-t sm:grid-cols-3 sm:divide-y-0 lg:grid-cols-6 lg:divide-x">
          {stats.map(([k, v]) => (
            <div key={k} className="flex flex-col-reverse gap-0.5 px-5 py-4">
              <dt className="text-caption text-muted-foreground">{k}</dt>
              <dd dir="auto" className="truncate text-start text-lead font-semibold tabular-nums">
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Panel label="فحص سريع" className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-control font-semibold">فحص سريع</h3>
            <StatusPill tone={passed === list.length ? 'ok' : 'warn'}>
              {passed} من {list.length}
            </StatusPill>
          </div>
          <ul className="flex flex-col">
            {list.map((c) => (
              <li key={c.label}>
                <button
                  type="button"
                  onClick={() => go(c.tool)}
                  className="-mx-2 flex w-[calc(100%+1rem)] items-start gap-3 rounded-md px-2 py-2.5 text-start transition-colors hover:bg-sunken"
                >
                  <span
                    className={cn(
                      'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full',
                      c.ok ? 'bg-tint-ok text-ok-text' : 'bg-tint-warn text-warn-text',
                    )}
                  >
                    {c.ok ? <CheckIcon className="size-3" /> : <ExclamationIcon className="size-3" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-control font-medium">{c.label}</span>
                    <span className="block text-caption text-muted-foreground">{c.detail}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel label="اللغات" className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-control font-semibold">اللغات</h3>
            <button type="button" onClick={() => go('languages')} className="text-caption font-medium text-primary hover:underline">
              التفاصيل
            </button>
          </div>
          <ul className="flex flex-col gap-3.5">
            {langs.map(({ l, c }) => (
              <li key={l.key} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3 text-control">
                  <span className="font-medium">{l.name}</span>
                  <StatusPill tone={c.status === 'full' ? 'ok' : c.status === 'partial' ? 'warn' : 'muted'}>
                    {STATUS_LABEL[c.status]}
                  </StatusPill>
                </div>
                <div
                  role="meter"
                  aria-label={`تغطية ${l.name}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={c.score}
                  className="h-1 overflow-hidden rounded-full bg-inset"
                >
                  <span
                    className={cn('block h-full rounded-full', c.status === 'full' ? 'bg-ok-500' : 'bg-foreground/50')}
                    style={{ width: `${c.score}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
