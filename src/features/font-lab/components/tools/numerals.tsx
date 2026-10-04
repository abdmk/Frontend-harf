import { useState } from 'react';

import { useLab } from '../../hooks/lab-context';
import { Panel, RangeControl, StatusPill } from '../bits';
import { ControlsCard } from '../controls';

const ROWS: [string, string][] = [
  ['الأرقام الهندية', '٠١٢٣٤٥٦٧٨٩'],
  ['الأرقام العربية', '0123456789'],
  ['الأرقام الفارسية', '۰۱۲۳۴۵۶۷۸۹'],
  ['سنة', '٢٠٢٦ — 2026'],
  ['مبلغ بفاصلة عربية', '١٢٬٥٠٠٫٧٥'],
  ['عملة', '$25,000 · €1,250 · £99'],
  ['عملة محلّية', '25,000 IQD · ٢٥٬٠٠٠ د.ع · ﷼ ٩٩'],
  ['كسور ونسب', '½ ¾ ⅓ · 45% · ٤٥٪'],
  ['تواريخ ونطاقات', '١٤٤٧هـ / 2026م · 12–24'],
  ['ترقيم', '، ؛ ؟ « » ( ) [ ] — … ! .'],
];

export function Numerals() {
  const { active, specimen } = useLab();
  const [size, setSize] = useState(36);
  if (!active) return null;
  const set = new Set(active.codepoints);
  const missing = (s: string) => [...s].filter((c) => c.trim() && !set.has(c.codePointAt(0)!));

  return (
    <div className="flex flex-col gap-5">
      <ControlsCard label="إعدادات الأرقام">
        <RangeControl label="الحجم" value={size} min={16} max={96} onChange={setSize} className="sm:max-w-sm" />
      </ControlsCard>
      <Panel label="الأرقام" className="divide-y overflow-hidden">
        {ROWS.map(([label, text]) => {
          const miss = missing(text);
          return (
            <div key={label} className="grid items-center gap-2 px-5 py-4 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:gap-6">
              <span className="text-meta text-muted-foreground">{label}</span>
              <p className="min-w-0 break-words leading-normal" style={specimen(active, { fontSize: size })}>
                {text}
              </p>
              {miss.length > 0 ? (
                <StatusPill tone="warn">ينقص {miss.length}</StatusPill>
              ) : (
                <StatusPill tone="ok">كامل</StatusPill>
              )}
            </div>
          );
        })}
      </Panel>
    </div>
  );
}
