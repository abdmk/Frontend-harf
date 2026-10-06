import { CheckIcon, ExclamationIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

import type { ToolKey } from '../../data/tools';
import { useLab } from '../../hooks/lab-context';
import type { LabFont } from '../../types';
import { Panel, StatusPill } from '../bits';

type Check = { ok: boolean; label: string; detail: string; tool: ToolKey };

/** فحص سريع: نقاط الجودة التي يسأل عنها المصمّم أولاً، كل منها يقود لأداة التفصيل */
export function qualityChecks(f: LabFont): Check[] {
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

/**
 * الفحص السريع — أوّل ما في «الدعم»: نقاط الجودة التي يسأل عنها المصمّم أولاً، وكل بند يقود لتفصيله.
 */
export function QuickCheck({ onGo }: { onGo: (tool: ToolKey) => void }) {
  const { active } = useLab();
  if (!active) return null;
  const list = qualityChecks(active);
  const passed = list.filter((c) => c.ok).length;
  return (
    <Panel label="فحص سريع" className="p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">فحص سريع</h2>
        <StatusPill tone={passed === list.length ? 'ok' : 'warn'}>
          {passed} من {list.length}
        </StatusPill>
      </div>
      <ul className="grid gap-x-6 sm:grid-cols-2">
        {list.map((c) => (
          <li key={c.label}>
            <button
              type="button"
              onClick={() => onGo(c.tool)}
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
  );
}
