import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { CheckIcon, CopyIcon, RefreshIcon } from '@/components/ui/icons';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';

import { featureInfo, featureOn, featureSettings } from '../../data/features';
import { DEFAULT_TEXT, useLab } from '../../hooks/lab-context';
import { Panel, RangeControl } from '../bits';

/** عيّنات تُظهر أثر الميزات — كل سطر يستهدف ميزات بعينها */
export const OT_SPECIMENS: [string, string][] = [
  [
    'متن طويل — المسافات والتقنين',
    'الخطُّ العربي لا يُقرأ حرفًا حرفًا، بل يُقرأ كتلًا متّصلة تتشكّل من وصل الحروف بعضها ببعض. أطفئ ميزة kern وراقب كيف تتباعد الأزواج، ثم أطفئ mark ولاحظ كيف تنزلق الحركات عن مواضعها.',
  ],
  ['الربطات واللام-ألف', 'لا لأ لإ لآ · اللهم · ألا · إلّا · لله · للكتاب · الأعلى · لائق · مسألة'],
  ['وصل طويل ومقاطع متّصلة', 'مستشفى · يستبشرون · تشتّت · بستنسخ · مُتَّصِل · سِلْسِلَة · تَشَابُك'],
  ['تشكيل كثيف وتراكب علامات — mark و mkmk', 'إِنَّ اللُّغَةَ العَرَبِيَّةَ جَمِيلَةٌ وَمُتَنَوِّعَةٌ · بَّ بِّ بُّ بٌّ · مُّ لَّا'],
  ['حروف غير عربية وأشكال محلّية — locl', 'پ چ ژ گ ڤ ڕ ۆ ێ · نووسینی کوردی · نوشتن فارسی'],
  ['أرقام وعملات وترقيم', '٠١٢٣٤٥٦٧٨٩ · 0123456789 · ١٢٬٥٠٠ · $25,000 · IQD 25,000 · ٤٥٪'],
  ['ترقيم وأقواس ومزج لاتيني', '«اقتباس» — (قوسان) [معقوفان] {حاصرتان} … ؟ ! ؛ · Harf Library · OpenType · v1.001'],
];

export function Features() {
  const { active, settings, set, specimen } = useLab();
  const [size, setSize] = useState(32);
  if (!active) return null;
  const tags = active.features.map((f) => f.tag);
  const groups = [
    { key: 'engine', label: 'يديرها محرّك التشكيل', hint: 'تعمل تلقائياً للعربية — لا تُطفأ' },
    { key: 'on', label: 'مفعّلة افتراضياً', hint: 'أطفئها لترى أثرها' },
    { key: 'opt', label: 'اختيارية', hint: 'شغّلها لتظهر' },
  ] as const;
  const inGroup = (g: (typeof groups)[number]['key']) =>
    active.features.filter((f) => (featureInfo(f.tag).mode ?? 'opt') === g);
  const css = featureSettings(tags, settings.features);

  return (
    <div className="flex flex-col gap-5">
      {groups.map((g) => {
        const list = inGroup(g.key);
        if (!list.length) return null;
        return (
          <Panel key={g.key} label={g.label} className="p-5">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h3 className="text-control font-semibold">
                {g.label}{' '}
                <span className="font-normal text-tertiary tabular-nums">{list.length}</span>
              </h3>
              <span className="text-caption text-muted-foreground">{g.hint}</span>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((f) => {
                const info = featureInfo(f.tag);
                const on = featureOn(f.tag, settings.features);
                return (
                  <li key={f.tag}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-md border px-3.5 py-2.5 transition-colors hover:border-strong has-[:disabled]:cursor-default has-[:disabled]:hover:border-border">
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span dir="ltr" className="font-mono text-control font-semibold">
                            {f.tag}
                          </span>
                          <span className="rounded-xs bg-sunken px-1.5 py-0.5 font-mono text-micro text-tertiary">
                            {f.table}
                          </span>
                        </span>
                        <span className="block truncate text-caption text-muted-foreground">{info.label}</span>
                      </span>
                      {g.key === 'engine' ? (
                        <CheckIcon className="size-4 text-ok-text" aria-label="مفعّلة دائماً" />
                      ) : (
                        <Switch
                          aria-label={`${f.tag} — ${info.label}`}
                          checked={on}
                          onCheckedChange={(v) => set({ features: { ...settings.features, [f.tag]: v } })}
                        />
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          </Panel>
        );
      })}

      <Panel label="الإعداد الحالي" className="flex flex-wrap items-center gap-3 px-5 py-3.5">
        <code dir="ltr" className="min-w-0 flex-1 truncate text-left font-mono text-caption text-muted-foreground">
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
          نسخ
        </Button>
        <Button variant="ghost" size="sm" disabled={css === 'normal'} onClick={() => set({ features: {} })}>
          <RefreshIcon />
          الافتراضي
        </Button>
      </Panel>

      <Panel label="عيّنات الميزات" className="overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b px-5 py-3">
          <p className="text-4xl leading-snug" style={specimen(active)}>
            {DEFAULT_TEXT}
          </p>
          <RangeControl label="الحجم" value={size} min={18} max={64} onChange={setSize} className="w-48 shrink-0" />
        </div>
        <div className="divide-y">
          {OT_SPECIMENS.map(([label, text]) => (
            <div key={label} className="px-5 py-4">
              <p className="mb-1.5 text-caption text-tertiary">{label}</p>
              <p className="leading-[1.9]" style={specimen(active, { fontSize: size })}>
                {text}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
