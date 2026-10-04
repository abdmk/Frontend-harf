import { useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeftIcon, ChevronDownIcon, CopyIcon, RefreshIcon } from '@/components/ui/icons';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';

import { GlyphShape, RangeControl } from './bits';
import { ALIGN, SWATCHES } from './tools/sample';
import {
  type FeatureGroup,
  featureGroup,
  featureInfo,
  featureOn,
  featureSettings,
  GROUP_LABEL,
} from '../data/features';
import { useLab } from '../hooks/lab-context';
import type { LabFont } from '../types';
import { analyzeOpenType, LANG_INFO } from '../utils/opentype';

/** أنماط عائلة الخط النشط بترتيب الوزن */
export function useFamily() {
  const { fonts, active } = useLab();
  const family = active ? fonts.filter((f) => f.family === active.family) : [];
  return family.sort((a, b) => a.weight - b.weight || Number(a.italic) - Number(b.italic));
}

const styleLabel = (f: LabFont) => (f.italic && !/italic/i.test(f.style) ? `${f.style} Italic` : f.style);

/**
 * المفتش — عمود واحد بجانب لوحة الاختبار، بترتيب أسئلة المصمّم: النمط والحجم أولاً،
 * ثم OpenType ظاهراً دائماً (ميزات هذا الملف وحده، بأسمائها ووصف ما تفعله)، والنادر مطويّ.
 * كل ما فيه يسري على كل سياقات اللوحة.
 */
export function Inspector({ onTry }: { onTry: () => void }) {
  const { active, settings } = useLab();
  if (!active) return null;
  const tags = new Set(active.features.map((f) => f.tag));
  const optional = [...tags].filter((t) => featureGroup(t) !== 'engine').length;
  const changed = Object.keys(settings.features).length;
  return (
    <aside aria-label="إعدادات الاختبار" className="flex flex-col rounded-2xl border bg-card">
      <section aria-labelledby="lab-text-title" className="flex flex-col gap-6 p-5">
        <h2 id="lab-text-title" className="text-base font-semibold">
          النص
        </h2>
        <TextPanel />
      </section>
      <section id="lab-ot" aria-labelledby="lab-ot-title" className="flex scroll-mt-24 flex-col gap-6 border-t p-5">
        <div>
          <h2 id="lab-ot-title" className="flex items-center justify-between gap-3 text-base font-semibold">
            OpenType
            <span className="text-caption font-normal text-tertiary">
              {changed ? `${changed} مغيّرة · ` : ''}
              {optional} قابلة للتبديل
            </span>
          </h2>
          <p className="mt-1 text-caption text-muted-foreground">
            ميزات هذا الملف فقط — شغّل أيّاً منها وترى أثرها في النص فوراً.
          </p>
        </div>
        <OpenTypePanel onTry={onTry} />
      </section>
    </aside>
  );
}

