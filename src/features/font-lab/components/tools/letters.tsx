import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useLab } from '../../hooks/lab-context';
import { hex } from '../../utils/coverage';
import { Panel, StatusPill } from '../bits';

const ZWJ = '‍';
const BASE = [...'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'];
const EXTRA = [...'ءآأإؤئةىپچژگڤکیڕڵۆێەٹڈڑںھہےۓ'];
/** حروف لا تتّصل بما بعدها — شكلاها المبتدئ والمتوسّط هما المنفرد والمنتهي */
const NON_JOINING = new Set([...'اآأإدذرزوؤةىءڕۆەڈڑےۓژ']);

const FORMS = [
  ['isol', 'منفرد'],
  ['init', 'مبتدئ'],
  ['medi', 'متوسّط'],
  ['fina', 'منتهٍ'],
] as const;

function form(c: string, f: (typeof FORMS)[number][0]) {
  const joins = !NON_JOINING.has(c);
  if (f === 'isol') return c;
  if (f === 'init') return joins ? c + ZWJ : c;
  if (f === 'medi') return joins ? ZWJ + c + ZWJ : ZWJ + c;
  return ZWJ + c;
}
const word = (c: string) => `ب${c}ب${c}`;

export function Letters() {
  const { active, specimen, settings } = useLab();
  const [pick, setPick] = useState('ب');
  // الحجم من شريط المختبر (واحد لكل المشاهد)، محصوراً بما يناسب هذا العرض
  const size = Math.min(72, Math.max(20, settings.size));
  const [table, setTable] = useState(false);
  if (!active) return null;
  const set = new Set(active.codepoints);
  const has = (c: string) => set.has(c.codePointAt(0)!);
  const baseHave = BASE.filter(has).length;
  const extraHave = EXTRA.filter(has).length;

  const grid = (letters: string[], label: string, count: [number, number]) => (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-control font-semibold">{label}</h3>
        <StatusPill tone={count[0] === count[1] ? 'ok' : 'warn'}>
          {count[0]} من {count[1]}
        </StatusPill>
      </div>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))] gap-1.5">
        {letters.map((c) => {
          const ok = has(c);
          return (
            <li key={c}>
              <button
                type="button"
                aria-pressed={pick === c}
                aria-label={`${c} ${hex(c.codePointAt(0)!)}${ok ? '' : ' — غير موجود'}`}
                onClick={() => setPick(c)}
                className={cn(
                  'flex aspect-square w-full flex-col items-center justify-center gap-0.5 rounded-md border bg-card transition-colors hover:border-strong aria-pressed:border-primary aria-pressed:bg-tint-brand/50',
                  !ok && 'border-dashed opacity-40',
                )}
              >
                <span className="text-2xl leading-none" style={specimen(active)}>
                  {c}
                </span>
                <span dir="ltr" className="font-mono text-micro text-tertiary">
                  {hex(c.codePointAt(0)!).slice(2)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Panel label="الحروف" className="flex flex-col gap-6 p-5">
          {grid(BASE, 'الحروف العربية الأساسية', [baseHave, BASE.length])}
          {grid(EXTRA, 'حروف إضافية (همزات، فارسية، كردية، أردية)', [extraHave, EXTRA.length])}
        </Panel>

        {/* الحرف المختار: أشكاله الأربعة بحجم كبير */}
        <Panel label={`أشكال ${pick}`} className="overflow-hidden xl:sticky xl:top-24">
          <div className="flex items-center justify-between gap-3 border-b px-5 py-3">
            <span className="text-control font-semibold">
              الحرف <span style={specimen(active)}>{pick}</span>
            </span>
            <span dir="ltr" className="font-mono text-caption text-tertiary">
              {hex(pick.codePointAt(0)!)}
            </span>
          </div>
          {has(pick) ? (
            <>
              <ul className="grid grid-cols-2 gap-px bg-border">
                {FORMS.map(([f, label]) => (
                  <li key={f} className="flex flex-col items-center gap-2 bg-card px-3 py-5">
                    <span className="text-6xl leading-none" style={specimen(active)}>
                      {form(pick, f)}
                    </span>
                    <span className="text-caption text-muted-foreground">
                      {label} <span className="font-mono text-tertiary">{f}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="border-t bg-sunken px-5 py-5 text-center text-4xl" style={specimen(active)}>
                {word(pick)}
              </p>
            </>
          ) : (
            <p className="p-5 text-meta text-muted-foreground">هذا الحرف غير موجود في الخط — سيظهر بخط بديل.</p>
          )}
        </Panel>
      </div>

      <Panel label="جدول الأشكال" className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4">
          <h3 className="text-control font-semibold">جدول الأشكال كاملاً</h3>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" aria-expanded={table} onClick={() => setTable((v) => !v)}>
              {table ? 'إخفاء الجدول' : 'عرض الجدول'}
            </Button>
          </div>
        </div>
        {table && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-center">
            <thead>
              <tr className="text-caption text-muted-foreground">
                <th className="px-3 py-2 font-normal">الحرف</th>
                {FORMS.map(([f, label]) => (
                  <th key={f} className="px-3 py-2 font-normal">
                    {label}
                  </th>
                ))}
                <th className="px-3 py-2 font-normal">في كلمة</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={specimen(active, { fontSize: size })}>
              {[...BASE, ...EXTRA].filter(has).map((c) => (
                <tr key={c}>
                  <td className="px-3 py-2 font-sans text-caption text-muted-foreground" dir="ltr">
                    {hex(c.codePointAt(0)!)}
                  </td>
                  {FORMS.map(([f]) => (
                    <td key={f} className="px-3 py-2 leading-normal">
                      {form(c, f)}
                    </td>
                  ))}
                  <td className="px-3 py-2 leading-normal">{word(c)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </Panel>
    </div>
  );
}
