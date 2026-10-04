import { useMemo, useState } from 'react';

import { SearchField } from '@/components/shared/search-field';
import { Button } from '@/components/ui/button';
import { CopyIcon } from '@/components/ui/icons';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';

import { useLab } from '../../hooks/lab-context';
import type { LabFont } from '../../types';
import { hex, RANGES, type RangeKey } from '../../utils/coverage';
import { glyphNames } from '../../utils/opentype';
import { GlyphShape, InfoRows, Panel } from '../bits';

const PAGE = 240;

type Picked = { cp?: number; gid: number };

/** يطابق البحث: الحرف نفسه، أو U+XXXX، أو رقم GID، أو اسم المحرف */
function search(font: LabFont, q: string): number[] | { gid: number } | null {
  const t = q.trim();
  if (!t) return null;
  const u = /^(?:u\+|0x)?([0-9a-f]{4,6})$/i.exec(t);
  if (u) return [parseInt(u[1]!, 16)];
  if (/^\d+$/.test(t) && Number(t) < font.glyphCount) return { gid: Number(t) };
  const chars = [...t].map((c) => c.codePointAt(0)!);
  return chars;
}

type By = 'unicode' | 'file';

/**
 * المحارف بطريقتين: «بالرموز» (ما يكتبه المستخدم) و«كل محارف الملف» بترتيب GID —
 * وفيها ما لا رمز له: الأشكال السياقية والربطات والبدائل، والمحارف الفارغة ظاهرة كفارغة.
 */
export function Glyphs() {
  const [by, setBy] = useState<By>('unicode');
  const { active } = useLab();
  if (!active) return null;
  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl
        label="طريقة العرض"
        value={by}
        onChange={setBy}
        className="w-fit"
        options={[
          { value: 'unicode', label: 'بالرموز (Unicode)' },
          { value: 'file', label: `كل محارف الملف · ${active.glyphCount.toLocaleString('en-US')}` },
        ]}
      />
      {by === 'unicode' ? <ByUnicode /> : <ByFile />}
    </div>
  );
}