function Field({ label, value, children }: { label: string; value?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3 text-caption">
        <span className="font-medium">{label}</span>
        {value !== undefined && (
          <span dir="ltr" className="text-muted-foreground tabular-nums">
            {value}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/* ───────────────────────── النص ───────────────────────── */

function TextPanel() {
  const { active, settings: s, set, setActive, resetSettings } = useLab();
  const family = useFamily();
  const [more, setMore] = useState(false);
  if (!active) return null;
  const wght = active.axes.find((a) => a.tag === 'wght');
  const otherAxes = active.axes.filter((a) => a.tag !== 'wght');
  const langs = analyzeOpenType(active)
    .scripts.flatMap((sc) => sc.langs)
    .filter((l, i, a) => a.indexOf(l) === i && LANG_INFO[l]);

  return (
    <>
      {/* النمط: ملفات العائلة الحقيقية — لا وزن يصطنعه المتصفّح */}
      {wght ? (
        <Field label="الوزن" value={Math.round(s.axes.wght ?? wght.default)}>
          <Slider
            aria-label="الوزن"
            value={[s.axes.wght ?? wght.default]}
            min={wght.min}
            max={wght.max}
            onValueChange={([v]) => v !== undefined && set({ axes: { ...s.axes, wght: v } })}
          />
        </Field>
      ) : (
        family.length > 1 && (
          <Field label="النمط" value={active.weight}>
            <div role="radiogroup" aria-label="النمط" className="flex flex-wrap gap-1">
              {family.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="radio"
                  aria-checked={f.id === active.id}
                  title={`${f.style} · ${f.weight}`}
                  onClick={() => setActive(f.id)}
                  dir="ltr"
                  className="h-8 rounded-full border px-3 text-caption text-muted-foreground transition-colors hover:border-strong hover:text-foreground aria-checked:border-foreground aria-checked:bg-foreground aria-checked:text-background"
                >
                  {styleLabel(f)}
                </button>
              ))}
            </div>
          </Field>
        )
      )}

      <Field label="الحجم" value={`${s.size}px`}>
        <Slider
          aria-label="الحجم"
          value={[s.size]}
          min={12}
          max={200}
          onValueChange={([v]) => v !== undefined && set({ size: v })}
        />
      </Field>

      <Field label="ارتفاع السطر" value={s.lineHeight.toFixed(1)}>
        <Slider
          aria-label="ارتفاع السطر"
          value={[s.lineHeight]}
          min={0.9}
          max={3}
          step={0.1}
          onValueChange={([v]) => v !== undefined && set({ lineHeight: v })}
        />
      </Field>

      <Field label="المحاذاة">
        <div role="group" aria-label="المحاذاة" className="grid grid-cols-4 gap-1 rounded-full bg-sunken p-1">
          {ALIGN.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              aria-label={label}
              title={label}
              aria-pressed={s.align === value}
              onClick={() => set({ align: value })}
              className="grid h-8 place-items-center rounded-full text-muted-foreground transition-colors aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-soft"
            >
              <Icon filled="auto" className="size-4" />
            </button>
          ))}
        </div>
      </Field>

      {/* ما يُضبط أقلّ — مطويّ في المكان نفسه، لا قائمة منبثقة */}
      <Collapsible open={more} onOpenChange={setMore} className="border-t pt-4">
        <CollapsibleTrigger className="flex w-full items-center justify-between text-control font-medium">
          إعدادات متقدّمة
          <ChevronDownIcon className={cn('size-4 text-muted-foreground transition-transform', more && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-5 pt-5">
          <RangeControl
            label="تباعد الحروف"
            value={s.letterSpacing}
            min={-5}
            max={20}
            onChange={(letterSpacing) => set({ letterSpacing })}
          />
          <RangeControl
            label="تباعد الكلمات"
            value={s.wordSpacing}
            min={-10}
            max={40}
            onChange={(wordSpacing) => set({ wordSpacing })}
          />
          <RangeControl
            label="عرض النص"
            unit="%"
            value={s.width}
            min={30}
            max={100}
            onChange={(width) => set({ width })}
          />
          {otherAxes.map((a) => (
            <RangeControl
              key={a.tag}
              label={`${a.name} · ${a.tag}`}
              unit=""
              value={s.axes[a.tag] ?? a.default}
              min={a.min}
              max={a.max}
              onChange={(v) => set({ axes: { ...s.axes, [a.tag]: v } })}
            />
          ))}
          <Field label="الألوان">
            <div role="group" aria-label="الألوان" className="flex flex-wrap gap-1.5">
              {SWATCHES.map((w) => (
                <button
                  key={w.label}
                  type="button"
                  title={w.label}
                  aria-label={w.label}
                  aria-pressed={s.color === w.color && s.background === w.background}
                  onClick={() => set({ color: w.color, background: w.background })}
                  className="grid size-9 place-items-center rounded-full border text-meta font-semibold aria-pressed:ring-2 aria-pressed:ring-primary aria-pressed:ring-offset-2 aria-pressed:ring-offset-card"
                  style={{ color: w.color || undefined, background: w.background || undefined }}
                >
                  ب
                </button>
              ))}
            </div>
          </Field>
          {langs.length > 0 && (
            <Field label="لغة النص (أشكال محلّية)">
              <div role="radiogroup" aria-label="لغة النص" className="flex flex-wrap gap-1">
                {['', ...langs].map((l) => {
                  const bcp = l ? LANG_INFO[l]!.bcp : '';
                  return (
                    <button
                      key={l || 'default'}
                      type="button"
                      role="radio"
                      aria-checked={s.lang === bcp}
                      onClick={() => set({ lang: bcp })}
                      className="h-8 rounded-full border px-3 text-caption text-muted-foreground transition-colors hover:text-foreground aria-checked:border-primary aria-checked:bg-tint-brand aria-checked:text-primary"
                    >
                      {l ? LANG_INFO[l]!.name : 'الافتراضية'}
                    </button>
                  );
                })}
              </div>
            </Field>
          )}
          <Button variant="ghost" size="sm" onClick={resetSettings} className="self-start">
            <RefreshIcon />
            إعادة الإعدادات
          </Button>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}

/* ───────────────────────── OpenType ───────────────────────── */

const ORDER: FeatureGroup[] = ['style', 'liga', 'num', 'space'];

/**
 * ميزات OpenType في المكان الذي يُختبر فيه النص: مجمّعة حسب الغرض، باسمها من الملف ومفتاحها.
 * المفعّلة تكشف ما تغيّره (قبل ← بعد) و«جرّب» يضع في اللوحة نصاً يُظهرها.
 */
function OpenTypePanel({ onTry }: { onTry: () => void }) {
  const { active, settings, set } = useLab();
  const [engineOpen, setEngineOpen] = useState(false);
  if (!active) return null;
  const report = analyzeOpenType(active);
  const byTag = new Map(report.features.map((f) => [f.tag, f]));
  const tags = [...new Set(active.features.map((f) => f.tag))];
  const css = featureSettings(tags, settings.features);
  const engine = tags.filter((t) => featureGroup(t) === 'engine');

  if (!tags.length)
    return (
      <p className="text-meta text-muted-foreground">هذا الملف بلا ميزات OpenType — ما تراه هو الرسم الأساسي للحروف.</p>
    );

  return (
    <>
      {ORDER.map((g) => {
        const list = tags.filter((t) => featureGroup(t) === g);
        if (!list.length) return null;
        return (
          <section key={g} aria-label={GROUP_LABEL[g].label}>
            <h3 className="text-control font-semibold">
              {GROUP_LABEL[g].label} <span className="font-normal text-tertiary tabular-nums">{list.length}</span>
            </h3>
            <p className="mb-2 text-caption text-muted-foreground">{GROUP_LABEL[g].hint}</p>
            <ul className="-mx-2 flex flex-col">
              {list.map((tag) => {
                const ot = byTag.get(tag);
                const on = featureOn(tag, settings.features);
                const name = ot?.name ?? featureInfo(tag).label;
                const changed = tag in settings.features;
                return (
                  <li key={tag} className={cn('rounded-lg px-2 py-2 transition-colors', changed && 'bg-sunken/70')}>
                    <label className="flex cursor-pointer items-center gap-3">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-control" title={name}>
                          {name}
                        </span>
                        <span className="flex items-baseline justify-between gap-2 text-caption text-muted-foreground">
                          <span className="truncate">{featureInfo(tag).hint ?? featureInfo(tag).label}</span>
                          <span dir="ltr" className="shrink-0 font-mono text-micro text-tertiary">
                            {tag}
                          </span>
                        </span>
                      </span>
                      <Switch
                        aria-label={`${tag} — ${featureInfo(tag).label}`}
                        checked={on}
                        onCheckedChange={(v) => set({ features: { ...settings.features, [tag]: v } })}
                      />
                    </label>
                    {/* أثر الميزة حين يغيّرها المستخدم: المحرف قبل ← بعد، و«جرّب» بنصّ يُظهرها */}
                    {changed && ot && (ot.pairs.length > 0 || ot.sample) && (
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div
                          role="group"
                          aria-label={`ما تغيّره ${tag}`}
                          className="flex min-w-0 items-center gap-2 overflow-hidden"
                        >
                          {ot.pairs.slice(0, 3).map((p) => (
                            <span key={`${p.from}-${p.to}`} className="flex shrink-0 items-center gap-0.5">
                              <GlyphShape font={active} gid={p.from} size={26} className="text-tertiary" />
                              <ArrowLeftIcon className="size-2.5 text-tertiary" />
                              <GlyphShape font={active} gid={p.to} size={26} />
                            </span>
                          ))}
                        </div>
                        {ot.sample && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0"
                            onClick={() => {
                              set({ text: ot.sample });
                              onTry();
                            }}
                          >
                            جرّب في النص
                          </Button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {engine.length > 0 && (
        <Collapsible open={engineOpen} onOpenChange={setEngineOpen} className="border-t pt-4">
          <CollapsibleTrigger className="flex w-full items-center justify-between text-control font-medium">
            <span>
              {GROUP_LABEL.engine.label} <span className="font-normal text-tertiary tabular-nums">{engine.length}</span>
            </span>
            <ChevronDownIcon
              className={cn('size-4 text-muted-foreground transition-transform', engineOpen && 'rotate-180')}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <p className="mb-2 text-caption text-muted-foreground">{GROUP_LABEL.engine.hint}</p>
            <ul className="flex flex-wrap gap-1.5">
              {engine.map((t) => (
                <li
                  key={t}
                  title={featureInfo(t).label}
                  dir="ltr"
                  className="rounded-full bg-sunken px-2.5 py-1 font-mono text-caption"
                >
                  {t}
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* للمطوّر: سطر CSS يعيد الإعداد نفسه في موقعه */}
      <div className="flex flex-col gap-2 border-t pt-4">
        <code
          dir="ltr"
          className="block truncate rounded-md bg-sunken px-3 py-2 text-left font-mono text-caption text-muted-foreground"
        >
          font-feature-settings: {css};
        </code>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              navigator.clipboard.writeText(`font-feature-settings: ${css};`).then(
                () => toast({ tone: 'success', title: 'نُسخ سطر CSS' }),
                () => toast({ tone: 'danger', title: 'تعذّر النسخ' }),
              )
            }
          >
            <CopyIcon />
            نسخ CSS
          </Button>
          <Button variant="ghost" size="sm" disabled={css === 'normal'} onClick={() => set({ features: {} })}>
            <RefreshIcon />
            الافتراضي
          </Button>
        </div>
      </div>
    </>
  );
}
