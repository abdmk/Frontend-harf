import { useState } from 'react';

import { cn } from '@/lib/utils';

import { type LangKey, LANGUAGES } from '../../data/languages';
import { useLab } from '../../hooks/lab-context';
import type { LabFont } from '../../types';
import { coverage, hex, STATUS_LABEL } from '../../utils/coverage';
import { Panel, StatusPill } from '../bits';

/** اللغات التي يعلنها الخط صراحةً في جدول GSUB (وسوم langSys) */
function declared(font: LabFont) {
  const scripts = (font.kit as unknown as {
    GSUB?: { scriptList?: { script?: { langSysRecords?: { tag: string }[] } }[] };
  }).GSUB?.scriptList;
  return new Set(scripts?.flatMap((s) => s.script?.langSysRecords?.map((r) => r.tag.trim()) ?? []) ?? []);
}

export function Languages() {
  const { active, specimen, settings } = useLab();
  // الحجم من شريط المختبر (واحد لكل المشاهد)، محصوراً بما يناسب هذا العرض
  const size = Math.min(64, Math.max(18, settings.size));
  const [only, setOnly] = useState<LangKey | 'all'>('all');
  if (!active) return null;
  const set = new Set(active.codepoints);
  const tags = declared(active);
  const rows = LANGUAGES.map((l) => ({ l, c: coverage(l, set) }));
  const visible = rows.filter((r) => only === 'all' || r.l.key === only);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="تصفية اللغات" className="flex flex-wrap gap-1.5">
          <Chip on={only === 'all'} onClick={() => setOnly('all')}>
            الكل
          </Chip>
          {rows.map(({ l, c }) => (
            <Chip key={l.key} on={only === l.key} onClick={() => setOnly(l.key)}>
              <span
                aria-hidden
                className={cn(
                  'size-1.5 rounded-full',
                  c.status === 'full' ? 'bg-ok-500' : c.status === 'partial' ? 'bg-warn-500' : 'bg-strong',
                )}
              />
              {l.name}
              <span dir="ltr" className="text-tertiary tabular-nums">
                {c.score}%
              </span>
            </Chip>
          ))}
        </div>
      </div>

      {visible.map(({ l, c }) => (
        <Panel key={l.key} label={l.name} className="overflow-hidden">
          <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lead font-semibold">{l.name}</h3>
                <p dir="ltr" className="text-right text-caption text-muted-foreground">
                  {l.nameEn} · {l.script === 'arabic' ? 'كتابة عربية' : 'كتابة لاتينية'}
                </p>
              </div>
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
              className="h-1.5 overflow-hidden rounded-full bg-inset"
            >
              <span
                className={cn('block h-full rounded-full', c.status === 'full' ? 'bg-ok-500' : 'bg-foreground/50')}
                style={{ width: `${c.score}%` }}
              />
            </div>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  ['الحروف الأساسية', c.base],
                  ['الحروف المميّزة', c.special],
                  ['إضافية (أرقام، ترقيم)', c.extra],
                ] as const
              ).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-caption text-tertiary">{k}</dt>
                  <dd className="text-control font-semibold tabular-nums">
                    {v.total ? `${v.have} من ${v.total}` : '—'}
                  </dd>
                </div>
              ))}
              <div>
                <dt className="text-caption text-tertiary">الدرجة الموزونة</dt>
                <dd dir="ltr" className="text-right text-control font-semibold tabular-nums">
                  {c.score}%
                </dd>
              </div>
            </dl>
            {c.missing.length > 0 && (
              <div className="rounded-md bg-sunken px-4 py-3">
                <p className="text-caption text-muted-foreground">
                  {c.missingSpecial.length
                    ? 'الحروف المميّزة الناقصة تمنع كتابة هذه اللغة بهذا الخط:'
                    : 'الناقص لا يمنع الكتابة، لكنه سيظهر بخط بديل:'}
                </p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {c.missing.slice(0, 40).map((cp) => (
                    <li
                      key={cp}
                      title={hex(cp)}
                      className={cn(
                        'inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-xs border bg-card px-2 text-control',
                        c.missingSpecial.includes(cp) && 'border-warn-500/60 text-warn-text',
                      )}
                    >
                      {cp === 0x200c ? 'ZWNJ' : String.fromCodePoint(cp)}
                    </li>
                  ))}
                  {c.missing.length > 40 && <li className="text-caption text-tertiary">+{c.missing.length - 40}</li>}
                </ul>
              </div>
            )}
            {l.otTag && tags.has(l.otTag) && (
              <p className="text-caption text-muted-foreground">
                الخط يعلن هذه اللغة صراحةً في جداوله (<span dir="ltr">{l.otTag}</span>) — بأشكال محلّية عبر locl.
              </p>
            )}
          </div>
          <p
            dir={l.script === 'latin' ? 'ltr' : 'rtl'}
            lang={l.key}
            className="border-t bg-sunken px-6 py-6 leading-[1.9]"
            style={specimen(active, { fontSize: size })}
          >
            {l.sample}
          </p>
        </Panel>
      ))}
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border bg-card px-3.5 text-caption text-muted-foreground transition-colors hover:text-foreground aria-pressed:border-primary aria-pressed:text-primary"
    >
      {children}
    </button>
  );
}