/** كل محارف الملف بترتيبها — رسمها من المسار مباشرة، فيُرى حتى ما لا يصل إليه النص */
function ByFile() {
  const { active } = useLab();
  const [q, setQ] = useState('');
  const [shown, setShown] = useState(PAGE);
  const [picked, setPicked] = useState<number>(0);
  const names = useMemo(() => (active ? glyphNames(active) : new Map<number, string>()), [active]);
  const list = useMemo(() => {
    if (!active) return [];
    const all = Array.from({ length: active.glyphCount }, (_, i) => i);
    const t = q.trim().toLowerCase();
    if (!t) return all;
    if (/^\d+$/.test(t)) return all.filter((g) => String(g).startsWith(t));
    return all.filter((g) => (names.get(g) ?? '').toLowerCase().includes(t));
  }, [active, q, names]);
  if (!active) return null;
  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex min-w-0 flex-col gap-4">
        <SearchField
          label="بحث باسم المحرف أو رقمه"
          placeholder="ابحث باسم المحرف (uni0628.init) أو رقمه…"
          value={q}
          onChange={(v) => {
            setQ(v);
            setShown(PAGE);
          }}
          delay={200}
        />
        <p className="text-caption text-muted-foreground">
          {list.length.toLocaleString('en-US')} من {active.glyphCount.toLocaleString('en-US')} محرفاً، بترتيبها في
          الملف
        </p>
        {list.length ? (
          <>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-1.5">
              {list.slice(0, shown).map((gid) => {
                const g = active.kit.getGlyph(gid);
                const name = names.get(gid);
                const empty = !Number.isFinite(g.bbox.minX);
                return (
                  <li key={gid}>
                    <button
                      type="button"
                      aria-pressed={picked === gid}
                      aria-label={`المحرف ${gid} ${name ?? ''}`}
                      title={name}
                      onClick={() => setPicked(gid)}
                      className="relative flex aspect-square w-full flex-col items-center justify-center gap-1.5 rounded-md border bg-card px-1 transition-colors hover:border-strong aria-pressed:border-primary aria-pressed:bg-tint-brand/50"
                    >
                      {empty ? (
                        <span className="text-caption text-tertiary">فارغ</span>
                      ) : (
                        <GlyphShape font={active} gid={gid} size={34} />
                      )}
                      <span dir="ltr" className="w-full truncate text-center font-mono text-micro text-tertiary">
                        {name ?? '—'}
                      </span>
                      <span dir="ltr" className="absolute end-1.5 top-1 font-mono text-micro text-tertiary/70">
                        {gid}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {list.length > shown && (
              <Button variant="outline" className="self-center" onClick={() => setShown((n) => n + PAGE)}>
                عرض المزيد ({(list.length - shown).toLocaleString('en-US')} متبقٍّ)
              </Button>
            )}
          </>
        ) : (
          <p className="rounded-lg bg-sunken p-6 text-center text-meta text-muted-foreground">لا محارف تطابق البحث.</p>
        )}
      </div>
      <GlyphDetail font={active} picked={{ gid: picked }} name={names.get(picked)} />
    </div>
  );
}

function ByUnicode() {
  const { active, specimen } = useLab();
  const [q, setQ] = useState('');
  const [range, setRange] = useState<RangeKey>('all');
  const [shown, setShown] = useState(PAGE);
  const [picked, setPicked] = useState<Picked | null>(null);

  const list = useMemo(() => {
    if (!active) return [];
    const r = RANGES.find((x) => x.key === range)!;
    const res = search(active, q);
    const base = Array.isArray(res) ? res.filter((c) => active.codepoints.includes(c)) : active.codepoints;
    // محارف التحكّم لا رسم لها — لا معنى لعرضها
    return base.filter((c) => c >= 0x20 && !(c >= 0x7f && c <= 0x9f) && r.test(c));
  }, [active, q, range]);

  if (!active) return null;
  const res = search(active, q);
  const gidHit = res && !Array.isArray(res) ? res.gid : null;
  // البداية بحرف عربي إن وُجد — هو ما جاء المصمّم ليفحصه
  const first = list.includes(0x0628) ? 0x0628 : list[0];
  const current = picked ?? (first !== undefined ? { cp: first, gid: active.kit.glyphForCodePoint(first).id } : null);

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <SearchField
            label="بحث بالحرف أو Unicode أو GID"
            placeholder="ابحث بالحرف، U+0628، أو رقم المحرف…"
            value={q}
            onChange={(v) => {
              setQ(v);
              setShown(PAGE);
            }}
            delay={150}
            className="min-w-56 flex-1"
          />
          <Select
            value={range}
            onValueChange={(v) => {
              setRange(v as RangeKey);
              setShown(PAGE);
            }}
          >
            <SelectTrigger aria-label="نطاق Unicode" className="h-11 w-48 rounded-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGES.map((r) => (
                <SelectItem key={r.key} value={r.key}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-caption text-muted-foreground">
          {gidHit !== null ? `المحرف رقم ${gidHit}` : `${list.length.toLocaleString('en-US')} نقطة يونيكود`} ·{' '}
          {active.glyphCount.toLocaleString('en-US')} محرفاً في الملف (منها أشكال سياقية وربطات بلا رمز)
        </p>

        {gidHit !== null ? (
          <Button variant="outline" className="w-fit" onClick={() => setPicked({ gid: gidHit })}>
            اعرض المحرف رقم {gidHit}
          </Button>
        ) : list.length ? (
          <>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(4rem,1fr))] gap-1.5">
              {list.slice(0, shown).map((cp) => (
                <li key={cp}>
                  <button
                    type="button"
                    aria-pressed={current?.cp === cp}
                    aria-label={`${String.fromCodePoint(cp)} ${hex(cp)}`}
                    onClick={() => setPicked({ cp, gid: active.kit.glyphForCodePoint(cp).id })}
                    className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-md border bg-card transition-colors hover:border-strong aria-pressed:border-primary aria-pressed:bg-tint-brand/50"
                  >
                    <span className="text-2xl leading-none" style={specimen(active)}>
                      {String.fromCodePoint(cp)}
                    </span>
                    <span dir="ltr" className="font-mono text-micro text-tertiary">
                      {hex(cp).slice(2)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {list.length > shown && (
              <Button variant="outline" className="self-center" onClick={() => setShown((n) => n + PAGE)}>
                عرض المزيد ({(list.length - shown).toLocaleString('en-US')} متبقٍّ)
              </Button>
            )}
          </>
        ) : (
          <p className="rounded-lg bg-sunken p-6 text-center text-meta text-muted-foreground">لا محارف تطابق البحث.</p>
        )}
      </div>

      {current && <GlyphDetail font={active} picked={current} />}
    </div>
  );
}

/** المحرف برسمه الحقيقي من الملف وخطوط القياس */
function GlyphDetail({ font, picked, name }: { font: LabFont; picked: Picked; name?: string }) {
  const g = font.kit.getGlyph(picked.gid);
  const { ascent, descent, capHeight, xHeight } = font.metrics;
  const adv = g.advanceWidth;
  // محرف فارغ (مسافة مثلاً): حدوده لانهائية في fontkit — نرسم الإطار فقط
  const empty = !Number.isFinite(g.bbox.minX);
  const bb = empty ? { minX: 0, minY: 0, maxX: adv, maxY: 0 } : g.bbox;
  const pad = font.unitsPerEm * 0.08;
  const x0 = Math.min(0, bb.minX) - pad;
  const x1 = Math.max(adv, bb.maxX) + pad;
  const top = Math.max(ascent, bb.maxY) + pad;
  const bottom = Math.min(descent, bb.minY) - pad;
  const w = x1 - x0;
  const h = top - bottom;
  const lines: [string, number][] = [
    ['الصاعد', ascent],
    ['ارتفاع الكبيرة', capHeight],
    ['ارتفاع x', xHeight],
    ['خط الأساس', 0],
    ['النازل', descent],
  ];
  const char = picked.cp !== undefined ? String.fromCodePoint(picked.cp) : null;
  const stroke = font.unitsPerEm / 250;

  return (
    <Panel label="تفاصيل المحرف" className="overflow-hidden xl:sticky xl:top-24">
      <svg
        viewBox={`${x0} ${-top} ${w} ${h}`}
        role="img"
        aria-label={`رسم المحرف ${char ?? g.name ?? picked.gid}`}
        className="block aspect-square w-full bg-sunken"
      >
        {lines.map(([label, y]) => (
          <line
            key={label}
            x1={x0}
            x2={x1}
            y1={-y}
            y2={-y}
            className={y === 0 ? 'stroke-primary' : 'stroke-strong'}
            strokeWidth={stroke}
            strokeDasharray={y === 0 ? undefined : `${stroke * 4} ${stroke * 3}`}
          />
        ))}
        <line x1={0} x2={0} y1={-top} y2={-bottom} className="stroke-strong" strokeWidth={stroke} />
        <line x1={adv} x2={adv} y1={-top} y2={-bottom} className="stroke-strong" strokeWidth={stroke} />
        <path d={g.path.toSVG()} transform="scale(1,-1)" className="fill-foreground" />
      </svg>
      <div className="flex items-center justify-between gap-3 border-y px-5 py-3">
        <span className="text-control font-semibold">
          {char ? (
            <>
              <span style={{ fontFamily: `'${font.css}'` }}>{char}</span>{' '}
              <span dir="ltr" className="font-mono text-meta text-muted-foreground">
                {hex(picked.cp!)}
              </span>
            </>
          ) : (
            `المحرف ${picked.gid}`
          )}
        </span>
        {char && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="نسخ الحرف"
            onClick={() =>
              navigator.clipboard.writeText(char).then(
                () => toast({ tone: 'success', title: 'نُسخ الحرف' }),
                () => toast({ tone: 'danger', title: 'تعذّر النسخ' }),
              )
            }
          >
            <CopyIcon />
          </Button>
        )}
      </div>
      <div className="px-5">
        <InfoRows
          rows={[
            ['الاسم', <span dir="ltr">{g.name || name || '—'}</span>],
            ['رقم المحرف (GID)', <span dir="ltr">{picked.gid}</span>],
            ['عرض التقدّم', <span dir="ltr">{Math.round(adv)}</span>],
            [
              'الحدود',
              empty ? (
                'محرف فارغ بلا رسم'
              ) : (
                <span dir="ltr" className="tabular-nums">
                  {Math.round(bb.minX)}, {Math.round(bb.minY)} → {Math.round(bb.maxX)}, {Math.round(bb.maxY)}
                </span>
              ),
            ],
          ]}
        />
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 border-t px-5 py-3 text-caption text-tertiary">
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="h-0.5 w-4 bg-primary-fill" /> خط الأساس
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="h-0.5 w-4 border-t border-dashed border-strong" /> الصاعد · الكبيرة · x · النازل
        </li>
      </ul>
    </Panel>
  );
}
