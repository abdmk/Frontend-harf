import { type ReactNode, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeftIcon, ChevronDownIcon, CopyIcon, RefreshIcon } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';

import { GlyphShape, Panel, RangeControl } from './bits';
import {
  type FeatureGroup,
  featureGroup,
  featureInfo,
  featureOn,
  featureSettings,
  GROUP_LABEL,
} from '../data/features';
import { ALIGN, SWATCHES } from '../data/presets';
import { useLab } from '../hooks/lab-context';
import type { LabFont } from '../types';
import { analyzeOpenType, LANG_INFO } from '../utils/opentype';

/** أنماط عائلة الخط النشط بترتيب الوزن */
export function useFamily() {
  const { fonts, active } = useLab();
  const family = active ? fonts.filter((f) => f.family === active.family) : [];
  return family.sort((a, b) => a.weight - b.weight || Number(a.italic) - Number(b.italic));
}

export const styleLabel = (f: LabFont) => (f.italic && !/italic/i.test(f.style) ? `${f.style} Italic` : f.style);

function Field({ label, value, children }: { label: string; value?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2.5">
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

/**
 * بطاقة إعدادات فوق المعاينة — كل أدوات المختبر تبدأ بها بالشكل نفسه، فيعرف المستخدم أين يضبط.
 * children: عناصر التحكّم؛ actions: أزرار ثانوية في الطرف.
 */
export function ControlsCard({
  label,
  children,
  actions,
  className,
}: {
  label: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <Panel label={label} className={cn('flex flex-col gap-5 p-5', className)}>
      {children}
      {actions && <div className="-mb-1 flex flex-wrap items-center gap-1 border-t pt-3">{actions}</div>}
    </Panel>
  );
}

/** حجم المعاينة — واحد لكل الأدوات (settings.size)، بحدود تناسب كل عرض */
export function SizeField({
  min = 16,
  max = 120,
  label = 'حجم المعاينة',
}: {
  min?: number;
  max?: number;
  label?: string;
}) {
  const { settings, set } = useLab();
  const value = Math.min(max, Math.max(min, settings.size));
  return <RangeControl label={label} value={value} min={min} max={max} onChange={(size) => set({ size })} />;
}

/** نص المعاينة — واحد لكل الأدوات (settings.text) */
export function TextField({ label = 'نص المعاينة' }: { label?: string }) {
  const { settings, set } = useLab();
  return (
    <label className="flex min-w-0 flex-col gap-2.5">
      <span className="text-caption font-medium">{label}</span>
      <Input value={settings.text} onChange={(e) => set({ text: e.target.value.slice(0, 2000) })} dir="auto" />
    </label>
  );
}

/* ───────────────────────── إعدادات العيّنة ───────────────────────── */

/**
 * إعدادات عيّنة النص: النمط والحجم والسطر والمحاذاة ظاهرة — هي ما يُضبط في كل تجربة —
 * والنادر (التباعد، العرض، المحاور الأخرى، الألوان، لغة النص) مطويّ في المكان نفسه.
 */
export function TextControls() {
  const [more, setMore] = useState(false);
  return (
    <Panel label="إعدادات العيّنة" className="flex flex-col">
      <div className="p-5">
        <PrimaryTextControls className="grid grid-cols-2 gap-x-6 gap-y-5 sm:gap-x-8 xl:grid-cols-4" />
      </div>

      {/* ما يُضبط أقلّ — مطويّ في المكان نفسه، لا قائمة منبثقة */}
      <Collapsible open={more} onOpenChange={setMore} className="border-t">
        <CollapsibleTrigger className="flex h-11 w-full items-center justify-between px-5 text-control font-medium text-muted-foreground transition-colors hover:text-foreground">
          إعدادات متقدّمة
          <ChevronDownIcon className={cn('size-4 transition-transform', more && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-5 pt-1 pb-5">
          <AdvancedTextControls />
        </CollapsibleContent>
      </Collapsible>
    </Panel>
  );
}

/** ما يُضبط في كل تجربة: النمط (أو محور الوزن)، الحجم، ارتفاع السطر، المحاذاة — التخطيط من المستدعي */
export function PrimaryTextControls({ className }: { className?: string }) {
  const { active, settings: s, set, setActive } = useLab();
  const family = useFamily();
  if (!active) return null;
  const wght = active.axes.find((a) => a.tag === 'wght');
  return (
    <div className={className}>
      {/* النمط: ملفات العائلة الحقيقية — لا وزن يصطنعه المتصفّح */}
      {!wght && family.length > 1 && (
        <Field label="النمط" value={active.weight}>
          <Select value={active.id} onValueChange={setActive}>
            <SelectTrigger aria-label="النمط" className="h-9 w-full rounded-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {family.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  <span dir="ltr">{styleLabel(f)}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
      {wght && (
        <Field label="الوزن" value={Math.round(s.axes.wght ?? wght.default)}>
          <Slider
            aria-label="الوزن"
            value={[s.axes.wght ?? wght.default]}
            min={wght.min}
            max={wght.max}
            onValueChange={([v]) => v !== undefined && set({ axes: { ...s.axes, wght: v } })}
          />
        </Field>
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
        <div role="group" aria-label="المحاذاة" className="grid h-9 grid-cols-4 gap-1 rounded-full bg-sunken p-1">
          {ALIGN.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              aria-label={label}
              title={label}
              aria-pressed={s.align === value}
              onClick={() => set({ align: value })}
              className="grid place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-soft"
            >
              <Icon filled="auto" className="size-4" />
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
}

/** الإعدادات النادرة: التباعد، العرض، المحاور الأخرى، الألوان، لغة النص، وإعادة الإعدادات */
export function AdvancedTextControls({ columns = 'sm:grid-cols-2 xl:grid-cols-3' }: { columns?: string }) {
  const { active, settings: s, set, resetSettings } = useLab();
  if (!active) return null;
  const otherAxes = active.axes.filter((a) => a.tag !== 'wght');
  const langs = analyzeOpenType(active)
    .scripts.flatMap((sc) => sc.langs)
    .filter((l, i, a) => a.indexOf(l) === i && LANG_INFO[l]);
  return (
    <div className="flex flex-col gap-6">
      <div className={cn('grid gap-x-8 gap-y-5', columns)}>
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
      </div>
      <div className="flex flex-wrap gap-x-10 gap-y-5">
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
      </div>
      <Button variant="ghost" size="sm" onClick={resetSettings} className="self-start">
        <RefreshIcon />
        إعادة الإعدادات
      </Button>
    </div>
  );
}

/* ───────────────────────── OpenType ───────────────────────── */

const ORDER: FeatureGroup[] = ['style', 'liga', 'num', 'space'];

/** سطر CSS الحالي، ونسخه وإعادته للافتراضي — في أعلى أداة OpenType */
export function FeatureCssActions() {
  const { active, settings, set } = useLab();
  if (!active) return null;
  const css = featureSettings([...new Set(active.features.map((f) => f.tag))], settings.features);
  return (
    <>
      <code
        dir="ltr"
        className="me-auto block max-w-full min-w-0 truncate rounded-md bg-sunken px-3 py-1.5 text-left font-mono text-caption text-muted-foreground"
      >
        font-feature-settings: {css};
      </code>
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
    </>
  );
}

/**
 * مفاتيح ميزات الملف — بطاقات صغيرة مجمّعة حسب الغرض، باسم الميزة من الملف ومفتاحها.
 * المغيّرة تكشف ما تغيّره (قبل ← بعد)، و«جرّب في العيّنة» يضع نصاً يُظهرها.
 */
export function OpenTypeToggles({ onTry }: { onTry: (tag: string, sample: string) => void }) {
  const { active, settings, set } = useLab();
  const [engineOpen, setEngineOpen] = useState(false);
  if (!active) return null;
  const report = analyzeOpenType(active);
  const byTag = new Map(report.features.map((f) => [f.tag, f]));
  const tags = [...new Set(active.features.map((f) => f.tag))];
  const tableOf = new Map(active.features.map((f) => [f.tag, f.table]));
  const engine = tags.filter((t) => featureGroup(t) === 'engine');

  if (!tags.length)
    return (
      <Panel label="لا ميزات" className="p-6 text-meta text-muted-foreground">
        هذا الملف بلا ميزات OpenType — ما تراه هو الرسم الأساسي للحروف.
      </Panel>
    );

  return (
    <div className="flex flex-col gap-6">
      {ORDER.map((g) => {
        const list = tags.filter((t) => featureGroup(t) === g);
        if (!list.length) return null;
        return (
          <section key={g} aria-label={GROUP_LABEL[g].label}>
            <div className="mb-3 flex flex-wrap items-baseline gap-x-2">
              <h3 className="text-control font-semibold">
                {GROUP_LABEL[g].label} <span className="font-normal text-tertiary tabular-nums">{list.length}</span>
              </h3>
              <p className="text-caption text-muted-foreground">{GROUP_LABEL[g].hint}</p>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((tag) => {
                const ot = byTag.get(tag);
                const on = featureOn(tag, settings.features);
                const name = ot?.name ?? featureInfo(tag).label;
                const changed = tag in settings.features;
                return (
                  <li
                    key={tag}
                    className={cn(
                      'flex flex-col rounded-lg border bg-card p-3.5 transition-colors',
                      on && featureInfo(tag).mode !== 'on' && 'border-primary/40 bg-tint-brand/40',
                    )}
                  >
                    <label className="flex cursor-pointer items-start gap-3">
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span dir="ltr" className="font-mono text-caption font-semibold">
                            {tag}
                          </span>
                          {tableOf.get(tag) && (
                            <span className="rounded-xs bg-sunken px-1.5 font-mono text-micro leading-4 text-tertiary">
                              {tableOf.get(tag)}
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block truncate text-control" title={name}>
                          {name}
                        </span>
                        <span className="block truncate text-caption text-muted-foreground">
                          {featureInfo(tag).hint ?? featureInfo(tag).label}
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
                      <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
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
                          <Button variant="ghost" size="sm" className="shrink-0" onClick={() => onTry(tag, ot.sample)}>
                            جرّب في العيّنة
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
        <Collapsible open={engineOpen} onOpenChange={setEngineOpen} className="rounded-lg border bg-card">
          <CollapsibleTrigger className="flex h-12 w-full items-center justify-between px-4 text-control font-medium">
            <span>
              {GROUP_LABEL.engine.label} <span className="font-normal text-tertiary tabular-nums">{engine.length}</span>
            </span>
            <ChevronDownIcon
              className={cn('size-4 text-muted-foreground transition-transform', engineOpen && 'rotate-180')}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
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
    </div>
  );
}
