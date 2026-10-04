import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@/components/ui/icons';

import { featureGroup, featureInfo, featureSettings, GROUP_LABEL } from '../../data/features';
import { useLab } from '../../hooks/lab-context';
import { analyzeOpenType, LANG_INFO, SCRIPT_NAME } from '../../utils/opentype';
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

/**
 * جرد OpenType — ما في الملف بالتفصيل، تحت لوحة الاختبار: ملخّص، الكتابات واللغات، أثر كل ميزة
 * (قبل ← بعد وعيّنة مطفأة/مفعّلة)، الربطات، والبدائل. التفعيل نفسه في المفتش وحده؛ هنا «جرّب في النص».
 */
export function Features({ onTry }: { onTry?: (tag: string, sample: string) => void }) {
  const { active, settings, specimen } = useLab();
  const report = useMemo(() => (active ? analyzeOpenType(active) : null), [active]);
  if (!active || !report) return null;
  const tags = [...new Set(active.features.map((f) => f.tag))];
  const sets = report.features.filter((f) => /^(ss|cv)\d\d$/.test(f.tag)).length;
  const withFeature = (tag: string, on: boolean) =>
    specimen(active, { fontFeatureSettings: featureSettings(tags, { ...settings.features, [tag]: on }) });
  const visible = report.features.filter((f) => featureGroup(f.tag) !== 'engine' && (f.pairs.length || f.sample));

  return (
    <div className="flex flex-col gap-5">
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

      <Panel label="الكتابات واللغات" className="flex flex-wrap items-center gap-x-5 gap-y-2 p-5 text-meta">
        <span className="font-semibold">الكتابات واللغات في الملف</span>
        {report.scripts.map((sc) => (
          <span key={sc.tag} className="text-muted-foreground">
            {SCRIPT_NAME[sc.tag] ?? sc.tag}
            {sc.langs.length > 0 && (
              <span className="text-tertiary">
                {' '}
                ({sc.langs.map((l) => LANG_INFO[l]?.name ?? l).join('، ')})
              </span>
            )}
          </span>
        ))}
      </Panel>

      {visible.length > 0 && (
        <Panel label="أثر الميزات" className="p-5">
          <h3 className="mb-3 text-control font-semibold">ماذا تغيّر كل ميزة</h3>
          <ul className="grid gap-3 lg:grid-cols-2">
            {visible.map((f) => (
              <li key={f.tag} className="flex flex-col gap-3 rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-control font-medium">{f.name ?? featureInfo(f.tag).label}</p>
                    <p className="text-caption text-tertiary">
                      <span dir="ltr" className="font-mono">
                        {f.tag}
                      </span>{' '}
                      · {GROUP_LABEL[featureGroup(f.tag)].label} · {f.kind}
                      {f.name && ' · الاسم من الملف'}
                    </p>
                  </div>
                  {onTry && f.sample && (
                    <Button variant="outline" size="sm" className="shrink-0" onClick={() => onTry(f.tag, f.sample)}>
                      جرّب في النص
                    </Button>
                  )}
                </div>
                {f.pairs.length > 0 && (
                  <div role="group" aria-label={`ما تغيّره ${f.tag}`} className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    {f.pairs.slice(0, 6).map((p) => (
                      <span key={`${p.from}-${p.to}`} className="flex items-center gap-1">
                        <GlyphShape font={active} gid={p.from} size={40} className="text-tertiary" />
                        <ArrowLeftIcon className="size-3 text-tertiary" />
                        <GlyphShape font={active} gid={p.to} size={40} />
                      </span>
                    ))}
                    {f.pairs.length > 6 && <span className="text-caption text-tertiary tabular-nums">+{f.pairs.length - 6}</span>}
                  </div>
                )}
                {f.sample && (
                  <div className="grid grid-cols-2 gap-3 border-t pt-3 text-caption text-tertiary">
                    {[false, true].map((state) => (
                      <div key={String(state)} className="min-w-0">
                        <p>{state ? 'مفعّلة' : 'مطفأة'}</p>
                        <p lang={settings.lang || undefined} className="truncate text-2xl leading-relaxed text-foreground" style={withFeature(f.tag, state)}>
                          {f.sample}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      )}

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
              <li key={`${l.feature}-${l.glyph}-${l.text}`} className="flex flex-col items-center gap-1 rounded-md border p-2" title={`${l.text} · ${l.feature}`}>
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
                <GlyphShape font={active} gid={a.from} size={40} />
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
    </div>
  );
}
