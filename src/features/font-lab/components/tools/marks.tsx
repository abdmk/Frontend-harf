import { useState } from 'react';

import { cn } from '@/lib/cn';

import { useLab } from '../../hooks/lab-context';
import { hex } from '../../utils/coverage';
import { Panel, RangeControl } from '../bits';

const MARKS: [string, string][] = [
  ['َ', 'فتحة'],
  ['ِ', 'كسرة'],
  ['ُ', 'ضمّة'],
  ['ً', 'تنوين فتح'],
  ['ٍ', 'تنوين كسر'],
  ['ٌ', 'تنوين ضمّ'],
  ['ّ', 'شدّة'],
  ['ْ', 'سكون'],
  ['ٓ', 'مدّة'],
  ['ٰ', 'ألف خنجرية'],
  ['ٔ', 'همزة فوق'],
  ['ٕ', 'همزة تحت'],
];
const STACKED = ['بَّ', 'بِّ', 'بُّ', 'بًّ', 'بٍّ', 'بٌّ', 'لَّا', 'مُّ', 'كَّ', 'هِّ'];
const SENTENCES = [
  'إِنَّ اللُّغَةَ العَرَبِيَّةَ جَمِيلَةٌ وَمُتَنَوِّعَةٌ',
  'وَمَا أُوتِيتُمْ مِنَ العِلْمِ إِلَّا قَلِيلًا',
  'خَطٌّ مَشْكُولٌ بِعِنَايَةٍ يَكْشِفُ مَوَاضِعَ العَلَامَاتِ',
  'الطِّبَاعَةُ العَرَبِيَّةُ فَنٌّ وَصَنْعَةٌ مَعًا',
];

export function Marks() {
  const { active, specimen } = useLab();
  const [size, setSize] = useState(44);
  const [base, setBase] = useState('ب');
  if (!active) return null;
  const set = new Set(active.codepoints);
  const hasMark = (m: string) => set.has(m.codePointAt(0)!);

  return (
    <div className="flex flex-col gap-5">
      <Panel label="الحركات" className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div role="group" aria-label="الحرف الحامل" className="flex gap-1.5">
            {[...'بسحلعهي'].map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={base === c}
                onClick={() => setBase(c)}
                className="grid size-9 place-items-center rounded-full border text-lead transition-colors aria-pressed:border-primary aria-pressed:text-primary"
                style={specimen(active)}
              >
                {c}
              </button>
            ))}
          </div>
          <RangeControl label="الحجم" value={size} min={24} max={96} onChange={setSize} className="w-56" />
        </div>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-2">
          {MARKS.map(([m, label]) => {
            const ok = hasMark(m);
            return (
              <li
                key={m}
                className={cn('flex flex-col items-center gap-2 rounded-md border px-2 py-4', !ok && 'border-dashed opacity-45')}
              >
                <span className="leading-[1.8]" style={specimen(active, { fontSize: size })}>
                  {base + m}
                </span>
                <span className="text-caption text-muted-foreground">{label}</span>
                <span dir="ltr" className="font-mono text-micro text-tertiary">
                  {hex(m.codePointAt(0)!)}
                  {!ok && ' · ناقص'}
                </span>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel label="تراكب العلامات" className="p-5">
        <h3 className="mb-1 text-control font-semibold">تراكب العلامات</h3>
        <p className="mb-4 text-caption text-muted-foreground">الشدّة مع حركة — هنا يظهر عمل mkmk.</p>
        <p className="leading-[2.2] break-words" style={specimen(active, { fontSize: size, wordSpacing: '0.4em' })}>
          {STACKED.join(' ')}
        </p>
      </Panel>

      <Panel label="نصوص مشكولة" className="divide-y overflow-hidden">
        {SENTENCES.map((t) => (
          <p key={t} className="px-6 py-5 leading-[2]" style={specimen(active, { fontSize: size * 0.8 })}>
            {t}
          </p>
        ))}
      </Panel>
    </div>
  );
}
