import { useMemo, useState } from 'react';


import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, CheckIcon, CopyIcon, RefreshIcon } from '@/components/ui/icons';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';

import { featureInfo, featureOn, featureSettings } from '../../data/features';
import { DEFAULT_TEXT, useLab } from '../../hooks/lab-context';
import { LANG_INFO, SCRIPT_NAME, analyzeOpenType } from '../../utils/opentype';
import { GlyphShape, Panel } from '../bits';

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
  // الحجم من شريط المختبر (واحد لكل المشاهد)، محصوراً بما يناسب هذا العرض
  const size = Math.min(64, Math.max(18, settings.size));
  const [lang, setLang] = useState('');
  const report = useMemo(() => (active ? analyzeOpenType(active) : null), [active]);
  if (!active || !report) return null;
  const tags = active.features.map((f) => f.tag);
  const css = featureSettings(tags, settings.features);
  const byTag = new Map(report.features.map((f) => [f.tag, f]));
  const groups = [
    { key: 'opt', label: 'اختيارية', hint: 'مطفأة افتراضياً — شغّلها لتظهر' },
    { key: 'on', label: 'مفعّلة افتراضياً', hint: 'أطفئها لترى أثرها' },
    { key: 'engine', label: 'يديرها محرّك التشكيل', hint: 'تعمل تلقائياً للعربية — لا تُطفأ' },
  ] as const;
  const inGroup = (g: (typeof groups)[number]['key']) =>
    active.features.filter((f) => (featureInfo(f.tag).mode ?? 'opt') === g);
  const langs = report.scripts.flatMap((sc) => sc.langs).filter((l, i, a) => a.indexOf(l) === i && LANG_INFO[l]);
  const sets = report.features.filter((f) => /^(ss|cv)\d\d$/.test(f.tag)).length;
  /** نمط عيّنة بميزة واحدة مُجبرة — البقية كما في الإعداد الحالي */
  const withFeature = (tag: string, on: boolean, extra?: React.CSSProperties) =>
    specimen(active, { fontFeatureSettings: featureSettings(tags, { ...settings.features, [tag]: on }), ...extra });

  return (
    <div className="flex flex-col gap-5">
      {/* ملخّص ما في الملف — الأرقام نفسها مقروءة من جداول GSUB/GPOS */}
      <Panel label="ملخّص OpenType" className="grid grid-cols-2 divide-y sm:grid-cols-4 sm:divide-y-0 sm:divide-x">
        {(
          [
            ['ميزات', report.features.length],
            ['مجموعات أسلوبية وبدائل حروف', sets],
            ['ربطات', report.ligatures.length],
            ['حروف لها بدائل', report.alternates.length],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="flex flex-col-reverse gap-0.5 px-5 py-4">
            <span className="text-caption text-muted-foreground">{k}</span>
            <span className="text-xl font-semibold tabular-nums">{v}</span>
          </div>
        ))}
      </Panel>

      {/* الكتابات واللغات المعرّفة في الملف — واختيار اللغة يُظهر الأشكال المحلّية (locl) */}
      <Panel label="الكتابات واللغات" className="flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-meta">
          <span className="font-semibold">الكتابات في الملف:</span>
          {report.scripts.map((sc) => (
            <span key={sc.tag} className="text-muted-foreground">
              {SCRIPT_NAME[sc.tag] ?? sc.tag}{' '}
              <span dir="ltr" className="font-mono text-caption text-tertiary">
                {sc.tag}
              </span>
            </span>
          ))}
        </div>
        {langs.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-meta text-muted-foreground">اعرض العيّنات بلغة:</span>
            <div role="radiogroup" aria-label="لغة العيّنات" className="flex flex-wrap gap-1">
              {['', ...langs].map((l) => (
                <button
                  key={l || 'default'}
                  type="button"
                  role="radio"
                  aria-checked={lang === (l ? LANG_INFO[l]!.bcp : '')}
                  onClick={() => setLang(l ? LANG_INFO[l]!.bcp : '')}
                  className="h-8 rounded-full border px-3 text-caption text-muted-foreground transition-colors hover:text-foreground aria-checked:border-primary aria-checked:bg-tint-brand aria-checked:text-primary"
                >
                  {l ? LANG_INFO[l]!.name : 'الافتراضية'}
                </button>
              ))}
            </div>
          </div>
        )}
      </Panel>

      {groups.map((g) => {
        const list = inGroup(g.key);
        if (!list.length) return null;
        const engine = g.key === 'engine';
        return (
          <Panel key={g.key} label={g.label} className="p-5">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h3 className="text-control font-semibold">
                {g.label}{' '}
                <span className="font-normal text-tertiary tabular-nums">{list.length}</span>
              </h3>
              <span className="text-caption text-muted-foreground">{g.hint}</span>
            </div>
            <ul className={cn('grid gap-3', engine ? 'sm:grid-cols-2 xl:grid-cols-4' : 'lg:grid-cols-2')}>
              {list.map((f) => {
                const info = featureInfo(f.tag);
                const ot = byTag.get(f.tag);
                const on = featureOn(f.tag, settings.features);
                const title = ot?.name ?? info.label;
                return (
                  <li key={f.tag} className="flex flex-col rounded-lg border">
                    <label className="flex cursor-pointer items-center gap-3 px-4 py-3 has-[:disabled]:cursor-default">
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span dir="ltr" className="font-mono text-control font-semibold">
                            {f.tag}
                          </span>
                          <span className="rounded-xs bg-sunken px-1.5 py-0.5 font-mono text-micro text-tertiary">
                            {f.table}
                          </span>
                          {ot && !engine && (
                            <span className="rounded-xs bg-sunken px-1.5 py-0.5 text-micro text-tertiary">{ot.kind}</span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-caption text-muted-foreground" title={title}>
                          {title}
                          {ot?.name && <span className="text-tertiary"> · الاسم من الملف</span>}
                        </span>
                      </span>
                      {engine ? (
                        <CheckIcon className="size-4 text-ok-text" aria-label="مفعّلة دائماً" />
                      ) : (
                        <Switch
                          aria-label={`${f.tag} — ${info.label}`}
                          checked={on}
                          onCheckedChange={(v) => set({ features: { ...settings.features, [f.tag]: v } })}
                        />
                      )}
                    </label>

                    {/* ماذا تغيّر بالضبط: المحرف قبل ← بعد من الملف، ثم الأثر في نص */}
                    {!engine && ot && (ot.pairs.length > 0 || ot.sample) && (
                      <div className="flex flex-col gap-3 border-t bg-sunken/40 px-4 py-3">
                        {ot.pairs.length > 0 && (
                          <div
                            role="group"
                            className="flex flex-wrap items-center gap-x-3 gap-y-2"
                            aria-label={`ما تغيّره ${f.tag}`}
                          >
                            {ot.pairs.slice(0, 6).map((p) => (
                              <span key={`${p.from}-${p.to}`} className="flex items-center gap-1 text-muted-foreground">
                                <GlyphShape font={active} gid={p.from} size={30} className="text-tertiary" />
                                <ArrowLeftIcon className="size-3" />
                                <GlyphShape font={active} gid={p.to} size={30} className="text-foreground" />
                              </span>
                            ))}
                            {ot.pairs.length > 6 && (
                              <span className="text-caption text-tertiary tabular-nums">+{ot.pairs.length - 6}</span>
                            )}
                          </div>
                        )}
                        {ot.sample && (
                          <div className="grid grid-cols-2 gap-3 text-caption text-tertiary">
                            {[false, true].map((state) => (
                              <div key={String(state)} className="min-w-0">
                                <p>{state ? 'مفعّلة' : 'مطفأة'}</p>
                                <p
                                  lang={lang || undefined}
                                  className="truncate text-2xl leading-relaxed text-foreground"
                                  style={withFeature(f.tag, state)}
                                >
                                  {ot.sample}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Panel>
        );
      })}

      {report.ligatures.length > 0 && (
        <Panel label="الربطات" className="p-5">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h3 className="text-control font-semibold">
              الربطات <span className="font-normal text-tertiary tabular-nums">{report.ligatures.length}</span>
            </h3>
            <span className="text-caption text-muted-foreground">كل محرف مركّب في الملف، والحروف التي تكوّنه</span>
          </div>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
            {report.ligatures.slice(0, 64).map((l) => (
              <li
                key={`${l.feature}-${l.glyph}-${l.text}`}
                className="flex flex-col items-center gap-1 rounded-md border p-2"
                title={`${l.text} · ${l.feature}`}
              >
                <GlyphShape font={active} gid={l.glyph} size={40} label={`ربطة ${l.text}`} />
                <span className="max-w-full truncate text-caption text-muted-foreground">{l.text}</span>
                <span dir="ltr" className="font-mono text-micro text-tertiary">
                  {l.feature}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {report.alternates.length > 0 && (
        <Panel label="مستكشف البدائل" className="p-5">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h3 className="text-control font-semibold">
              مستكشف البدائل <span className="font-normal text-tertiary tabular-nums">{report.alternates.length}</span>
            </h3>
            <span className="text-caption text-muted-foreground">الحرف وكل بدائله المرسومة في الملف</span>
          </div>
          <ul className="flex flex-col divide-y">
            {report.alternates.slice(0, 40).map((a) => (
              <li key={a.from} className="flex items-center gap-4 py-2.5">
                <GlyphShape font={active} gid={a.from} size={40} className="text-foreground" />
                <ArrowLeftIcon className="size-4 shrink-0 text-tertiary" />
                <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                  {a.to.map((g) => (
                    <GlyphShape key={g} font={active} gid={g} size={40} />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}

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
